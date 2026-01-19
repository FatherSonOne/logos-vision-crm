// Weekly Task Automation - Deadline Adjustment Suggestions
// Runs every Monday at 8:00 AM to suggest deadline adjustments for in-progress tasks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeadlineAdjustment {
  taskId: string;
  taskTitle: string;
  currentDeadline: string;
  suggestedDeadline: string;
  reason: string;
  confidence: number;
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

    // Fetch all in-progress tasks with upcoming deadlines
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // Look at next 30 days

    const { data: inProgressTasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("status", "in_progress")
      .gte("due_date", today.toISOString().split('T')[0])
      .lte("due_date", futureDate.toISOString().split('T')[0])
      .order("due_date", { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch tasks: ${fetchError.message}`);
    }

    if (!inProgressTasks || inProgressTasks.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          suggestions: [],
          message: "No in-progress tasks found for analysis",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const suggestions: DeadlineAdjustment[] = [];

    for (const task of inProgressTasks) {
      // Calculate days until deadline
      const dueDate = new Date(task.due_date);
      const daysRemaining = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate task age
      const createdDate = new Date(task.created_at);
      const taskAgeInDays = Math.floor(
        (today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Analyze progress rate
      const progress = task.progress || 0;
      const expectedProgress = taskAgeInDays > 0
        ? Math.min(100, (taskAgeInDays / (taskAgeInDays + daysRemaining)) * 100)
        : 0;

      // Predict completion based on current pace
      let shouldAdjust = false;
      let reason = "";
      let suggestedDelay = 0;
      let confidence = 0;

      // Behind schedule analysis
      if (progress < expectedProgress - 20 && daysRemaining > 0) {
        shouldAdjust = true;
        const progressRate = taskAgeInDays > 0 ? progress / taskAgeInDays : 0;
        const estimatedDaysNeeded = progressRate > 0
          ? Math.ceil((100 - progress) / progressRate)
          : daysRemaining * 2;

        suggestedDelay = Math.max(0, estimatedDaysNeeded - daysRemaining);
        confidence = Math.min(90, 60 + (Math.abs(expectedProgress - progress) / 2));

        reason = `Current pace indicates completion in ${estimatedDaysNeeded} days. Task is ${Math.round(expectedProgress - progress)}% behind expected progress.`;
      }
      // Ahead of schedule analysis
      else if (progress > expectedProgress + 20 && daysRemaining > 3) {
        shouldAdjust = true;
        const progressRate = taskAgeInDays > 0 ? progress / taskAgeInDays : 0;
        const estimatedDaysNeeded = progressRate > 0
          ? Math.ceil((100 - progress) / progressRate)
          : Math.floor(daysRemaining / 2);

        suggestedDelay = estimatedDaysNeeded - daysRemaining;
        confidence = Math.min(85, 50 + (Math.abs(progress - expectedProgress) / 2));

        reason = `Task is ${Math.round(progress - expectedProgress)}% ahead of schedule. Early completion likely in ${estimatedDaysNeeded} days.`;
      }
      // Minimal progress with tight deadline
      else if (progress < 30 && daysRemaining < 3 && task.priority !== "low") {
        shouldAdjust = true;
        suggestedDelay = Math.ceil((100 - progress) / 15); // Assume 15% progress per day
        confidence = 80;
        reason = `Only ${progress}% complete with ${daysRemaining} days remaining. High risk of missing deadline.`;
      }

      if (shouldAdjust && Math.abs(suggestedDelay) >= 2) {
        const suggestedDate = new Date(dueDate);
        suggestedDate.setDate(suggestedDate.getDate() + suggestedDelay);

        suggestions.push({
          taskId: task.id,
          taskTitle: task.title,
          currentDeadline: task.due_date,
          suggestedDeadline: suggestedDate.toISOString().split('T')[0],
          reason,
          confidence,
        });

        // Log suggestion to task_activity
        const { error: activityError } = await supabase
          .from("task_activity")
          .insert({
            task_id: task.id,
            activity_type: "deadline_suggestion",
            description: `Automated deadline adjustment suggested: ${reason}`,
            metadata: {
              automated: true,
              currentDeadline: task.due_date,
              suggestedDeadline: suggestedDate.toISOString().split('T')[0],
              confidence,
              progress,
              daysRemaining,
              timestamp: new Date().toISOString(),
            },
          });

        if (activityError) {
          console.error(`Failed to log activity for task ${task.id}:`, activityError);
        }
      }
    }

    // Log automation run
    const { error: logError } = await supabase
      .from("automation_logs")
      .insert({
        automation_type: "weekly_deadline_adjustment",
        executed_at: new Date().toISOString(),
        result: {
          tasksAnalyzed: inProgressTasks.length,
          suggestionsMade: suggestions.length,
        },
        success: true,
      });

    if (logError) {
      console.error("Failed to log automation run:", logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        tasksAnalyzed: inProgressTasks.length,
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
