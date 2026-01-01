import { supabase } from './supabaseClient';
import type {
  Program,
  Service,
  Outcome,
  ClientProgress,
  ProgramResult,
  ImpactSnapshot,
  ClientOutcomeSummary,
  ProgramImpactSummary,
  ImpactStats,
  ProgramCategory,
  ServiceType,
  ServiceStatus,
  ProgressStage,
  CompletionStatus,
  OutcomeCategory,
} from '../types';

// ============================================
// HELPER FUNCTIONS
// ============================================

function mapProgramFromDb(row: any): Program {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as ProgramCategory,
    programType: row.program_type,
    durationWeeks: row.duration_weeks,
    costPerParticipant: parseFloat(row.cost_per_participant) || 0,
    maxParticipants: row.max_participants,
    trackAttendance: row.track_attendance,
    trackOutcomes: row.track_outcomes,
    outcomeTypes: row.outcome_types || [],
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapServiceFromDb(row: any): Service {
  return {
    id: row.id,
    clientId: row.client_id,
    programId: row.program_id,
    serviceDate: row.service_date,
    serviceType: row.service_type as ServiceType,
    durationMinutes: row.duration_minutes || 60,
    status: row.status as ServiceStatus,
    notes: row.notes,
    providerId: row.provider_id,
    location: row.location,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName: row.clients?.name,
    programName: row.programs?.name,
  };
}

function mapOutcomeFromDb(row: any): Outcome {
  return {
    id: row.id,
    clientId: row.client_id,
    programId: row.program_id,
    outcomeType: row.outcome_type,
    outcomeCategory: row.outcome_category as OutcomeCategory,
    beforeValue: row.before_value ? parseFloat(row.before_value) : null,
    afterValue: row.after_value ? parseFloat(row.after_value) : null,
    beforeStatus: row.before_status,
    afterStatus: row.after_status,
    impactValue: parseFloat(row.impact_value) || 0,
    impactDescription: row.impact_description,
    outcomeDate: row.outcome_date,
    verified: row.verified,
    verifiedBy: row.verified_by,
    verifiedDate: row.verified_date,
    evidenceNotes: row.evidence_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName: row.clients?.name,
    programName: row.programs?.name,
  };
}

function mapClientProgressFromDb(row: any): ClientProgress {
  return {
    id: row.id,
    clientId: row.client_id,
    programId: row.program_id,
    enrollmentDate: row.enrollment_date,
    enrollmentSource: row.enrollment_source,
    currentStage: row.current_stage as ProgressStage,
    stageUpdatedAt: row.stage_updated_at,
    sessionsAttended: row.sessions_attended || 0,
    sessionsScheduled: row.sessions_scheduled || 0,
    attendanceRate: parseFloat(row.attendance_rate) || 0,
    lastAttendanceDate: row.last_attendance_date,
    completionDate: row.completion_date,
    completionStatus: row.completion_status as CompletionStatus,
    withdrawalReason: row.withdrawal_reason,
    outcomesAchieved: row.outcomes_achieved || 0,
    primaryOutcomeId: row.primary_outcome_id,
    atRisk: row.at_risk,
    riskFactors: row.risk_factors || [],
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    clientName: row.clients?.name,
    programName: row.programs?.name,
  };
}

function mapProgramResultFromDb(row: any): ProgramResult {
  return {
    id: row.id,
    programId: row.program_id,
    periodType: row.period_type,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    enrolledCount: row.enrolled_count || 0,
    activeCount: row.active_count || 0,
    completedCount: row.completed_count || 0,
    withdrawnCount: row.withdrawn_count || 0,
    totalServices: row.total_services || 0,
    avgAttendanceRate: parseFloat(row.avg_attendance_rate) || 0,
    totalServiceHours: parseFloat(row.total_service_hours) || 0,
    outcomeCount: row.outcome_count || 0,
    totalImpactValue: parseFloat(row.total_impact_value) || 0,
    avgImpactPerClient: parseFloat(row.avg_impact_per_client) || 0,
    costPerOutcome: parseFloat(row.cost_per_outcome) || 0,
    costPerClient: parseFloat(row.cost_per_client) || 0,
    roiPercentage: parseFloat(row.roi_percentage) || 0,
    completionRate: parseFloat(row.completion_rate) || 0,
    avgTimeToCompletion: row.avg_time_to_completion,
    calculatedAt: row.calculated_at,
    createdAt: row.created_at,
    programName: row.programs?.name,
  };
}

function mapImpactSnapshotFromDb(row: any): ImpactSnapshot {
  return {
    id: row.id,
    snapshotDate: row.snapshot_date,
    snapshotType: row.snapshot_type,
    totalServices: row.total_services || 0,
    totalServiceHours: parseFloat(row.total_service_hours) || 0,
    uniqueClientsServed: row.unique_clients_served || 0,
    totalEnrollments: row.total_enrollments || 0,
    activeEnrollments: row.active_enrollments || 0,
    completionsThisPeriod: row.completions_this_period || 0,
    totalOutcomes: row.total_outcomes || 0,
    outcomesThisPeriod: row.outcomes_this_period || 0,
    totalImpactValue: parseFloat(row.total_impact_value) || 0,
    impactThisPeriod: parseFloat(row.impact_this_period) || 0,
    employmentOutcomes: row.employment_outcomes || 0,
    housingOutcomes: row.housing_outcomes || 0,
    educationOutcomes: row.education_outcomes || 0,
    healthOutcomes: row.health_outcomes || 0,
    financialOutcomes: row.financial_outcomes || 0,
    avgCostPerOutcome: parseFloat(row.avg_cost_per_outcome) || 0,
    overallCompletionRate: parseFloat(row.overall_completion_rate) || 0,
    summaryMetrics: row.summary_metrics || {},
    createdAt: row.created_at,
  };
}

// ============================================
// PROGRAMS
// ============================================

export async function getPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching programs:', error);
    return [];
  }

  return (data || []).map(mapProgramFromDb);
}

