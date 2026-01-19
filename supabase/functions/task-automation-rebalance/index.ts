// Weekly Task Automation - Workload Rebalancing
// Runs every Monday at 10:00 AM to analyze team workload and suggest reassignments

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkloadAnalysis {
  userId: string;
  userName: string;
  assignedTasks: number;
  totalEstimatedHours: number;
  capacity: number; // percentage
  status: "overloaded" | "balanced" | "underutilized";
}

interface Reassignment {
  taskId: string;
  taskTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all active tasks (not completed)
    const { data: activeTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .in("status", ["todo", "in_progress"])
      .not("assigned_to_id", "is", null);

    if (tasksError) {
      throw new Error(`Failed to fetch tasks: ${tasksError.message}`);
    }

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email");

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!activeTasks || activeTasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reassignments: [],
          message: "No active tasks found for analysis",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          reassignments: [],
          message: "No users found for workload analysis",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate workload for each user
    const workloadByUser = new Map<string, WorkloadAnalysis>();

    // Initialize workload for all users
    users.forEach(user => {
      workloadByUser.set(user.id, {
        userId: user.id,
        userName: user.name || user.email,
        assignedTasks: 0,
        totalEstimatedHours: 0,
        capacity: 0,
        status: "balanced",
      });
    });

    // Calculate actual workload
    activeTasks.forEach(task => {
      if (task.assigned_to_id) {
        const workload = workloadByUser.get(task.assigned_to_id);
        if (workload) {
          workload.assignedTasks++;
          workload.totalEstimatedHours += task.estimated_hours || 8; // Default 8 hours if not set
        }
      }
    });

    // Determine capacity and status (assuming 40 hour work week)
    const WEEKLY_HOURS = 40;
    workloadByUser.forEach(workload => {
      workload.capacity = (workload.totalEstimatedHours / WEEKLY_HOURS) * 100;

      if (workload.capacity > 100) {
        workload.status = "overloaded";
      } else if (workload.capacity < 50) {
        workload.status = "underutilized";
      } else {
        workload.status = "balanced";
      }
    });

    // Find overloaded and underutilized team members
    const overloaded = Array.from(workloadByUser.values())
      .filter(w => w.status === "overloaded")
      .sort((a, b) => b.capacity - a.capacity);

    const underutilized = Array.from(workloadByUser.values())
      .filter(w => w.status === "underutilized")
      .sort((a, b) => a.capacity - b.capacity);

    const reassignments: Reassignment[] = [];

    // Suggest reassignments
    if (overloaded.length > 0 && underutilized.length > 0) {
      for (const overloadedUser of overloaded) {
        // Get tasks assigned to overloaded user, sorted by priority (lower priority first)
        const userTasks = activeTasks
          .filter(t => t.assigned_to_id === overloadedUser.userId)
          .sort((a, b) => {
            const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
            return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
          });

        for (const task of userTasks) {
          // Find best underutilized user
          const bestCandidate = underutilized.find(u => u.capacity < 80);

          if (bestCandidate && overloadedUser.capacity > 100) {
            const taskHours = task.estimated_hours || 8;

            reassignments.push({
              taskId: task.id,
              taskTitle: task.title,
              fromUserId: overloadedUser.userId,
              fromUserName: overloadedUser.userName,
              toUserId: bestCandidate.userId,
              toUserName: bestCandidate.userName,
              reasoning: `${overloadedUser.userName} is at ${Math.round(overloadedUser.capacity)}% capacity while ${bestCandidate.userName} is at ${Math.round(bestCandidate.capacity)}%. Reassigning would help balance workload.`,
            });

            // Update capacities for next iteration
            overloadedUser.capacity = ((overloadedUser.totalEstimatedHours - taskHours) / WEEKLY_HOURS) * 100;
            overloadedUser.totalEstimatedHours -= taskHours;
            bestCandidate.capacity = ((bestCandidate.totalEstimatedHours + taskHours) / WEEKLY_HOURS) * 100;
            bestCandidate.totalEstimatedHours += taskHours;

            // Log suggestion to task_activity
            const { error: activityError } = await supabase
              .from("task_activity")
              .insert({
                task_id: task.id,
                activity_type: "workload_reassignment_suggestion",
                description: `Workload rebalancing suggested: reassign to ${bestCandidate.userName}`,
                metadata: {
                  automated: true,
                  fromUser: overloadedUser.userName,
                  toUser: bestCandidate.userName,
                  fromCapacity: overloadedUser.capacity,
                  toCapacity: bestCandidate.capacity,
                  timestamp: new Date().toISOString(),
                },
              });

            if (activityError) {
              console.error(`Failed to log activity for task ${task.id}:`, activityError);
            }

            // Stop if workload is balanced
            if (overloadedUser.capacity <= 100) {
              break;
            }
          }
        }
      }
    }

    // Calculate expected improvement
    const maxCapacityBefore = Math.max(...Array.from(workloadByUser.values()).map(w => w.capacity));
    const expectedImprovement = reassignments.length > 0
      ? `Rebalancing would reduce max capacity from ${Math.round(maxCapacityBefore)}% to approximately ${Math.round(Math.min(100, maxCapacityBefore - 20))}%`
      : "Workload is already balanced";

    // Log automation run
    const { error: logError } = await supabase
      .from("automation_logs")
      .insert({
        automation_type: "weekly_workload_rebalancing",
        executed_at: new Date().toISOString(),
        result: {
          usersAnalyzed: users.length,
          tasksAnalyzed: activeTasks.length,
          overloadedUsers: overloaded.length,
          underutilizedUsers: underutilized.length,
          reassignmentsSuggested: reassignments.length,
        },
        success: true,
      });

    if (logError) {
      console.error("Failed to log automation run:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        reassignments,
        expectedImprovement,
        workloadSummary: {
          overloadedUsers: overloaded.length,
          balancedUsers: Array.from(workloadByUser.values()).filter(w => w.status === "balanced").length,
          underutilizedUsers: underutilized.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Automation error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
