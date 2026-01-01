import { supabase } from './supabaseClient';
import type {
  DonorMove,
  DonorStage,
  DonorType,
  GivingCapacity,
  MovePriority,
  TargetGiftType,
  CultivationPlan,
  CultivationPlanStatus,
  CultivationGoalType,
  CultivationTask,
  CultivationTaskType,
  CultivationTaskStatus,
  Touchpoint,
  TouchpointType,
  TouchpointDirection,
  TouchpointSentiment,
  EngagementLevel,
  DonorPipelineSummary,
  CultivationActivitySummary,
} from '../types';

// ============================================
// DONOR MOVES
// ============================================

export async function getDonorMoves(): Promise<DonorMove[]> {
  const { data, error } = await supabase
    .from('donor_moves')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDonorMoveFromDb);
}

export async function getDonorMoveByClientId(clientId: string): Promise<DonorMove | null> {
  const { data, error } = await supabase
    .from('donor_moves')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? mapDonorMoveFromDb(data) : null;
}

export async function getDonorMovesByStage(stage: DonorStage): Promise<DonorMove[]> {
  const { data, error } = await supabase
    .from('donor_moves')
    .select('*')
    .eq('current_stage', stage)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDonorMoveFromDb);
}

export async function createDonorMove(move: Omit<DonorMove, 'id' | 'createdAt' | 'updatedAt' | 'stageEnteredAt'>): Promise<DonorMove> {
  const { data, error } = await supabase
    .from('donor_moves')
    .insert(mapDonorMoveToDb(move))
    .select()
    .single();

  if (error) throw error;
  return mapDonorMoveFromDb(data);
}

export async function updateDonorMove(id: string, updates: Partial<DonorMove>): Promise<DonorMove> {
  const { data, error } = await supabase
    .from('donor_moves')
    .update(mapDonorMoveToDb(updates))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDonorMoveFromDb(data);
}

export async function advanceDonorStage(donorMoveId: string, newStage: DonorStage, notes?: string): Promise<void> {
  const { error } = await supabase.rpc('advance_donor_stage', {
    p_donor_move_id: donorMoveId,
    p_new_stage: newStage,
    p_notes: notes || null,
  });

  if (error) throw error;
}

export async function deleteDonorMove(id: string): Promise<void> {
  const { error } = await supabase
    .from('donor_moves')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// CULTIVATION PLANS
// ============================================

export async function getCultivationPlans(): Promise<CultivationPlan[]> {
  const { data, error } = await supabase
    .from('cultivation_plans')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapCultivationPlanFromDb);
}

export async function getCultivationPlansByClientId(clientId: string): Promise<CultivationPlan[]> {
  const { data, error } = await supabase
    .from('cultivation_plans')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapCultivationPlanFromDb);
}

