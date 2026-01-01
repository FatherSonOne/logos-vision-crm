// Local Search Service - Fast text-based search for CRM data
// Works offline without AI, provides instant results

import type {
  Project,
  Client,
  TeamMember,
  Activity,
  Volunteer,
  Case,
  Document,
  EnrichedTask,
  Page,
} from '../types';
import { navigationSections, mainNav } from '../components/navigationConfig';

// Search result types
export interface NavSearchResult {
  type: 'navigation';
  pageId: Page;
  label: string;
  section: string;
  keywords: string[];
}

export interface FeatureSearchResult {
  type: 'feature';
  label: string;
  description: string;
  action: string; // Action identifier
  keywords: string[];
}

export interface LocalSearchResults {
  navigation: NavSearchResult[];
  features: FeatureSearchResult[];
  projects: Project[];
  clients: Client[];
  tasks: EnrichedTask[];
  teamMembers: TeamMember[];
  activities: Activity[];
  volunteers: Volunteer[];
  cases: Case[];
  documents: Document[];
}

// Navigation items with enhanced keywords for better matching
const navSearchIndex: NavSearchResult[] = [
  // Main nav
  { type: 'navigation', pageId: 'dashboard', label: 'Dashboard', section: 'Main', keywords: ['home', 'overview', 'summary', 'main', 'start'] },

  // Manage section
  { type: 'navigation', pageId: 'contacts', label: 'Contacts', section: 'Manage', keywords: ['people', 'organizations', 'donors', 'clients', 'relationships', 'directory', 'address book'] },
  { type: 'navigation', pageId: 'projects', label: 'Projects', section: 'Manage', keywords: ['work', 'initiatives', 'campaigns', 'programs', 'kanban', 'timeline'] },
  { type: 'navigation', pageId: 'case', label: 'Case Management', section: 'Manage', keywords: ['issues', 'tickets', 'support', 'problems', 'tracking', 'cases'] },
  { type: 'navigation', pageId: 'activities', label: 'Activities', section: 'Manage', keywords: ['meetings', 'calls', 'emails', 'touchpoints', 'interactions', 'schedule'] },

  // Outreach section
  { type: 'navigation', pageId: 'outreach-hub', label: 'Outreach Hub', section: 'Outreach', keywords: ['marketing', 'email campaigns', 'communications', 'fundraising', 'donors', 'analytics'] },
  { type: 'navigation', pageId: 'charity', label: 'Charity Hub', section: 'Outreach', keywords: ['donations', 'giving', 'fundraising', 'donors', 'pledges', 'stewardship'] },

  // Workspace section
  { type: 'navigation', pageId: 'tasks', label: 'Tasks', section: 'Workspace', keywords: ['todos', 'to-do', 'checklist', 'assignments', 'work items'] },
  { type: 'navigation', pageId: 'calendar', label: 'Calendar', section: 'Workspace', keywords: ['schedule', 'events', 'appointments', 'dates', 'meetings', 'google calendar'] },
  { type: 'navigation', pageId: 'documents', label: 'Documents', section: 'Workspace', keywords: ['files', 'library', 'attachments', 'uploads', 'pdfs', 'resources'] },
  { type: 'navigation', pageId: 'reports', label: 'Reports', section: 'Workspace', keywords: ['analytics', 'metrics', 'data', 'charts', 'graphs', 'insights', 'kpi'] },
  { type: 'navigation', pageId: 'impact', label: 'Impact', section: 'Workspace', keywords: ['outcomes', 'results', 'measurement', 'success', 'goals', 'impact reports'] },
  { type: 'navigation', pageId: 'team', label: 'Team', section: 'Workspace', keywords: ['staff', 'members', 'employees', 'colleagues', 'people', 'team members', 'consultants'] },

  // Connect section
  { type: 'navigation', pageId: 'connect', label: 'Connect Hub', section: 'Connect', keywords: ['integration', 'sync', 'pulse', 'entomate', 'communication', 'chat'] },

  // Forge section
  { type: 'navigation', pageId: 'forge', label: 'AI Forge', section: 'Forge', keywords: ['ai', 'artificial intelligence', 'assistant', 'tools', 'generator', 'automation', 'gemini'] },

  // System section
  { type: 'navigation', pageId: 'settings', label: 'Settings', section: 'System', keywords: ['preferences', 'configuration', 'options', 'account', 'profile', 'theme'] },
  { type: 'navigation', pageId: 'design-preview', label: 'Design Preview', section: 'System', keywords: ['ui', 'theme', 'colors', 'styling', 'appearance', 'preview'] },
];