export async function getActivePrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching active programs:', error);
    return [];
  }

  return (data || []).map(mapProgramFromDb);
}

export async function getProgramById(id: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching program:', error);
    return null;
  }

  return data ? mapProgramFromDb(data) : null;
}

export async function createProgram(program: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      name: program.name,
      description: program.description,
      category: program.category,
      program_type: program.programType,
      duration_weeks: program.durationWeeks,
      cost_per_participant: program.costPerParticipant,
      max_participants: program.maxParticipants,
      track_attendance: program.trackAttendance,
      track_outcomes: program.trackOutcomes,
      outcome_types: program.outcomeTypes,
      is_active: program.isActive,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating program:', error);
    return null;
  }

  return data ? mapProgramFromDb(data) : null;
}

export async function updateProgram(id: string, updates: Partial<Program>): Promise<Program | null> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.programType !== undefined) dbUpdates.program_type = updates.programType;
  if (updates.durationWeeks !== undefined) dbUpdates.duration_weeks = updates.durationWeeks;
  if (updates.costPerParticipant !== undefined) dbUpdates.cost_per_participant = updates.costPerParticipant;
  if (updates.maxParticipants !== undefined) dbUpdates.max_participants = updates.maxParticipants;
  if (updates.trackAttendance !== undefined) dbUpdates.track_attendance = updates.trackAttendance;
  if (updates.trackOutcomes !== undefined) dbUpdates.track_outcomes = updates.trackOutcomes;
  if (updates.outcomeTypes !== undefined) dbUpdates.outcome_types = updates.outcomeTypes;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('programs')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating program:', error);
    return null;
  }

  return data ? mapProgramFromDb(data) : null;
}

// ============================================
// SERVICES (Service Tracking)
// ============================================

