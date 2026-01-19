// Daily Task Automation - Overdue Task Escalation
// Runs every day at 9:00 AM to identify and escalate overdue tasks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  progress: number;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface EscalationResult {
  escalated: number;
  notifications: Array<{
    taskId: string;
    escalatedTo: string;
    reason: string;
    daysOverdue: number;
    message: string;
  }>;
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

    // Fetch all overdue tasks (past due date, not completed)
    const today = new Date().toISOString().split('T')[0];
    const { data: overdueTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .lt("due_date", today)
      .in("status", ["todo", "in_progress"])
      .order("due_date", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch tasks: ${fetchError.message}`);
    }

    if (!overdueTasks || overdueTasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          escalated: 0,
          notifications: [],
          message: "No overdue tasks found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Analyze each task for escalation
    const escalationResults: EscalationResult = {
      escalated: 0,
      notifications: [],
    };

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY not set, using rule-based escalation");
    }

    for (const task of overdueTasks) {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(task.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Rule-based escalation criteria
      let shouldEscalate = false;
      let reason = "";

      if (task.priority === "critical" && daysOverdue > 1) {
        shouldEscalate = true;
        reason = `Critical task overdue ${daysOverdue} days - immediate attention required`;
      } else if (task.priority === "high" && daysOverdue > 3) {
        shouldEscalate = true;
        reason = `High priority task overdue ${daysOverdue} days - escalation needed`;
      } else if (task.priority === "medium" && daysOverdue > 7) {
        shouldEscalate = true;
        reason = `Medium priority task overdue ${daysOverdue} days`;
      } else if (task.progress < 20 && daysOverdue > 2) {
        shouldEscalate = true;
        reason = `Task ${daysOverdue} days overdue with minimal progress (${task.progress}%)`;
      }

      if (shouldEscalate) {
        // Log escalation to task_activity
        const { error: activityError } = await supabase
          .from("task_activity")
          .insert({
            task_id: task.id,
            activity_type: "escalation",
            description: `Task automatically escalated: ${reason}`,
            metadata: {
              automated: true,
              daysOverdue,
              priority: task.priority,
              progress: task.progress,
              timestamp: new Date().toISOString(),
            },
          });

        if (activityError) {
          console.error(`Failed to log activity for task ${task.id}:`, activityError);
        }

        // Update task status/metadata if needed
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            metadata: {
              ...(task.metadata || {}),
              escalated: true,
              escalatedAt: new Date().toISOString(),
              escalationReason: reason,
            },
          })
          .eq("id", task.id);

        if (updateError) {
          console.error(`Failed to update task ${task.id}:`, updateError);
        }

        escalationResults.escalated++;
        escalationResults.notifications.push({
          taskId: task.id,
          escalatedTo: "Project Manager",
          reason,
          daysOverdue,
          message: `Task requires immediate attention and possible reassignment`,
        });
      }
    }

    // Log automation run
    const { error: logError } = await supabase
      .from("automation_logs")
      .insert({
        automation_type: "daily_escalation",
        executed_at: new Date().toISOString(),
        result: {
          tasksAnalyzed: overdueTasks.length,
          tasksEscalated: escalationResults.escalated,
        },
        success: true,
      });

    if (logError) {
      console.error("Failed to log automation run:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        ...escalationResults,
        tasksAnalyzed: overdueTasks.length,
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
