// Weekly Task Automation - AI Task Digest
// Runs every Sunday at 6:00 PM to generate personalized weekly summaries for team members

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WeeklyDigest {
  userId: string;
  userName: string;
  focusTasks: Array<{
    id: string;
    title: string;
    priority: string;
    dueDate: string;
  }>;
  watchOutFor: Array<{
    taskId: string;
    taskTitle: string;
    warning: string;
  }>;
  completedHighlights: Array<{
    taskId: string;
    taskTitle: string;
    praise: string;
  }>;
  suggestions: string[];
  weekSummary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    upcomingDeadlines: number;
  };
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

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email");

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          digests: [],
          message: "No users found for digest generation",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate date ranges
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAhead = new Date();
    oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);

    const digests: WeeklyDigest[] = [];

    // Generate digest for each user
    for (const user of users) {
      // Fetch all tasks for this user
      const { data: userTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to_id", user.id);

      if (tasksError) {
        console.error(`Failed to fetch tasks for user ${user.id}:`, tasksError);
        continue;
      }

      if (!userTasks || userTasks.length === 0) {
        continue;
      }

      // Categorize tasks
      const activeTasks = userTasks.filter(t => t.status !== "completed" && t.status !== "cancelled");
      const completedThisWeek = userTasks.filter(t =>
        t.status === "completed" &&
        new Date(t.updated_at) >= oneWeekAgo
      );
      const inProgressTasks = userTasks.filter(t => t.status === "in_progress");
      const upcomingDeadlines = activeTasks.filter(t =>
        t.due_date &&
        new Date(t.due_date) <= oneWeekAhead &&
        new Date(t.due_date) >= today
      );

      // Identify focus tasks (high priority, due soon)
      const focusTasks = activeTasks
        .filter(t =>
          (t.priority === "critical" || t.priority === "high") ||
          (t.due_date && new Date(t.due_date) <= oneWeekAhead)
        )
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        })
        .slice(0, 5)
        .map(t => ({
          id: t.id,
          title: t.title,
          priority: t.priority,
          dueDate: t.due_date,
        }));

      // Identify tasks to watch out for
      const watchOutFor = activeTasks
        .filter(t => {
          const daysUntilDue = t.due_date
            ? Math.ceil((new Date(t.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : null;

          return (
            (daysUntilDue !== null && daysUntilDue <= 2 && t.progress < 70) ||
            (t.progress < 30 && t.status === "in_progress") ||
            (daysUntilDue !== null && daysUntilDue < 0)
          );
        })
        .slice(0, 3)
        .map(t => {
          const daysUntilDue = t.due_date
            ? Math.ceil((new Date(t.due_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            : null;

          let warning = "";
          if (daysUntilDue !== null && daysUntilDue < 0) {
            warning = `Overdue by ${Math.abs(daysUntilDue)} days`;
          } else if (daysUntilDue !== null && daysUntilDue <= 2 && t.progress < 70) {
            warning = `Due in ${daysUntilDue} days but only ${t.progress}% complete`;
          } else if (t.progress < 30) {
            warning = `Minimal progress (${t.progress}%) on in-progress task`;
          }

          return {
            taskId: t.id,
            taskTitle: t.title,
            warning,
          };
        });

      // Highlight completed tasks
      const completedHighlights = completedThisWeek
        .slice(0, 3)
        .map(t => {
          let praise = "Great work completing this task!";

          if (t.due_date) {
            const dueDate = new Date(t.due_date);
            const completedDate = new Date(t.updated_at);
            const daysEarly = Math.floor((dueDate.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysEarly > 2) {
              praise = `Completed ${daysEarly} days ahead of schedule!`;
            } else if (daysEarly >= 0) {
              praise = "Completed on time!";
            }
          }

          if (t.priority === "critical") {
            praise += " Critical task handled excellently.";
          }

          return {
            taskId: t.id,
            taskTitle: t.title,
            praise,
          };
        });

      // Generate suggestions
      const suggestions: string[] = [];

      if (activeTasks.length > 10) {
        suggestions.push("Consider delegating some lower-priority tasks to maintain focus");
      }

      if (upcomingDeadlines.length > 5) {
        suggestions.push("You have multiple deadlines next week - schedule check-in with manager to prioritize");
      }

      if (watchOutFor.length > 0) {
        suggestions.push("Focus on at-risk tasks first thing Monday morning");
      }

      if (completedThisWeek.length >= 5) {
        suggestions.push("Great productivity this week! Keep up the momentum");
      } else if (completedThisWeek.length === 0 && inProgressTasks.length > 0) {
        suggestions.push("Try to complete at least one task this week to maintain progress");
      }

      const digest: WeeklyDigest = {
        userId: user.id,
        userName: user.name || user.email,
        focusTasks,
        watchOutFor,
        completedHighlights,
        suggestions,
        weekSummary: {
          totalTasks: activeTasks.length,
          completedTasks: completedThisWeek.length,
          inProgressTasks: inProgressTasks.length,
          upcomingDeadlines: upcomingDeadlines.length,
        },
      };

      digests.push(digest);

      // Store digest in database (create a weekly_digests table to store these)
      const { error: digestError } = await supabase
        .from("task_activity")
        .insert({
          task_id: null, // This is a user-level activity
          activity_type: "weekly_digest_generated",
          description: `Weekly digest generated for ${user.name || user.email}`,
          metadata: {
            automated: true,
            userId: user.id,
            digest,
            timestamp: new Date().toISOString(),
          },
        });

      if (digestError) {
        console.error(`Failed to store digest for user ${user.id}:`, digestError);
      }
    }

    // Log automation run
    const { error: logError } = await supabase
      .from("automation_logs")
      .insert({
        automation_type: "weekly_digest",
        executed_at: new Date().toISOString(),
        result: {
          digestsGenerated: digests.length,
          totalUsers: users.length,
        },
        success: true,
      });

    if (logError) {
      console.error("Failed to log automation run:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        digests,
        digestsGenerated: digests.length,
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