export async function getServices(filters?: {
  clientId?: string;
  programId?: string;
  startDate?: string;
  endDate?: string;
  status?: ServiceStatus;
}): Promise<Service[]> {
  let query = supabase
    .from('services')
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .order('service_date', { ascending: false });

  if (filters?.clientId) query = query.eq('client_id', filters.clientId);
  if (filters?.programId) query = query.eq('program_id', filters.programId);
  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.startDate) query = query.gte('service_date', filters.startDate);
  if (filters?.endDate) query = query.lte('service_date', filters.endDate);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return (data || []).map(mapServiceFromDb);
}

export async function getClientServices(clientId: string): Promise<Service[]> {
  return getServices({ clientId });
}

export async function getServicesByProgram(programId: string): Promise<Service[]> {
  return getServices({ programId });
}

export async function getServiceCount(programId: string, startDate?: string, endDate?: string): Promise<number> {
  let query = supabase
    .from('services')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', programId)
    .eq('status', 'completed');

  if (startDate) query = query.gte('service_date', startDate);
  if (endDate) query = query.lte('service_date', endDate);

  const { count, error } = await query;

  if (error) {
    console.error('Error counting services:', error);
    return 0;
  }

  return count || 0;
}

export async function recordService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'clientName' | 'programName' | 'providerName'>): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .insert({
      client_id: service.clientId,
      program_id: service.programId,
      service_date: service.serviceDate,
      service_type: service.serviceType,
      duration_minutes: service.durationMinutes,
      status: service.status,
      notes: service.notes,
      provider_id: service.providerId,
      location: service.location,
    })
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error recording service:', error);
    return null;
  }

  return data ? mapServiceFromDb(data) : null;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<Service | null> {
  const dbUpdates: any = {};
  if (updates.serviceDate !== undefined) dbUpdates.service_date = updates.serviceDate;
  if (updates.serviceType !== undefined) dbUpdates.service_type = updates.serviceType;
  if (updates.durationMinutes !== undefined) dbUpdates.duration_minutes = updates.durationMinutes;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.providerId !== undefined) dbUpdates.provider_id = updates.providerId;
  if (updates.location !== undefined) dbUpdates.location = updates.location;

  const { data, error } = await supabase
    .from('services')
    .update(dbUpdates)
    .eq('id', id)
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error updating service:', error);
    return null;
  }

  return data ? mapServiceFromDb(data) : null;
}

export async function deleteService(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    return false;
  }

  return true;
}

export async function calculateAttendanceRate(clientId: string, programId: string): Promise<number> {
  const { data, error } = await supabase
    .from('client_progress')
    .select('attendance_rate')
    .eq('client_id', clientId)
    .eq('program_id', programId)
    .single();

  if (error || !data) {
    return 0;
  }

  return parseFloat(data.attendance_rate) || 0;
}

// ============================================
// CLIENT PROGRESS
// ============================================

export async function getClientProgress(filters?: {
  clientId?: string;
  programId?: string;
  stage?: ProgressStage;
  atRisk?: boolean;
}): Promise<ClientProgress[]> {
  let query = supabase
    .from('client_progress')
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .order('enrollment_date', { ascending: false });

  if (filters?.clientId) query = query.eq('client_id', filters.clientId);
  if (filters?.programId) query = query.eq('program_id', filters.programId);
  if (filters?.stage) query = query.eq('current_stage', filters.stage);
  if (filters?.atRisk !== undefined) query = query.eq('at_risk', filters.atRisk);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching client progress:', error);
    return [];
  }

  return (data || []).map(mapClientProgressFromDb);
}

export async function getProgressStages(clientId: string): Promise<ClientProgress[]> {
  return getClientProgress({ clientId });
}

export async function enrollClient(
  clientId: string,
  programId: string,
  enrollmentDate: string,
  enrollmentSource?: string
): Promise<ClientProgress | null> {
  const { data, error } = await supabase
    .from('client_progress')
    .insert({
      client_id: clientId,
      program_id: programId,
      enrollment_date: enrollmentDate,
      enrollment_source: enrollmentSource,
      current_stage: 'enrolled',
    })
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error enrolling client:', error);
    return null;
  }

  return data ? mapClientProgressFromDb(data) : null;
}