export async function getCultivationPlanById(id: string): Promise<CultivationPlan | null> {
  const { data, error } = await supabase
    .from('cultivation_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? mapCultivationPlanFromDb(data) : null;
}

export async function getActiveCultivationPlans(): Promise<CultivationPlan[]> {
  const { data, error } = await supabase
    .from('cultivation_plans')
    .select('*')
    .eq('status', 'active')
    .order('target_completion_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapCultivationPlanFromDb);
}

export async function createCultivationPlan(plan: Omit<CultivationPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<CultivationPlan> {
  const { data, error } = await supabase
    .from('cultivation_plans')
    .insert(mapCultivationPlanToDb(plan))
    .select()
    .single();

  if (error) throw error;
  return mapCultivationPlanFromDb(data);
}

export async function updateCultivationPlan(id: string, updates: Partial<CultivationPlan>): Promise<CultivationPlan> {
  const { data, error } = await supabase
    .from('cultivation_plans')
    .update(mapCultivationPlanToDb(updates))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapCultivationPlanFromDb(data);
}

export async function deleteCultivationPlan(id: string): Promise<void> {
  const { error } = await supabase
    .from('cultivation_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// CULTIVATION TASKS
// ============================================

export async function getCultivationTasksByPlanId(planId: string): Promise<CultivationTask[]> {
  const { data, error } = await supabase
    .from('cultivation_tasks')
    .select('*')
    .eq('cultivation_plan_id', planId)
    .order('sequence_order', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapCultivationTaskFromDb);
}

export async function getPendingCultivationTasks(): Promise<CultivationTask[]> {
  const { data, error } = await supabase
    .from('cultivation_tasks')
    .select('*')
    .eq('status', 'pending')
    .order('due_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapCultivationTaskFromDb);
}

export async function getOverdueCultivationTasks(): Promise<CultivationTask[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('cultivation_tasks')
    .select('*')
    .eq('status', 'pending')
    .lt('due_date', today)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapCultivationTaskFromDb);
}

export async function createCultivationTask(task: Omit<CultivationTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<CultivationTask> {
  const { data, error } = await supabase
    .from('cultivation_tasks')
    .insert(mapCultivationTaskToDb(task))
    .select()
    .single();

  if (error) throw error;
  return mapCultivationTaskFromDb(data);
}

export async function updateCultivationTask(id: string, updates: Partial<CultivationTask>): Promise<CultivationTask> {
  const { data, error } = await supabase
    .from('cultivation_tasks')
    .update(mapCultivationTaskToDb(updates))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapCultivationTaskFromDb(data);
}

export async function completeCultivationTask(id: string): Promise<CultivationTask> {
  const { data, error } = await supabase
    .from('cultivation_tasks')
    .update({
      status: 'completed',
      completed_date: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapCultivationTaskFromDb(data);
}

export async function deleteCultivationTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('cultivation_tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// TOUCHPOINTS
// ============================================

export async function getTouchpoints(): Promise<Touchpoint[]> {
  const { data, error } = await supabase
    .from('touchpoints')
    .select('*')
    .order('touchpoint_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTouchpointFromDb);
}

export async function getTouchpointsByClientId(clientId: string): Promise<Touchpoint[]> {
  const { data, error } = await supabase
    .from('touchpoints')
    .select('*')
    .eq('client_id', clientId)
    .order('touchpoint_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTouchpointFromDb);
}

export async function getRecentTouchpoints(days: number = 30): Promise<Touchpoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('touchpoints')
    .select('*')
    .gte('touchpoint_date', startDate.toISOString())
    .order('touchpoint_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapTouchpointFromDb);
}

export async function getTouchpointsRequiringFollowUp(): Promise<Touchpoint[]> {
  const { data, error } = await supabase
    .from('touchpoints')
    .select('*')
    .eq('follow_up_required', true)
    .order('follow_up_date', { ascending: true });

  if (error) throw error;
  return (data || []).map(mapTouchpointFromDb);
}

export async function createTouchpoint(touchpoint: Omit<Touchpoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<Touchpoint> {
  const { data, error } = await supabase
    .from('touchpoints')
    .insert(mapTouchpointToDb(touchpoint))
    .select()
    .single();

  if (error) throw error;
  return mapTouchpointFromDb(data);
}

export async function updateTouchpoint(id: string, updates: Partial<Touchpoint>): Promise<Touchpoint> {
  const { data, error } = await supabase
    .from('touchpoints')
    .update(mapTouchpointToDb(updates))
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapTouchpointFromDb(data);
}

export async function deleteTouchpoint(id: string): Promise<void> {
  const { error } = await supabase
    .from('touchpoints')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// PIPELINE SUMMARY & ANALYTICS
// ============================================

export async function getDonorPipelineSummary(): Promise<DonorPipelineSummary[]> {
  const { data, error } = await supabase
    .from('donor_pipeline_summary')
    .select('*');

  if (error) throw error;
  return (data || []).map(mapPipelineSummaryFromDb);
}

export async function getCultivationActivitySummary(): Promise<CultivationActivitySummary[]> {
  const { data, error } = await supabase
    .from('cultivation_activity_summary')
    .select('*');

  if (error) throw error;
  return (data || []).map(mapActivitySummaryFromDb);
}

export async function calculateDonorEngagement(clientId: string): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_donor_engagement', {
    p_client_id: clientId,
  });

  if (error) throw error;
  return data || 0;
}

// ============================================
// HELPER MAPPING FUNCTIONS
// ============================================

function mapDonorMoveFromDb(row: any): DonorMove {
  return {
    id: row.id,
    clientId: row.client_id,
    currentStage: row.current_stage,
    stageEnteredAt: row.stage_entered_at,
    previousStage: row.previous_stage,
    donorType: row.donor_type,
    givingCapacity: row.giving_capacity,
    affinityScore: row.affinity_score || 0,
    assignedTo: row.assigned_to,
    targetGiftAmount: row.target_gift_amount ? parseFloat(row.target_gift_amount) : null,
    targetGiftDate: row.target_gift_date,
    targetGiftType: row.target_gift_type,
    isActive: row.is_active,
    priority: row.priority,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDonorMoveToDb(move: Partial<DonorMove>): any {
  const result: any = {};
  if (move.clientId !== undefined) result.client_id = move.clientId;
  if (move.currentStage !== undefined) result.current_stage = move.currentStage;
  if (move.previousStage !== undefined) result.previous_stage = move.previousStage;
  if (move.donorType !== undefined) result.donor_type = move.donorType;
  if (move.givingCapacity !== undefined) result.giving_capacity = move.givingCapacity;
  if (move.affinityScore !== undefined) result.affinity_score = move.affinityScore;
  if (move.assignedTo !== undefined) result.assigned_to = move.assignedTo;
  if (move.targetGiftAmount !== undefined) result.target_gift_amount = move.targetGiftAmount;
  if (move.targetGiftDate !== undefined) result.target_gift_date = move.targetGiftDate;
  if (move.targetGiftType !== undefined) result.target_gift_type = move.targetGiftType;
  if (move.isActive !== undefined) result.is_active = move.isActive;
  if (move.priority !== undefined) result.priority = move.priority;
  if (move.notes !== undefined) result.notes = move.notes;
  return result;
}

function mapCultivationPlanFromDb(row: any): CultivationPlan {
  return {
    id: row.id,
    donorMoveId: row.donor_move_id,
    clientId: row.client_id,
    name: row.name,
    description: row.description,
    strategy: row.strategy,
    startDate: row.start_date,
    targetCompletionDate: row.target_completion_date,
    actualCompletionDate: row.actual_completion_date,
    goalDescription: row.goal_description,
    goalAmount: row.goal_amount ? parseFloat(row.goal_amount) : null,
    goalType: row.goal_type,
    status: row.status,
    successCriteria: row.success_criteria,
    outcomeNotes: row.outcome_notes,
    wasSuccessful: row.was_successful,
    createdBy: row.created_by,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCultivationPlanToDb(plan: Partial<CultivationPlan>): any {
  const result: any = {};
  if (plan.donorMoveId !== undefined) result.donor_move_id = plan.donorMoveId;
  if (plan.clientId !== undefined) result.client_id = plan.clientId;
  if (plan.name !== undefined) result.name = plan.name;
  if (plan.description !== undefined) result.description = plan.description;
  if (plan.strategy !== undefined) result.strategy = plan.strategy;
  if (plan.startDate !== undefined) result.start_date = plan.startDate;
  if (plan.targetCompletionDate !== undefined) result.target_completion_date = plan.targetCompletionDate;
  if (plan.actualCompletionDate !== undefined) result.actual_completion_date = plan.actualCompletionDate;
  if (plan.goalDescription !== undefined) result.goal_description = plan.goalDescription;
  if (plan.goalAmount !== undefined) result.goal_amount = plan.goalAmount;
  if (plan.goalType !== undefined) result.goal_type = plan.goalType;
  if (plan.status !== undefined) result.status = plan.status;
  if (plan.successCriteria !== undefined) result.success_criteria = plan.successCriteria;
  if (plan.outcomeNotes !== undefined) result.outcome_notes = plan.outcomeNotes;
  if (plan.wasSuccessful !== undefined) result.was_successful = plan.wasSuccessful;
  if (plan.createdBy !== undefined) result.created_by = plan.createdBy;
  if (plan.assignedTo !== undefined) result.assigned_to = plan.assignedTo;
  return result;
}

function mapCultivationTaskFromDb(row: any): CultivationTask {
  return {
    id: row.id,
    cultivationPlanId: row.cultivation_plan_id,
    title: row.title,
    description: row.description,
    taskType: row.task_type,
    dueDate: row.due_date,
    scheduledDate: row.scheduled_date,
    completedDate: row.completed_date,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    sequenceOrder: row.sequence_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCultivationTaskToDb(task: Partial<CultivationTask>): any {
  const result: any = {};
  if (task.cultivationPlanId !== undefined) result.cultivation_plan_id = task.cultivationPlanId;
  if (task.title !== undefined) result.title = task.title;
  if (task.description !== undefined) result.description = task.description;
  if (task.taskType !== undefined) result.task_type = task.taskType;
  if (task.dueDate !== undefined) result.due_date = task.dueDate;
  if (task.scheduledDate !== undefined) result.scheduled_date = task.scheduledDate;
  if (task.completedDate !== undefined) result.completed_date = task.completedDate;
  if (task.status !== undefined) result.status = task.status;
  if (task.priority !== undefined) result.priority = task.priority;
  if (task.assignedTo !== undefined) result.assigned_to = task.assignedTo;
  if (task.sequenceOrder !== undefined) result.sequence_order = task.sequenceOrder;
  return result;
}

function mapTouchpointFromDb(row: any): Touchpoint {
  return {
    id: row.id,
    clientId: row.client_id,
    donorMoveId: row.donor_move_id,
    cultivationPlanId: row.cultivation_plan_id,
    cultivationTaskId: row.cultivation_task_id,
    touchpointType: row.touchpoint_type,
    touchpointDate: row.touchpoint_date,
    direction: row.direction,
    subject: row.subject,
    description: row.description,
    outcome: row.outcome,
    sentiment: row.sentiment,
    engagementLevel: row.engagement_level,
    followUpRequired: row.follow_up_required,
    followUpDate: row.follow_up_date,
    followUpNotes: row.follow_up_notes,
    recordedBy: row.recorded_by,
    relatedDonationId: row.related_donation_id,
    relatedActivityId: row.related_activity_id,
    attachments: row.attachments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTouchpointToDb(touchpoint: Partial<Touchpoint>): any {
  const result: any = {};
  if (touchpoint.clientId !== undefined) result.client_id = touchpoint.clientId;
  if (touchpoint.donorMoveId !== undefined) result.donor_move_id = touchpoint.donorMoveId;
  if (touchpoint.cultivationPlanId !== undefined) result.cultivation_plan_id = touchpoint.cultivationPlanId;
  if (touchpoint.cultivationTaskId !== undefined) result.cultivation_task_id = touchpoint.cultivationTaskId;
  if (touchpoint.touchpointType !== undefined) result.touchpoint_type = touchpoint.touchpointType;
  if (touchpoint.touchpointDate !== undefined) result.touchpoint_date = touchpoint.touchpointDate;
  if (touchpoint.direction !== undefined) result.direction = touchpoint.direction;
  if (touchpoint.subject !== undefined) result.subject = touchpoint.subject;
  if (touchpoint.description !== undefined) result.description = touchpoint.description;
  if (touchpoint.outcome !== undefined) result.outcome = touchpoint.outcome;
  if (touchpoint.sentiment !== undefined) result.sentiment = touchpoint.sentiment;
  if (touchpoint.engagementLevel !== undefined) result.engagement_level = touchpoint.engagementLevel;
  if (touchpoint.followUpRequired !== undefined) result.follow_up_required = touchpoint.followUpRequired;
  if (touchpoint.followUpDate !== undefined) result.follow_up_date = touchpoint.followUpDate;
  if (touchpoint.followUpNotes !== undefined) result.follow_up_notes = touchpoint.followUpNotes;
  if (touchpoint.recordedBy !== undefined) result.recorded_by = touchpoint.recordedBy;
  if (touchpoint.relatedDonationId !== undefined) result.related_donation_id = touchpoint.relatedDonationId;
  if (touchpoint.relatedActivityId !== undefined) result.related_activity_id = touchpoint.relatedActivityId;
  if (touchpoint.attachments !== undefined) result.attachments = touchpoint.attachments;
  return result;
}

function mapPipelineSummaryFromDb(row: any): DonorPipelineSummary {
  return {
    currentStage: row.current_stage,
    donorType: row.donor_type,
    givingCapacity: row.giving_capacity,
    priority: row.priority,
    donorCount: row.donor_count || 0,
    totalTargetAmount: row.total_target_amount ? parseFloat(row.total_target_amount) : 0,
    activePlans: row.active_plans || 0,
    pendingTasks: row.pending_tasks || 0,
    overdueTasks: row.overdue_tasks || 0,
    totalTouchpoints: row.total_touchpoints || 0,
    lastTouchpointDate: row.last_touchpoint_date,
  };
}

function mapActivitySummaryFromDb(row: any): CultivationActivitySummary {
  return {
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    currentStage: row.current_stage,
    donorType: row.donor_type,
    givingCapacity: row.giving_capacity,
    targetGiftAmount: row.target_gift_amount ? parseFloat(row.target_gift_amount) : null,
    targetGiftDate: row.target_gift_date,
    assignedTo: row.assigned_to,
    priority: row.priority,
    activePlanName: row.active_plan_name,
    planGoal: row.plan_goal ? parseFloat(row.plan_goal) : null,
    planTargetDate: row.plan_target_date,
    pendingTasks: row.pending_tasks || 0,
    completedTasks: row.completed_tasks || 0,
    totalTouchpoints: row.total_touchpoints || 0,
    lastTouchpoint: row.last_touchpoint,
    touchpointsLast30Days: row.touchpoints_last_30_days || 0,
    nextTaskDue: row.next_task_due,
  };
}