// Feature shortcuts - quick actions users can search for
const featureSearchIndex: FeatureSearchResult[] = [
  { type: 'feature', label: 'Add New Contact', description: 'Create a new contact or organization', action: 'add-contact', keywords: ['create contact', 'new person', 'add donor', 'new organization'] },
  { type: 'feature', label: 'Add New Project', description: 'Start a new project', action: 'add-project', keywords: ['create project', 'new initiative', 'start project'] },
  { type: 'feature', label: 'Add Team Member', description: 'Add someone to your team', action: 'add-team-member', keywords: ['invite', 'new member', 'add staff', 'add colleague'] },
  { type: 'feature', label: 'Record Donation', description: 'Log a new donation', action: 'record-donation', keywords: ['gift', 'contribution', 'new donation', 'add donation'] },
  { type: 'feature', label: 'Create Activity', description: 'Schedule a meeting, call, or task', action: 'add-activity', keywords: ['schedule meeting', 'log call', 'add meeting', 'new activity'] },
  { type: 'feature', label: 'Open Case', description: 'Create a new case or issue', action: 'add-case', keywords: ['new case', 'create issue', 'open ticket', 'report problem'] },
  { type: 'feature', label: 'Upload Document', description: 'Add a file to the document library', action: 'upload-document', keywords: ['add file', 'upload file', 'new document'] },
  { type: 'feature', label: 'AI Project Planner', description: 'Use AI to plan a new project', action: 'ai-project-planner', keywords: ['generate plan', 'ai plan', 'project generator'] },
  { type: 'feature', label: 'AI Chat', description: 'Chat with the AI assistant', action: 'ai-chat', keywords: ['ask ai', 'help', 'assistant', 'gemini chat'] },
  { type: 'feature', label: 'Quick Actions', description: 'Open the quick actions menu', action: 'quick-actions', keywords: ['commands', 'shortcuts', 'quick add', 'command palette'] },
  { type: 'feature', label: 'Toggle Dark Mode', description: 'Switch between light and dark theme', action: 'toggle-theme', keywords: ['dark mode', 'light mode', 'theme', 'night mode'] },
  { type: 'feature', label: 'Export Data', description: 'Export your data', action: 'export', keywords: ['download', 'backup', 'csv', 'export'] },
];

// Text matching utility - case insensitive, partial match
function matchesQuery(text: string | undefined | null, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

// Score a match - higher score = better match
function scoreMatch(text: string | undefined | null, query: string): number {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact match
  if (lowerText === lowerQuery) return 100;

  // Starts with query
  if (lowerText.startsWith(lowerQuery)) return 80;

  // Word starts with query
  const words = lowerText.split(/\s+/);
  if (words.some(w => w.startsWith(lowerQuery))) return 60;

  // Contains query
  if (lowerText.includes(lowerQuery)) return 40;

  return 0;
}

// Perform local search across all data
export function performLocalSearch(
  query: string,
  data: {
    projects: Project[];
    clients: Client[];
    tasks: EnrichedTask[];
    teamMembers: TeamMember[];
    activities: Activity[];
    volunteers: Volunteer[];
    cases: Case[];
    documents: Document[];
  }
): LocalSearchResults {
  const q = query.toLowerCase().trim();

  if (!q) {
    return {
      navigation: [],
      features: [],
      projects: [],
      clients: [],
      tasks: [],
      teamMembers: [],
      activities: [],
      volunteers: [],
      cases: [],
      documents: [],
    };
  }

  // Search navigation items
  const navigation = navSearchIndex.filter(nav =>
    matchesQuery(nav.label, q) ||
    matchesQuery(nav.section, q) ||
    nav.keywords.some(kw => matchesQuery(kw, q))
  ).sort((a, b) => {
    const scoreA = Math.max(scoreMatch(a.label, q), ...a.keywords.map(kw => scoreMatch(kw, q)));
    const scoreB = Math.max(scoreMatch(b.label, q), ...b.keywords.map(kw => scoreMatch(kw, q)));
    return scoreB - scoreA;
  });

  // Search features
  const features = featureSearchIndex.filter(feat =>
    matchesQuery(feat.label, q) ||
    matchesQuery(feat.description, q) ||
    feat.keywords.some(kw => matchesQuery(kw, q))
  ).sort((a, b) => {
    const scoreA = Math.max(scoreMatch(a.label, q), scoreMatch(a.description, q));
    const scoreB = Math.max(scoreMatch(b.label, q), scoreMatch(b.description, q));
    return scoreB - scoreA;
  });

  // Search projects
  const projects = data.projects.filter(p =>
    matchesQuery(p.name, q) ||
    matchesQuery(p.description, q) ||
    matchesQuery(p.status, q)
  );

  // Search clients/organizations
  const clients = data.clients.filter(c =>
    matchesQuery(c.name, q) ||
    matchesQuery(c.contactPerson, q) ||
    matchesQuery(c.email, q) ||
    matchesQuery(c.location, q)
  );

  // Search tasks
  const tasks = data.tasks.filter(t =>
    matchesQuery(t.description, q) ||
    matchesQuery(t.projectName, q) ||
    matchesQuery(t.status, q)
  );

  // Search team members
  const teamMembers = data.teamMembers.filter(tm =>
    matchesQuery(tm.name, q) ||
    matchesQuery(tm.email, q) ||
    matchesQuery(tm.role, q) ||
    matchesQuery(tm.phone, q)
  );

  // Search activities
  const activities = data.activities.filter(a =>
    matchesQuery(a.title, q) ||
    matchesQuery(a.notes, q) ||
    matchesQuery(a.type, q)
  );

  // Search volunteers
  const volunteers = data.volunteers.filter(v =>
    matchesQuery(v.name, q) ||
    matchesQuery(v.email, q) ||
    v.skills.some(skill => matchesQuery(skill, q))
  );

  // Search cases
  const cases = data.cases.filter(c =>
    matchesQuery(c.title, q) ||
    matchesQuery(c.description, q) ||
    matchesQuery(c.status, q) ||
    matchesQuery(c.priority, q)
  );

  // Search documents
  const documents = data.documents.filter(d =>
    matchesQuery(d.name, q) ||
    matchesQuery(d.category, q)
  );

  return {
    navigation,
    features,
    projects,
    clients,
    tasks,
    teamMembers,
    activities,
    volunteers,
    cases,
    documents,
  };
}

// Get total count of results
export function getLocalSearchResultCount(results: LocalSearchResults): number {
  return (
    results.navigation.length +
    results.features.length +
    results.projects.length +
    results.clients.length +
    results.tasks.length +
    results.teamMembers.length +
    results.activities.length +
    results.volunteers.length +
    results.cases.length +
    results.documents.length
  );
}