export async function updateClientStage(
  clientId: string,
  programId: string,
  stage: ProgressStage
): Promise<ClientProgress | null> {
  const updates: any = {
    current_stage: stage,
    stage_updated_at: new Date().toISOString(),
  };

  // If completing, set completion date and status
  if (stage === 'completed' || stage === 'graduated') {
    updates.completion_date = new Date().toISOString().split('T')[0];
    updates.completion_status = stage;
  }

  const { data, error } = await supabase
    .from('client_progress')
    .update(updates)
    .eq('client_id', clientId)
    .eq('program_id', programId)
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error updating client stage:', error);
    return null;
  }

  return data ? mapClientProgressFromDb(data) : null;
}

export async function completeProgram(
  clientId: string,
  programId: string,
  status: CompletionStatus = 'completed'
): Promise<ClientProgress | null> {
  const { data, error } = await supabase
    .from('client_progress')
    .update({
      current_stage: status === 'graduated' ? 'graduated' : 'completed',
      completion_date: new Date().toISOString().split('T')[0],
      completion_status: status,
      stage_updated_at: new Date().toISOString(),
    })
    .eq('client_id', clientId)
    .eq('program_id', programId)
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error completing program:', error);
    return null;
  }

  return data ? mapClientProgressFromDb(data) : null;
}

export async function withdrawClient(
  clientId: string,
  programId: string,
  reason?: string
): Promise<ClientProgress | null> {
  const { data, error } = await supabase
    .from('client_progress')
    .update({
      current_stage: 'withdrawn',
      completion_date: new Date().toISOString().split('T')[0],
      completion_status: 'withdrawn',
      withdrawal_reason: reason,
      stage_updated_at: new Date().toISOString(),
    })
    .eq('client_id', clientId)
    .eq('program_id', programId)
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error withdrawing client:', error);
    return null;
  }

  return data ? mapClientProgressFromDb(data) : null;
}

export async function markAtRisk(
  clientId: string,
  programId: string,
  riskFactors: string[]
): Promise<ClientProgress | null> {
  const { data, error } = await supabase
    .from('client_progress')
    .update({
      at_risk: true,
      risk_factors: riskFactors,
    })
    .eq('client_id', clientId)
    .eq('program_id', programId)
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error marking client at risk:', error);
    return null;
  }

  return data ? mapClientProgressFromDb(data) : null;
}

export async function getCompletionRate(programId: string): Promise<number> {
  const { data, error } = await supabase
    .from('program_impact_summary')
    .select('completion_rate')
    .eq('program_id', programId)
    .single();

  if (error || !data) {
    return 0;
  }

  return parseFloat(data.completion_rate) || 0;
}

// ============================================
// OUTCOMES
// ============================================

export async function getOutcomes(filters?: {
  clientId?: string;
  programId?: string;
  outcomeType?: string;
  outcomeCategory?: OutcomeCategory;
  startDate?: string;
  endDate?: string;
  verified?: boolean;
}): Promise<Outcome[]> {
  let query = supabase
    .from('outcomes')
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .order('outcome_date', { ascending: false });

  if (filters?.clientId) query = query.eq('client_id', filters.clientId);
  if (filters?.programId) query = query.eq('program_id', filters.programId);
  if (filters?.outcomeType) query = query.eq('outcome_type', filters.outcomeType);
  if (filters?.outcomeCategory) query = query.eq('outcome_category', filters.outcomeCategory);
  if (filters?.verified !== undefined) query = query.eq('verified', filters.verified);
  if (filters?.startDate) query = query.gte('outcome_date', filters.startDate);
  if (filters?.endDate) query = query.lte('outcome_date', filters.endDate);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching outcomes:', error);
    return [];
  }

  return (data || []).map(mapOutcomeFromDb);
}

