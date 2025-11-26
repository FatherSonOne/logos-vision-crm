// Database Service - Handles all database operations
// This replaces mockData with real Supabase queries

import { supabase } from './supabaseClient';
import type { Client, Project, TeamMember, Task, Activity, Case, Donation, Volunteer } from '../types';

// ============================================
// CLIENTS
// ============================================

export async function getAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<Client>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// PROJECTS
// ============================================

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      team:project_team_assignments(team_member:team_members(*))
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*),
      team:project_team_assignments(team_member:team_members(*)),
      tasks(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([project])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// TASKS
// ============================================

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('due_date', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ============================================
// TEAM MEMBERS
// ============================================

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt'>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert([member])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// ACTIVITIES
// ============================================

export async function getAllActivities(): Promise<Activity[]> {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('activity_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// CASES
// ============================================

export async function getAllCases(): Promise<Case[]> {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createCase(caseData: Omit<Case, 'id' | 'createdAt'>): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .insert([caseData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCase(id: string, updates: Partial<Case>): Promise<Case> {
  const { data, error } = await supabase
    .from('cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// DONATIONS
// ============================================

export async function getAllDonations(): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .order('donation_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function createDonation(donation: Omit<Donation, 'id' | 'createdAt'>): Promise<Donation> {
  const { data, error } = await supabase
    .from('donations')
    .insert([donation])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// VOLUNTEERS
// ============================================

export async function getAllVolunteers(): Promise<Volunteer[]> {
  const { data, error } = await supabase
    .from('volunteers')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function createVolunteer(volunteer: Omit<Volunteer, 'id' | 'createdAt'>): Promise<Volunteer> {
  const { data, error } = await supabase
    .from('volunteers')
    .insert([volunteer])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ============================================
// SEARCH
// ============================================

export async function searchAll(query: string) {
  const searchTerm = `%${query}%`;
  
  const [clients, projects, cases] = await Promise.all([
    supabase.from('clients').select('*').ilike('name', searchTerm),
    supabase.from('projects').select('*').ilike('name', searchTerm),
    supabase.from('cases').select('*').ilike('title', searchTerm)
  ]);

  return {
    clients: clients.data || [],
    projects: projects.data || [],
    cases: cases.data || []
  };
}
