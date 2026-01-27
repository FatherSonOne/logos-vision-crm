// src/services/pulseToLogosSync.ts

import { logosSupabase } from '../lib/supabaseLogosClient';

// Use environment variables for Pulse Supabase credentials
const PULSE_SUPABASE_URL = import.meta.env.VITE_PULSE_SUPABASE_URL || import.meta.env.HUB_SUPABASE_URL;
const PULSE_SUPABASE_KEY = import.meta.env.VITE_PULSE_SUPABASE_KEY || import.meta.env.HUB_SUPABASE_ANON_KEY;

async function fetchFromPulse(path: string, query: string = '') {
  const url = `${PULSE_SUPABASE_URL}/rest/v1/${path}${query}`;
  const response = await fetch(url, {
    headers: {
      apikey: PULSE_SUPABASE_KEY,
      Authorization: `Bearer ${PULSE_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Pulse fetch failed for ${path}: ${err}`);
  }

  return response.json();
}

export async function syncPulseContactsToLogosClients() {
  console.log('🔄 Pulse → Logos: syncing contacts → lv_clients');

  // logos_contacts in Pulse → lv_clients in Logos
  const contacts = await fetchFromPulse('logos_contacts');

  let upserted = 0;

  for (const c of contacts) {
    const { id, first_name, last_name, email, phone, company, status } = c;

    const { error } = await logosSupabase
      .from('lv_clients')
      .upsert(
        {
          id,
          name: [first_name, last_name].filter(Boolean).join(' ') || company || 'Unknown',
          contact_person: [first_name, last_name].filter(Boolean).join(' ') || null,
          email: email || null,
          phone: phone || null,
          location: company || null,
          status: status || 'active',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('❌ Failed to upsert lv_clients from Pulse contact', id, error);
    } else {
      upserted++;
    }
  }

  console.log(`✅ Pulse → Logos: synced ${upserted} clients`);
  return { clientsSynced: upserted };
}

export async function syncPulseProjectsToLogosProjects() {
  console.log('🔄 Pulse → Logos: syncing projects → lv_projects');

  // logos_projects in Pulse → lv_projects in Logos
  const projects = await fetchFromPulse('logos_projects');

  let upserted = 0;

  for (const p of projects) {
    const {
      id,
      name,
      description,
      client_id,
      status,
      start_date,
      due_date,
    } = p;

    // Check if client exists in lv_clients
    let clientIdForInsert: string | null = client_id || null;
    if (client_id) {
      const { data: clientRow } = await logosSupabase
        .from('lv_clients')
        .select('id')
        .eq('id', client_id)
        .maybeSingle();

      if (!clientRow) {
        console.warn(
          '⚠️ Pulse → Logos: project has unknown client_id, setting to null',
          { projectId: id, client_id }
        );
        clientIdForInsert = null;
      }
    }

    const { error } = await logosSupabase
      .from('lv_projects')
      .upsert(
        {
          id,
          name: name || 'Untitled project',
          description: description || null,
          client_id: clientIdForInsert,
          status: status || 'active',
          start_date: start_date || null,
          end_date: due_date || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('❌ Failed to upsert lv_projects from Pulse project', id, error);
    } else {
      upserted++;
    }
  }

  console.log(`✅ Pulse → Logos: synced ${upserted} projects`);
  return { projectsSynced: upserted };
}

export async function syncPulseToLogosAll() {
  console.log('🚀 Pulse → Logos: full sync starting');

  const clientsResult = await syncPulseContactsToLogosClients();
  const projectsResult = await syncPulseProjectsToLogosProjects();

  console.log('✅ Pulse → Logos: full sync complete', {
    ...clientsResult,
    ...projectsResult,
  });

  return {
    ...clientsResult,
    ...projectsResult,
  };
}