export async function getClientOutcomes(clientId: string): Promise<Outcome[]> {
  return getOutcomes({ clientId });
}

export async function getOutcomesByType(outcomeType: string, startDate?: string, endDate?: string): Promise<Outcome[]> {
  return getOutcomes({ outcomeType, startDate, endDate });
}

export async function recordOutcome(outcome: Omit<Outcome, 'id' | 'createdAt' | 'updatedAt' | 'clientName' | 'programName'>): Promise<Outcome | null> {
  const { data, error } = await supabase
    .from('outcomes')
    .insert({
      client_id: outcome.clientId,
      program_id: outcome.programId,
      outcome_type: outcome.outcomeType,
      outcome_category: outcome.outcomeCategory,
      before_value: outcome.beforeValue,
      after_value: outcome.afterValue,
      before_status: outcome.beforeStatus,
      after_status: outcome.afterStatus,
      impact_value: outcome.impactValue,
      impact_description: outcome.impactDescription,
      outcome_date: outcome.outcomeDate,
      verified: outcome.verified,
      verified_by: outcome.verifiedBy,
      verified_date: outcome.verifiedDate,
      evidence_notes: outcome.evidenceNotes,
    })
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error recording outcome:', error);
    return null;
  }

  return data ? mapOutcomeFromDb(data) : null;
}

export async function verifyOutcome(id: string, verifiedBy: string): Promise<Outcome | null> {
  const { data, error } = await supabase
    .from('outcomes')
    .update({
      verified: true,
      verified_by: verifiedBy,
      verified_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', id)
    .select(`
      *,
      clients:client_id(name),
      programs:program_id(name)
    `)
    .single();

  if (error) {
    console.error('Error verifying outcome:', error);
    return null;
  }

  return data ? mapOutcomeFromDb(data) : null;
}

export async function calculateImpactValue(beforeValue: number, afterValue: number, outcomeType: string): number {
  // Standard impact value calculations based on outcome type
  const impactMultipliers: Record<string, number> = {
    employment: 12, // Annual salary impact
    income_increase: 12, // Annual income increase
    housing_stable: 12000, // Annual housing cost impact
    housing_obtained: 18000, // Value of stable housing
    education_complete: 25000, // Lifetime earnings increase
    credential_obtained: 15000, // Credential value
    health_improved: 5000, // Healthcare cost savings
    mental_health: 3000, // Mental health improvement value
    financial_literacy: 2000, // Financial skills value
    savings_increase: 1, // Direct savings value
    family_stability: 8000, // Family stability value
    parenting_skills: 4000, // Parenting improvement value
    stability: 10000, // General stability value
    goal_achievement: 5000, // Goal completion value
  };

  const multiplier = impactMultipliers[outcomeType] || 1;

  if (beforeValue !== null && afterValue !== null) {
    return (afterValue - beforeValue) * multiplier;
  }

  return afterValue ? afterValue * multiplier : multiplier;
}

export async function calculateAggregateImpact(programId: string): Promise<{
  livesChanged: number;
  economicImpact: number;
  costPerOutcome: number;
  avgImpactPerClient: number;
}> {
  const { data, error } = await supabase
    .from('program_impact_summary')
    .select('*')
    .eq('program_id', programId)
    .single();

  if (error || !data) {
    return {
      livesChanged: 0,
      economicImpact: 0,
      costPerOutcome: 0,
      avgImpactPerClient: 0,
    };
  }

  return {
    livesChanged: data.total_completed || 0,
    economicImpact: parseFloat(data.total_impact_value) || 0,
    costPerOutcome: parseFloat(data.cost_per_outcome) || 0,
    avgImpactPerClient: data.total_enrolled > 0
      ? (parseFloat(data.total_impact_value) || 0) / data.total_enrolled
      : 0,
  };
}

export async function calculateProgramROI(programId: string): Promise<number> {
  const { data, error } = await supabase
    .from('program_impact_summary')
    .select('roi_percentage')
    .eq('program_id', programId)
    .single();

  if (error || !data) {
    return 0;
  }

  return parseFloat(data.roi_percentage) || 0;
}

// ============================================
// PROGRAM RESULTS
// ============================================

export async function getProgramResults(programId: string, periodType?: string): Promise<ProgramResult[]> {
  let query = supabase
    .from('program_results')
    .select(`
      *,
      programs:program_id(name)
    `)
    .eq('program_id', programId)
    .order('period_start', { ascending: false });

  if (periodType) query = query.eq('period_type', periodType);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching program results:', error);
    return [];
  }

  return (data || []).map(mapProgramResultFromDb);
}

export async function calculateProgramResults(
  programId: string,
  periodType: 'monthly' | 'quarterly' | 'yearly',
  periodStart: string,
  periodEnd: string
): Promise<string | null> {
  const { data, error } = await supabase.rpc('calculate_program_results', {
    p_program_id: programId,
    p_period_type: periodType,
    p_period_start: periodStart,
    p_period_end: periodEnd,
  });

  if (error) {
    console.error('Error calculating program results:', error);
    return null;
  }

  return data;
}

// ============================================
// IMPACT SNAPSHOTS
// ============================================

export async function getImpactSnapshots(snapshotType?: string, limit?: number): Promise<ImpactSnapshot[]> {
  let query = supabase
    .from('impact_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false });

  if (snapshotType) query = query.eq('snapshot_type', snapshotType);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching impact snapshots:', error);
    return [];
  }

  return (data || []).map(mapImpactSnapshotFromDb);
}

export async function getLatestSnapshot(): Promise<ImpactSnapshot | null> {
  const snapshots = await getImpactSnapshots(undefined, 1);
  return snapshots[0] || null;
}

export async function createImpactSnapshot(
  snapshotDate?: string,
  snapshotType?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_impact_snapshot', {
    p_snapshot_date: snapshotDate || new Date().toISOString().split('T')[0],
    p_snapshot_type: snapshotType || 'daily',
  });

  if (error) {
    console.error('Error creating impact snapshot:', error);
    return null;
  }

  return data;
}

// ============================================
// SUMMARY VIEWS
// ============================================

export async function getClientOutcomeSummaries(): Promise<ClientOutcomeSummary[]> {
  const { data, error } = await supabase
    .from('client_outcome_summary')
    .select('*')
    .order('total_impact_value', { ascending: false });

  if (error) {
    console.error('Error fetching client outcome summaries:', error);
    return [];
  }

  return (data || []).map(row => ({
    clientId: row.client_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    programsEnrolled: row.programs_enrolled || 0,
    programsCompleted: row.programs_completed || 0,
    totalServices: row.total_services || 0,
    totalServiceHours: parseFloat(row.total_service_hours) || 0,
    lastServiceDate: row.last_service_date,
    totalOutcomes: row.total_outcomes || 0,
    totalImpactValue: parseFloat(row.total_impact_value) || 0,
    clientStatus: row.client_status,
    firstEnrollmentDate: row.first_enrollment_date,
    lastCompletionDate: row.last_completion_date,
  }));
}

export async function getProgramImpactSummaries(): Promise<ProgramImpactSummary[]> {
  const { data, error } = await supabase
    .from('program_impact_summary')
    .select('*')
    .order('total_impact_value', { ascending: false });

  if (error) {
    console.error('Error fetching program impact summaries:', error);
    return [];
  }

  return (data || []).map(row => ({
    programId: row.program_id,
    programName: row.program_name,
    programCategory: row.program_category as ProgramCategory,
    costPerParticipant: parseFloat(row.cost_per_participant) || 0,
    isActive: row.is_active,
    totalEnrolled: row.total_enrolled || 0,
    currentlyActive: row.currently_active || 0,
    totalCompleted: row.total_completed || 0,
    avgAttendanceRate: parseFloat(row.avg_attendance_rate) || 0,
    totalServices: row.total_services || 0,
    totalServiceHours: parseFloat(row.total_service_hours) || 0,
    totalOutcomes: row.total_outcomes || 0,
    totalImpactValue: parseFloat(row.total_impact_value) || 0,
    completionRate: parseFloat(row.completion_rate) || 0,
    outcomesPerGraduate: parseFloat(row.outcomes_per_graduate) || 0,
    costPerOutcome: parseFloat(row.cost_per_outcome) || 0,
    roiPercentage: parseFloat(row.roi_percentage) || 0,
  }));
}

// ============================================
// IMPACT STATS
// ============================================

export async function getImpactStats(): Promise<ImpactStats> {
  // Get program counts
  const { data: programs } = await supabase
    .from('programs')
    .select('id, is_active');

  // Get client counts
  const { data: progress } = await supabase
    .from('client_progress')
    .select('client_id, current_stage');

  // Get service totals
  const { data: services } = await supabase
    .from('services')
    .select('id, duration_minutes, status')
    .eq('status', 'completed');

  // Get outcome totals
  const { data: outcomes } = await supabase
    .from('outcomes')
    .select('id, impact_value');

  // Get program impact summaries for rates
  const summaries = await getProgramImpactSummaries();

  const totalPrograms = programs?.length || 0;
  const activePrograms = programs?.filter(p => p.is_active).length || 0;

  const uniqueClients = new Set(progress?.map(p => p.client_id) || []);
  const activeClients = new Set(
    progress?.filter(p => ['enrolled', 'active', 'completing'].includes(p.current_stage))
      .map(p => p.client_id) || []
  );

  const totalServices = services?.length || 0;
  const totalServiceHours = (services || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

  const totalOutcomes = outcomes?.length || 0;
  const totalImpactValue = (outcomes || []).reduce((sum, o) => sum + (parseFloat(o.impact_value) || 0), 0);

  const avgCompletionRate = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.completionRate, 0) / summaries.length
    : 0;

  const avgCostPerOutcome = summaries.length > 0
    ? summaries.filter(s => s.costPerOutcome > 0).reduce((sum, s) => sum + s.costPerOutcome, 0) /
      summaries.filter(s => s.costPerOutcome > 0).length || 0
    : 0;

  const overallROI = summaries.length > 0
    ? summaries.reduce((sum, s) => sum + s.roiPercentage, 0) / summaries.length
    : 0;

  return {
    totalPrograms,
    activePrograms,
    totalClientsServed: uniqueClients.size,
    activeClients: activeClients.size,
    totalServicesDelivered: totalServices,
    totalServiceHours,
    totalOutcomes,
    totalImpactValue,
    avgCompletionRate,
    avgCostPerOutcome,
    overallROI,
  };
}

// Export all functions as outcomeService object
export const outcomeService = {
  // Programs
  getPrograms,
  getActivePrograms,
  getProgramById,
  createProgram,
  updateProgram,
  // Services
  getServices,
  getClientServices,
  getServicesByProgram,
  getServiceCount,
  recordService,
  updateService,
  deleteService,
  calculateAttendanceRate,
  // Client Progress
  getClientProgress,
  getProgressStages,
  enrollClient,
  updateClientStage,
  completeProgram,
  withdrawClient,
  markAtRisk,
  getCompletionRate,
  // Outcomes
  getOutcomes,
  getClientOutcomes,
  getOutcomesByType,
  recordOutcome,
  verifyOutcome,
  calculateImpactValue,
  calculateAggregateImpact,
  calculateProgramROI,
  // Program Results
  getProgramResults,
  calculateProgramResults,
  // Impact Snapshots
  getImpactSnapshots,
  getLatestSnapshot,
  createImpactSnapshot,
  // Summaries
  getClientOutcomeSummaries,
  getProgramImpactSummaries,
  getImpactStats,
};
