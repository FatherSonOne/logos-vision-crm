
import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { syncProjectToChannel, syncAll } from './services/logosSync';
import { syncPulseToLogosAll } from './services/pulseToLogosSync';
import { taskManagementService, type ExtendedTask as TaskViewExtendedTask } from './services/taskManagementService';
import { portalDbService } from './services/portalDbService';
import { performAdvancedSearch } from './services/geminiService';
import { performLocalSearch } from './services/localSearchService';
import { authService } from './services/authService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Core layout components (not lazy loaded - needed immediately)
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary, PageErrorBoundary, LoadingState } from './components/ErrorBoundary';
import { useToast } from './components/ui/Toast';
import { QuickActions, useQuickActions } from './components/QuickActions';
import { Login } from './components/Login';

// Types
import type { Client, TeamMember, Project, EnrichedTask, Activity, ChatRoom, ChatMessage, Donation, Volunteer, Case, Document as AppDocument, Webpage, CaseComment, Event, PortalLayout, EmailCampaign, WebSearchResult, SearchResults, AiProjectPlan, Task, RecentItem } from './types';
import { ProjectStatus, TaskStatus, ActivityType, ActivityStatus, CaseStatus, DocumentCategory, WebpageStatus } from './types';
import type { Page } from './types';
import { getBreadcrumbsForPage, type BreadcrumbItem } from './components/ui/Breadcrumbs';

// Lazy-loaded page components for better performance
const ProjectList = lazy(() => import('./components/ProjectList').then(m => ({ default: m.ProjectList })));
const ProjectDetail = lazy(() => import('./components/ProjectDetail').then(m => ({ default: m.ProjectDetail })));
const ProjectHub = lazy(() => import('./components/ProjectHub').then(m => ({ default: m.ProjectHub })));
const ProjectsCommandCenter = lazy(() => import('./components/ProjectsCommandCenter').then(m => ({ default: m.ProjectsCommandCenter })));
const Contacts = lazy(() => import('./components/Contacts').then(m => ({ default: m.Contacts })));
const ContactDetail = lazy(() => import('./components/ContactDetail').then(m => ({ default: m.ContactDetail })));
const ContactsPageNew = lazy(() => import('./components/contacts/ContactsPage').then(m => ({ default: m.ContactsPage })));
const OrganizationList = lazy(() => import('./components/OrganizationList').then(m => ({ default: m.OrganizationList })));
const OrganizationDetail = lazy(() => import('./components/OrganizationDetail').then(m => ({ default: m.OrganizationDetail })));
const TeamMemberList = lazy(() => import('./components/ConsultantList').then(m => ({ default: m.TeamMemberList })));
const ActivityFeed = lazy(() => import('./components/ActivityFeed').then(m => ({ default: m.ActivityFeed })));
const CalendarView = lazy(() => import('./components/CalendarView').then(m => ({ default: m.CalendarView })));
const TaskView = lazy(() => import('./components/TaskView').then(m => ({ default: m.TaskView })));
const Donations = lazy(() => import('./components/Donations').then(m => ({ default: m.Donations })));
const Stewardship = lazy(() => import('./components/Stewardship').then(m => ({ default: m.Stewardship })));
const CampaignManagement = lazy(() => import('./components/CampaignManagement').then(m => ({ default: m.CampaignManagement })));
const FormGenerator = lazy(() => import('./components/FormGenerator').then(m => ({ default: m.FormGenerator })));
const VolunteerList = lazy(() => import('./components/VolunteerList').then(m => ({ default: m.VolunteerList })));
const CharityTracker = lazy(() => import('./components/CharityTracker').then(m => ({ default: m.CharityTracker })));
const CharityHub = lazy(() => import('./components/CharityHub'));
const CaseManagement = lazy(() => import('./components/CaseManagement').then(m => ({ default: m.CaseManagement })));
const DocumentLibrary = lazy(() => import('./components/DocumentLibrary').then(m => ({ default: m.DocumentLibrary })));
const DocumentsHub = lazy(() => import('./components/documents/DocumentsHub').then(m => ({ default: m.default })));
const WebManagement = lazy(() => import('./components/WebManagement').then(m => ({ default: m.WebManagement })));
const GoldPages = lazy(() => import('./components/GoldPages').then(m => ({ default: m.GoldPages })));
const AiChatBot = lazy(() => import('./components/AiChatBot').then(m => ({ default: m.AiChatBot })));
const AiContentStudio = lazy(() => import('./components/AiContentStudio').then(m => ({ default: m.AiContentStudio })));
const LiveChat = lazy(() => import('./components/LiveChat').then(m => ({ default: m.LiveChat })));
const SearchResultsPage = lazy(() => import('./components/SearchResultsPage').then(m => ({ default: m.SearchResultsPage })));
const CaseDetail = lazy(() => import('./components/CaseDetail').then(m => ({ default: m.CaseDetail })));
const EventEditor = lazy(() => import('./components/EventEditor').then(m => ({ default: m.EventEditor })));
const ReportsHub = lazy(() => import('./components/reports/ReportsHub').then(m => ({ default: m.ReportsHub })));
const AnalyticsDashboard = lazy(() => import('./components/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })));
const PortalBuilder = lazy(() => import('./components/PortalBuilder').then(m => ({ default: m.PortalBuilder })));
const ClientPortalLogin = lazy(() => import('./components/ClientPortalLogin').then(m => ({ default: m.ClientPortalLogin })));
const ClientPortal = lazy(() => import('./components/ClientPortal').then(m => ({ default: m.ClientPortal })));
const EmailCampaigns = lazy(() => import('./components/EmailCampaigns').then(m => ({ default: m.EmailCampaigns })));
const GrantAssistant = lazy(() => import('./components/GrantAssistant').then(m => ({ default: m.GrantAssistant })));
const CalendarIntegration = lazy(() => import('./components/CalendarIntegration').then(m => ({ default: m.CalendarIntegration })));
const ImpactDashboard = lazy(() => import('./components/ImpactDashboard').then(m => ({ default: m.ImpactDashboard })));
const ImpactReportBuilder = lazy(() => import('./components/ImpactReportBuilder').then(m => ({ default: m.ImpactReportBuilder })));
const DonorPipeline = lazy(() => import('./components/DonorPipeline').then(m => ({ default: m.DonorPipeline })));
const CultivationPlanBuilder = lazy(() => import('./components/CultivationPlanBuilder').then(m => ({ default: m.CultivationPlanBuilder })));
const TouchpointTracker = lazy(() => import('./components/TouchpointTracker').then(m => ({ default: m.TouchpointTracker })));
const TimelineDemo = lazy(() => import('./components/TimelineDemo').then(m => ({ default: m.TimelineDemo })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const OutreachHub = lazy(() => import('./components/OutreachHub').then(m => ({ default: m.OutreachHub })));
const ConnectHub = lazy(() => import('./components/ConnectHub').then(m => ({ default: m.ConnectHub })));
const DesignPreview = lazy(() => import('./components/DesignPreview').then(m => ({ default: m.DesignPreview })));
const GuidedTour = lazy(() => import('./components/GuidedTour').then(m => ({ default: m.GuidedTour })));
const ConversationalAssistant = lazy(() => import('./components/ConversationalAssistant').then(m => ({ default: m.ConversationalAssistant })));

// Dialogs and modals (lazy loaded when needed)
const ActivityDialog = lazy(() => import('./components/ActivityDialog').then(m => ({ default: m.ActivityDialog })));
const PulseChat = lazy(() => import('./components/PulseChat').then(m => ({ default: m.PulseChat })));
const PulseIntegrationSettings = lazy(() => import('./components/PulseIntegrationSettings').then(m => ({ default: m.PulseIntegrationSettings })));
const SyncStatusWidget = lazy(() => import('./components/SyncStatusWidget').then(m => ({ default: m.SyncStatusWidget })));
const CreateRoomDialog = lazy(() => import('./components/CreateRoomDialog').then(m => ({ default: m.CreateRoomDialog })));
const VideoConference = lazy(() => import('./components/VideoConference').then(m => ({ default: m.VideoConference })));
const AddTeamMemberDialog = lazy(() => import('./components/AddTeamMemberDialog').then(m => ({ default: m.AddTeamMemberDialog })));
const AddContactDialog = lazy(() => import('./components/AddContactDialog').then(m => ({ default: m.AddContactDialog })));
const AddVolunteerDialog = lazy(() => import('./components/AddVolunteerDialog').then(m => ({ default: m.AddVolunteerDialog })));
const CaseDialog = lazy(() => import('./components/CaseDialog').then(m => ({ default: m.CaseDialog })));

// Household and Pledge components
const HouseholdList = lazy(() => import('./components/households').then(m => ({ default: m.HouseholdList })));
const HouseholdDetail = lazy(() => import('./components/households').then(m => ({ default: m.HouseholdDetail })));
const HouseholdModal = lazy(() => import('./components/households').then(m => ({ default: m.HouseholdModal })));
const PledgeList = lazy(() => import('./components/pledges').then(m => ({ default: m.PledgeList })));
const PledgeModal = lazy(() => import('./components/pledges').then(m => ({ default: m.PledgeModal })));
const PledgeDetail = lazy(() => import('./components/pledges').then(m => ({ default: m.PledgeDetail })));
import { OnboardingFlow, useOnboarding } from '@/components/OnboardingFlow';
import {
  BottomNav,
  FloatingActionButton,
  useIsMobile,
  HomeIcon as MobileHomeIcon,
  ContactsIcon as MobileContactsIcon,
  DonationsIcon as MobileDonationsIcon,
  TasksIcon as MobileTasksIcon,
  MoreIcon as MobileMoreIcon
} from '@/components/MobileOptimized';
import { getTourStepsForPage } from './components/ui/PageTourSteps';
import { KeyboardShortcutsPanel, useKeyboardShortcuts } from './components/KeyboardShortcutsPanel';
import { QuickAddButton, QuickAction } from './components/quickadd/QuickAddButton';
import { ProjectPlannerModal } from './components/ProjectPlannerModal';
import { MeetingAssistantModal } from './components/MeetingAssistantModal';
import { ClipboardListIcon, CaseIcon, BuildingIcon, SparklesIcon, FolderIcon, CalendarIcon, HandHeartIcon, DonationIcon, CheckSquareIcon, UsersIcon, SearchIcon, ReportsIcon } from './components/icons';
import { activityService } from './services/activityService';
import { projectService } from './services/projectService';
import { clientService } from './services/clientService';
import { taskService } from './services/taskService';
import { teamMemberService } from './services/teamMemberService';
import { volunteerService } from './services/volunteerService';
import { documentService } from './services/documentService';
import { caseService } from './services/caseService';
import { donationService } from './services/donationService';
import * as mockData from './data/mockData';

// 🔧 DEVELOPMENT MODE: Set to true to use sample data, false to use Supabase
const USE_SAMPLE_DATA = false;

// Temporary global test helper
// @ts-ignore
window.testLogosSync = async () => {
  const result = await syncProjectToChannel({
    id: 'test-1',
    name: 'Test Project',
    description: 'Test',
    clientId: 'c1',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    status: 'In Progress',
  });
  console.log('✅ Success:', result);
};

// Temporary global for manual testing of reverse sync
// @ts-ignore
window.syncPulseToLogosAll = syncPulseToLogosAll;

const App: React.FC = () => {
  const { showToast } = useToast();

  // Authentication state
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // All state now starts empty and loads from Supabase
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  
  // Default team members (used if localStorage is empty)
  const defaultTeamMembers: TeamMember[] = [
    { id: 'tm-1', name: 'Wajima Dreama Clay', email: '', role: '', permission: 'viewer' },
    { id: 'tm-2', name: 'Julie Satler Hughes', email: '', role: '', permission: 'viewer' },
    { id: 'tm-3', name: 'Tabitha Ellen Jordan', email: '', role: '', permission: 'viewer' },
    { id: 'tm-4', name: 'Kimberley Ann Luzzi', email: '', role: '', permission: 'viewer' },
    { id: 'tm-5', name: 'Frank Richard Messana', email: '', role: 'Lead Development', permission: 'admin' },
    { id: 'tm-6', name: 'Magan Luzzi Messana', email: '', role: '', permission: 'admin' },
    { id: 'tm-7', name: 'Morgan Joseph Murray', email: '', role: '', permission: 'viewer' },
    { id: 'tm-8', name: 'Noah Sanders', email: '', role: '', permission: 'viewer' },
    { id: 'tm-9', name: 'Megan Larimer Sanders', email: '', role: '', permission: 'viewer' },
  ];

  // Load team members from localStorage or use defaults
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const stored = localStorage.getItem('logos-vision-team-members');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading team members from localStorage:', e);
    }
    return defaultTeamMembers;
  });
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);

  // Deduplicate team members array on mount and when it changes
  useEffect(() => {
    const uniqueMembers = teamMembers.reduce((acc: TeamMember[], current) => {
      const duplicate = acc.find(
        item => item.id === current.id || item.email.toLowerCase() === current.email.toLowerCase()
      );
      if (!duplicate) {
        return [...acc, current];
      }
      return acc;
    }, []);

    // Only update if duplicates were found
    if (uniqueMembers.length !== teamMembers.length) {
      console.log(`🔧 Removed ${teamMembers.length - uniqueMembers.length} duplicate team member(s)`);
      setTeamMembers(uniqueMembers);
    }
  }, [teamMembers.length]); // Only run when length changes to avoid infinite loops

  // Persist team members to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('logos-vision-team-members', JSON.stringify(teamMembers));
    } catch (e) {
      console.error('Error saving team members to localStorage:', e);
    }
  }, [teamMembers]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [tasks, setTasks] = useState<TaskViewExtendedTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoadingDonations, setIsLoadingDonations] = useState(true);
  
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(true);
  
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  
  // These remain as empty arrays for now (can be migrated later if needed)
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [webpages, setWebpages] = useState<Webpage[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [portalLayouts, setPortalLayouts] = useState<PortalLayout[]>([]);
  
  // Set to Frank Messana's ID by default (Lead Developer/Admin)
  const [currentUserId, setCurrentUserId] = useState<string>('tm-5');

// Helper function to map authenticated user to TeamMember
const mapAuthUserToTeamMember = useCallback((user: SupabaseUser | null): TeamMember | null => {
  if (!user) return null;

  // Create team member from auth user metadata
  const memberData: TeamMember = {
    id: user.id,
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    role: user.user_metadata?.role || 'Team Member',
    permission: user.user_metadata?.permission || 'viewer',
    profilePicture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    isActive: true,
    lastActiveAt: new Date().toISOString()
  };

  // Track what we return
  let resultMember: TeamMember = memberData;

  // Add or update team member (using functional update to avoid stale closures)
  setTeamMembers(prev => {
    // Check if member already exists by ID or email
    const existingIndex = prev.findIndex(
      tm => tm.id === memberData.id || tm.email.toLowerCase() === memberData.email.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Member exists - update it and return the updated member
      const updated = [...prev];
      resultMember = { ...prev[existingIndex], ...memberData };
      updated[existingIndex] = resultMember;
      return updated;
    }

    // Member doesn't exist - add it
    return [...prev, memberData];
  });

  return resultMember;
}, []); // Remove teamMembers dependency to prevent stale closures

// Load all data from Supabase or mock data
async function loadAllData() {
  // Local copies for sync
  let loadedClients: Client[] = [];
  let loadedProjects: Project[] = [];
  let loadedCases: Case[] = [];
  let loadedTasks: Task[] = [];
  let loadedActivities: Activity[] = [];

  // Load clients
  try {
    setIsLoadingClients(true);
    loadedClients = USE_SAMPLE_DATA ? mockData.mockClients : await clientService.getAll();
    setClients(loadedClients);
    console.log('✅ Loaded', loadedClients.length, 'clients from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading clients:', error);
    showToast('Failed to load clients', 'error');
  } finally {
    setIsLoadingClients(false);
  }

  // Load projects
  try {
    setIsLoadingProjects(true);
    loadedProjects = USE_SAMPLE_DATA ? mockData.mockProjects : await projectService.getAll();
    setProjects(loadedProjects);
    console.log('✅ Loaded', loadedProjects.length, 'projects from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading projects:', error);
    showToast('Failed to load projects', 'error');
  } finally {
    setIsLoadingProjects(false);
  }

  // Load cases
  try {
    setIsLoadingCases(true);
    loadedCases = USE_SAMPLE_DATA ? mockData.mockCases : await caseService.getAll();
    setCases(loadedCases);
    console.log('✅ Loaded', loadedCases.length, 'cases from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading cases:', error);
    showToast('Failed to load cases', 'error');
  } finally {
    setIsLoadingCases(false);
  }

  // Load tasks - Use taskManagementService for ExtendedTask format
  try {
    setIsLoadingTasks(true);
    const enrichedTasks = await taskManagementService.getAllEnriched();
    setTasks(enrichedTasks);
    console.log('✅ Loaded', enrichedTasks.length, 'tasks from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading tasks:', error);
    showToast('Failed to load tasks', 'error');
  } finally {
    setIsLoadingTasks(false);
  }

  // Load activities
  try {
    setIsLoadingActivities(true);
    loadedActivities = USE_SAMPLE_DATA ? mockData.mockActivities : await activityService.getAll();
    setActivities(loadedActivities);
    console.log('✅ Loaded', loadedActivities.length, 'activities from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading activities:', error);
    showToast('Failed to load activities', 'error');
  } finally {
    setIsLoadingActivities(false);
  }

  // Load other optional data (volunteers, donations, documents, etc.)
  try {
    setIsLoadingVolunteers(true);
    const volunteerData = USE_SAMPLE_DATA ? mockData.mockVolunteers : await volunteerService.getAll();
    setVolunteers(volunteerData);
    console.log('✅ Loaded', volunteerData.length, 'volunteers from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading volunteers:', error);
    showToast('Failed to load volunteers', 'error');
  } finally {
    setIsLoadingVolunteers(false);
  }

  try {
    setIsLoadingDonations(true);
    const donationData = USE_SAMPLE_DATA ? mockData.mockDonations : await donationService.getAll();
    setDonations(donationData);
    console.log('✅ Loaded', donationData.length, 'donations from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading donations:', error);
    showToast('Failed to load donations', 'error');
  } finally {
    setIsLoadingDonations(false);
  }

  // 👉 Sync everything to Supabase integration tables
  if (!USE_SAMPLE_DATA) {
    try {
      console.log('🛰 Running Logos → Pulse sync with:', {
        clients: loadedClients.length,
        projects: loadedProjects.length,
        cases: loadedCases.length,
        tasks: loadedTasks.length,
        activities: loadedActivities.length,
      });

      await syncAll(loadedProjects, loadedClients, loadedCases, loadedTasks, loadedActivities);
      console.log('SYNC RESULT', await syncAll(loadedProjects, loadedClients, loadedCases, loadedTasks, loadedActivities));
      console.log('✅ Logos → Pulse sync complete on app load');
    } catch (e) {
      console.error('❌ Logos → Pulse sync failed', e);
    }
  }

  // Load documents from Supabase
  try {
    const documentsData = USE_SAMPLE_DATA
      ? (mockData.mockDocuments || [])
      : await documentService.getAll();
    setDocuments(documentsData);
    console.log('✅ Loaded', documentsData.length, 'documents from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
  } catch (error) {
    console.error('❌ Error loading documents:', error);
    setDocuments([]);
  }

  // Load additional mock-only data
  if (USE_SAMPLE_DATA) {
    setEvents(mockData.mockEvents || []);
    setWebpages(mockData.mockWebpages || []);
    setEmailCampaigns(mockData.mockEmailCampaigns || []);
    setChatRooms(mockData.mockChatRooms || []);
    setChatMessages(mockData.mockChatMessages || []);
    setPortalLayouts(mockData.mockPortalLayouts || []);
    console.log('✅ Loaded additional sample data (events, webpages, campaigns, chat)');
  }

  // 👇 ADDITIONAL TEST: run syncAll and log result (helpful to prove sync runs)
  try {
    console.log('🚀 ABOUT TO RUN syncAll', {
      clientsCount: loadedClients?.length,
      projectsCount: loadedProjects?.length,
      casesCount: loadedCases?.length,
      tasksCount: loadedTasks?.length,
      activitiesCount: loadedActivities?.length,
    });

    const syncResult = await syncAll(
      loadedProjects || [],
      loadedClients || [],
      loadedCases || [],
      loadedTasks || [],
      loadedActivities || []
    );

    console.log('✅ SYNC RESULT', syncResult);
  } catch (e) {
    console.error('❌ syncAll threw error', e);
  }
}

// Authentication handlers
const handleLogin = async (email: string, password: string) => {
  try {
    const { user, error } = await authService.signIn(email, password);
    if (error) {
      showToast(error.message || 'Failed to sign in', 'error');
      return { error };
    }
    if (user) {
      showToast('Welcome back!', 'success');
    }
    return { error: null };
  } catch (error: any) {
    showToast(error.message || 'An error occurred', 'error');
    return { error };
  }
};

const handleSignUp = async (email: string, password: string, name: string) => {
  try {
    const { user, error } = await authService.signUp(email, password, { name, role: 'Team Member' });
    if (error) {
      showToast(error.message || 'Failed to sign up', 'error');
      return { error };
    }
    showToast('Account created! Please sign in.', 'success');
    return { error: null };
  } catch (error: any) {
    showToast(error.message || 'An error occurred', 'error');
    return { error };
  }
};

const handleGoogleSignIn = async () => {
  try {
    const { error } = await authService.signInWithOAuth('google');
    if (error) {
      showToast(error.message || 'Failed to sign in with Google', 'error');
      return { error };
    }
    return { error: null };
  } catch (error: any) {
    showToast(error.message || 'An error occurred', 'error');
    return { error };
  }
};

const handleSignOut = async () => {
  try {
    const userEmail = authUser?.email;
    const { error } = await authService.signOut({
      revokeGoogle: true,
      userEmail: userEmail || undefined
    });

    if (error) {
      showToast('Failed to sign out', 'error');
    } else {
      showToast('Signed out successfully', 'success');
      // Clear all app state
      setClients([]);
      setProjects([]);
      setTasks([]);
      setActivities([]);
      setDonations([]);
      setVolunteers([]);
      setCases([]);
      setDocuments([]);
      setWebpages([]);
      setEvents([]);
      setEmailCampaigns([]);
      setChatRooms([]);
      setChatMessages([]);
      setPortalLayouts([]);
    }
  } catch (error: any) {
    console.error('Error signing out:', error);
    showToast('An error occurred while signing out', 'error');
  }
};

// Task callback functions for real-time updates
const handleTasksUpdate = useCallback((updatedTasks: TaskViewExtendedTask[]) => {
  setTasks(updatedTasks);
}, []);

const handleTaskCreate = useCallback(async (newTask: TaskViewExtendedTask) => {
  setTasks(prev => [...prev, newTask]);
}, []);

const handleTaskUpdate = useCallback(async (updatedTask: TaskViewExtendedTask) => {
  setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
}, []);

const handleTaskDelete = useCallback(async (taskId: string) => {
  setTasks(prev => prev.filter(task => task.id !== taskId));
}, []);

// Check authentication state on mount
useEffect(() => {
  const checkAuth = async () => {
    try {
      setAuthLoading(true);

      // Get current user
      const user = await authService.getCurrentUser();

      if (user) {
        setAuthUser(user);
        setIsAuthenticated(true);

        // Map to team member and set current user
        const teamMember = mapAuthUserToTeamMember(user);
        if (teamMember) {
          setCurrentUserId(teamMember.id);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  checkAuth();

  // Listen for auth state changes
  const { data: authListener } = authService.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session);

    if (session?.user) {
      setAuthUser(session.user);
      setIsAuthenticated(true);

      // Map to team member and set current user
      const teamMember = mapAuthUserToTeamMember(session.user);
      if (teamMember) {
        setCurrentUserId(teamMember.id);
      }

      // Load data when user signs in
      if (event === 'SIGNED_IN') {
        loadAllData();
      }
    } else {
      setAuthUser(null);
      setIsAuthenticated(false);
    }
  });

  // Cleanup listener on unmount
  return () => {
    authListener?.subscription?.unsubscribe();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Load data on mount (only if authenticated)
useEffect(() => {
  if (isAuthenticated && !authLoading) {
    loadAllData();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated, authLoading]);

// Listen for document updates and reload documents
useEffect(() => {
  const handleDocumentsUpdated = async () => {
    try {
      console.log('🔄 Reloading documents...');
      const documentsData = USE_SAMPLE_DATA
        ? (mockData.mockDocuments || [])
        : await documentService.getAll();
      setDocuments(documentsData);
      console.log('✅ Reloaded', documentsData.length, 'documents');
    } catch (error) {
      console.error('❌ Error reloading documents:', error);
    }
  };

  window.addEventListener('documents-updated', handleDocumentsUpdated);
  return () => window.removeEventListener('documents-updated', handleDocumentsUpdated);
}, []);

// Run a one-time sync to Supabase when real data is loaded (skip sample data)
useEffect(() => {
  if (USE_SAMPLE_DATA) return;
  if ((!projects || projects.length === 0) && (!clients || clients.length === 0)) return;

  (async () => {
    try {
      await syncAll(projects, clients, cases, [], activities);
      console.log('✅ syncAll completed');
    } catch (e) {
      console.error('Sync failed', e);
    }
  })();
}, [projects, clients, cases, activities]);

  // Navigation history for back/forward functionality
  const [navigationHistory, setNavigationHistory] = useState<Page[]>(['dashboard']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Recent items for sidebar quick access (persisted to localStorage)
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    try {
      const saved = localStorage.getItem('logos-recent-items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string | null>(null);
  const [isHouseholdModalOpen, setIsHouseholdModalOpen] = useState(false);
  const [editingHouseholdId, setEditingHouseholdId] = useState<string | null>(null);
  const [selectedPledgeId, setSelectedPledgeId] = useState<string | null>(null);
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [editingPledgeId, setEditingPledgeId] = useState<string | null>(null);
  const [portalClientId, setPortalClientId] = useState<string | null>(null);

  // State for global search
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);

  // State for Dialogs (centralized)
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isCreateRoomDialogOpen, setIsCreateRoomDialogOpen] = useState(false);
  const [isAddTeamMemberDialogOpen, setIsAddTeamMemberDialogOpen] = useState(false);
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false);
  const [isAddVolunteerDialogOpen, setIsAddVolunteerDialogOpen] = useState(false);
  const [isCaseDialogOpen, setIsCaseDialogOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isProjectPlannerOpen, setIsProjectPlannerOpen] = useState(false);
  const [selectedActivityForAssistant, setSelectedActivityForAssistant] = useState<Activity | null>(null);


  // State for Gold Pages editor
  const [isGoldPagesEditorOpen, setIsGoldPagesEditorOpen] = useState(false);
  const [editingWebpage, setEditingWebpage] = useState<Webpage | null>(null);
  
  // State for Notifications
  const [notifications, setNotifications] = useState<Set<Page>>(new Set());

  // State for Guided Tour
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Quick Actions Command Palette
  const quickActionsState = useQuickActions();

  // Onboarding state
  const { isComplete: isOnboardingComplete, complete: completeOnboarding } = useOnboarding();

  // Keyboard shortcuts
  const keyboardShortcuts = useKeyboardShortcuts();

  // Mobile detection
  const isMobile = useIsMobile();

  // Mobile navigation items
  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: <MobileHomeIcon /> },
    { id: 'contacts', label: 'Contacts', icon: <MobileContactsIcon /> },
    { id: 'donations', label: 'Donate', icon: <MobileDonationsIcon /> },
    { id: 'tasks', label: 'Tasks', icon: <MobileTasksIcon />, badge: tasks.filter(t => t.status !== 'done').length },
    { id: 'menu', label: 'More', icon: <MobileMoreIcon /> },
  ];

  // Mobile FAB actions
  const mobileFabActions = [
    {
      id: 'add-contact',
      label: 'Add Contact',
      icon: <MobileContactsIcon />,
      color: 'bg-blue-500',
      onClick: () => setIsAddContactDialogOpen(true)
    },
    {
      id: 'add-donation',
      label: 'Log Donation',
      icon: <MobileDonationsIcon />,
      color: 'bg-green-500',
      onClick: () => navigateToPage('donations')
    },
    {
      id: 'add-task',
      label: 'New Task',
      icon: <MobileTasksIcon />,
      color: 'bg-purple-500',
      onClick: () => navigateToPage('tasks')
    },
  ];
  
  // Theme is now managed by ThemeToggle component and theme.ts module
  // No need for theme state here - theme initialization happens in index.html

  // Quick Add Actions Configuration
  const quickActions: QuickAction[] = useMemo(() => {
    const allActions: QuickAction[] = [
      {
        id: 'ai-chat',
        label: 'AI Assistant',
        icon: <SparklesIcon />,
        color: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300',
        onClick: () => setIsAiChatOpen(true)
      },
      {
        id: 'new-project',
        label: 'New Project',
        icon: <FolderIcon />,
        color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
        onClick: () => setIsProjectPlannerOpen(true),
      },
      {
        id: 'add-contact',
        label: 'Add Contact',
        icon: <UsersIcon />,
        color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300',
        onClick: () => setIsAddContactDialogOpen(true),
      },
      {
        id: 'record-donation',
        label: 'Record Donation',
        icon: <DonationIcon />,
        color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300',
        onClick: () => navigateToPage('charity'),
      },
      {
        id: 'schedule-meeting',
        label: 'Schedule Meeting',
        icon: <CalendarIcon />,
        color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
        onClick: () => {
          setEditingActivity({
            id: '',
            type: ActivityType.Meeting,
            title: '',
            status: ActivityStatus.Scheduled,
            activityDate: new Date().toISOString().split('T')[0],
            createdById: currentUserId,
          });
          setIsActivityDialogOpen(true);
        },
      },
      {
        id: 'log-activity',
        label: 'Log Activity',
        icon: <ClipboardListIcon />,
        color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-300',
        onClick: () => {
          setEditingActivity(null);
          setIsActivityDialogOpen(true);
        },
      },
      {
        id: 'create-task',
        label: 'Create Task',
        icon: <CheckSquareIcon />,
        color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300',
        onClick: () => navigateToPage('tasks'),
      },
      {
        id: 'add-volunteer',
        label: 'Add Volunteer',
        icon: <HandHeartIcon />,
        color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300',
        onClick: () => {
          setIsAddVolunteerDialogOpen(true);
        },
      },
      {
        id: 'create-case',
        label: 'Create Case',
        icon: <CaseIcon />,
        color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300',
        onClick: () => {
          setEditingCase(null);
          setIsCaseDialogOpen(true);
        },
      },
      {
        id: 'view-reports',
        label: 'View Reports',
        icon: <ReportsIcon />,
        color: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300',
        onClick: () => navigateToPage('reports'),
      },
      {
        id: 'global-search',
        label: 'Search Everything',
        icon: <SearchIcon />,
        color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300',
        onClick: () => quickActionsState.open(),
      },
    ];
    let primaryActionId: string | null = null;
    switch (currentPage) {
      case 'projects': primaryActionId = 'new-project'; break;
      case 'organizations':
      case 'contacts': primaryActionId = 'add-contact'; break;
      case 'case': primaryActionId = 'create-case'; break;
      case 'volunteers': primaryActionId = 'add-volunteer'; break;
      case 'activities': primaryActionId = 'log-activity'; break;
      case 'tasks': primaryActionId = 'create-task'; break;
      case 'charity':
      case 'donations': primaryActionId = 'record-donation'; break;
      case 'calendar': primaryActionId = 'schedule-meeting'; break;
      case 'reports': primaryActionId = 'view-reports'; break;
      case 'forge': primaryActionId = 'ai-chat'; break;
    }
    if (primaryActionId) {
      const primaryAction = allActions.find(a => a.id === primaryActionId);
      if (primaryAction) {
        const otherActions = allActions.filter(a => a.id !== primaryActionId);
        return [primaryAction, ...otherActions];
      }
    }
    return allActions;
  }, [currentPage, currentUserId]);

  // Get page-specific tour steps based on current page
  const tourSteps = useMemo(() => {
    return getTourStepsForPage(currentPage);
  }, [currentPage]);

 useEffect(() => {
    const layouts = portalDbService.getLayouts();
    setPortalLayouts(layouts);
    // Removed loadProjects() - now using loadAllData() which is called in its own useEffect
}, []);

  // Theme useEffect removed - now handled by theme.ts module and ThemeToggle component

  // Check for new data on initial load to set notifications
  useEffect(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const newNotifications = new Set<Page>();

    // Check for new cases
    if (cases.some(c => new Date(c.created_at || c.createdAt || '').getTime() > oneDayAgo)) {
        newNotifications.add('case');
    }
    // Check for new activities
    if (activities.some(a => new Date(a.activity_date || a.activityDate || '').getTime() > oneDayAgo)) {
        newNotifications.add('activities');
    }
    // Check for new donations
    if (donations.some(d => new Date(d.date || '').getTime() > oneDayAgo)) {
        newNotifications.add('donations');
    }
    
    setNotifications(newNotifications);
  }, [cases, activities, donations]);

  // Page labels for recent items and breadcrumbs
  const pageLabels: Record<Page, string> = useMemo(() => ({
    'dashboard': 'Dashboard',
    'organizations': 'Organizations',
    'contacts': 'Contacts',
    'clients': 'Clients',
    'households': 'Households',
    'projects': 'Projects',
    'project-hub': 'Project Hub',
    'team': 'Team',
    'activities': 'Activities',
    'calendar': 'Calendar',
    'calendar-settings': 'Calendar Settings',
    'volunteers': 'Volunteers',
    'charity': 'Charity Hub',
    'case': 'Case Management',
    'cases': 'Cases',
    'chat': 'Team Chat',
    'video': 'Video Conference',
    'tasks': 'Tasks',
    'email': 'Email Campaigns',
    'events': 'Events',
    'documents': 'Documents',
    'donations': 'Donations',
    'pledges': 'Pledges',
    'reports': 'Reports',
    'form-generator': 'Form Generator',
    'web-management': 'Web Management',
    'portal-builder': 'Portal Builder',
    'client-portal': 'Client Portal',
    'ai-tools': 'Content Studio',
    'grant-assistant': 'Grant Assistant',
    'live-chat': 'Live Chat',
    'stewardship': 'Stewardship',
    'campaigns': 'Campaigns',
    'analytics': 'Analytics',
    'impact': 'Impact',
    'impact-reports': 'Impact Reports',
    'donor-pipeline': 'Donor Pipeline',
    'cultivation': 'Cultivation',
    'touchpoints': 'Touchpoints',
    'search-results': 'Search Results',
    'pulse-settings': 'Pulse Settings',
    'entomate-sync': 'Entomate Sync',
    'settings': 'Settings',
    'outreach-hub': 'Outreach Hub',
    'forge': 'Content Studio',
    'connect': 'Connect Hub',
    'design-preview': 'Logo Preview'
  }), []);

  // Add item to recent items list
  const addToRecentItems = useCallback((page: Page, detailContext?: { id: string; label: string }) => {
    setRecentItems(prev => {
      const label = detailContext?.label || pageLabels[page] || page;
      const newItem: RecentItem = {
        page,
        label,
        timestamp: Date.now(),
        detailId: detailContext?.id
      };

      // Remove any existing entry for the same page+detailId combo
      const filtered = prev.filter(item =>
        !(item.page === page && item.detailId === detailContext?.id)
      );

      // Add new item at the start, limit to 10 items
      const updated = [newItem, ...filtered].slice(0, 10);

      // Persist to localStorage
      try {
        localStorage.setItem('logos-recent-items', JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }

      return updated;
    });
  }, [pageLabels]);

  // Navigate to a page (adds to history and recent items)
  const navigateToPage = useCallback((page: Page, detailContext?: { id: string; label: string }) => {
    // Update current page
    setCurrentPage(page);

    // Clear detail selections when navigating (unless we're staying on the same page with a detail)
    if (!detailContext) {
      setSelectedProjectId(null);
      setSelectedCaseId(null);
      setSelectedOrganizationId(null);
      setSelectedContactId(null);
      setSelectedHouseholdId(null);
      setSelectedPledgeId(null);
      setPortalClientId(null);
    }

    // Clear notification for this page
    setNotifications(prev => {
      const newNotifications = new Set(prev);
      newNotifications.delete(page);
      return newNotifications;
    });

    // Add to navigation history (truncate forward history when navigating from middle)
    setNavigationHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), page];
      // Limit history to 50 entries
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));

    // Add to recent items
    addToRecentItems(page, detailContext);
  }, [historyIndex, addToRecentItems]);

  // Go back in navigation history
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPage(navigationHistory[newIndex]);
      // Clear detail selections when going back
      setSelectedProjectId(null);
      setSelectedCaseId(null);
      setSelectedOrganizationId(null);
      setSelectedContactId(null);
      setSelectedHouseholdId(null);
      setSelectedPledgeId(null);
      setPortalClientId(null);
    }
  }, [historyIndex, navigationHistory]);

  // Go forward in navigation history
  const goForward = useCallback(() => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPage(navigationHistory[newIndex]);
      // Clear detail selections when going forward
      setSelectedProjectId(null);
      setSelectedCaseId(null);
      setSelectedOrganizationId(null);
      setSelectedContactId(null);
      setSelectedHouseholdId(null);
      setSelectedPledgeId(null);
      setPortalClientId(null);
    }
  }, [historyIndex, navigationHistory]);

  // Check if back/forward navigation is possible
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;


  // toggleTheme removed - now handled by ThemeToggle component

  const handleSelectProject = useCallback((id: string) => {
    // Set the project ID first
    setSelectedProjectId(id);
    // Find the project name for recent items
    const project = projects.find(p => p.id === id);
    // Navigate with detail context to prevent clearing the selection
    setCurrentPage('projects');
    // Add to recent items with detail context
    if (project) {
      addToRecentItems('projects', { id, label: project.name });
    }
  }, [projects, addToRecentItems]);
  
  const handleBackToList = useCallback(() => {
    setSelectedProjectId(null);
    navigateToPage('projects');
  }, [navigateToPage]);

  const handleSelectCase = useCallback((id: string) => {
    setSelectedCaseId(id);
    navigateToPage('case');
  }, [navigateToPage]);

  const handleBackFromCase = useCallback(() => {
    setSelectedCaseId(null);
  }, []);
  
  const handleSelectOrganization = useCallback((id: string) => {
    setSelectedOrganizationId(id);
    navigateToPage('organizations');
  }, [navigateToPage]);

  const handleBackFromOrganizations = useCallback(() => {
    setSelectedOrganizationId(null);
  }, []);

  const handleSelectContact = useCallback((contact: Client) => {
    setSelectedContactId(contact.id);
    navigateToPage('contacts');
  }, [navigateToPage]);

  const handleBackFromContact = useCallback(() => {
    setSelectedContactId(null);
  }, []);

  // Notification navigation handler
  const handleNotificationNavigate = useCallback((url: string) => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const path = urlObj.pathname.slice(1); // Remove leading /
      const params = new URLSearchParams(urlObj.search);

      switch(path) {
        case 'tasks':
          navigateToPage('tasks');
          // If there's a task ID, we could select it here
          const taskId = params.get('id');
          if (taskId) {
            // Task selection logic if needed in the future
          }
          break;
        case 'projects':
          navigateToPage('projects');
          const projectId = params.get('id');
          if (projectId) {
            handleSelectProject(projectId);
          }
          break;
        case 'cases':
          navigateToPage('case-management');
          const caseId = params.get('id');
          if (caseId) {
            handleSelectCase(caseId);
          }
          break;
        case 'contacts':
          navigateToPage('contacts');
          const contactId = params.get('id');
          if (contactId) {
            setSelectedContactId(contactId);
          }
          break;
        case 'documents':
          navigateToPage('documents');
          break;
        default:
          // If unknown path, just try to navigate to it as a page
          navigateToPage(path as Page);
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  }, [navigateToPage, handleSelectProject, handleSelectCase]);

  // Household handlers
  const handleSelectHousehold = useCallback((householdId: string) => {
    setSelectedHouseholdId(householdId);
    // Only navigate if not already on households page, otherwise switchActivePage resets selectedHouseholdId
    if (currentPage !== 'households') {
      navigateToPage('households');
    }
  }, [navigateToPage, currentPage]);

  const handleBackFromHousehold = useCallback(() => {
    setSelectedHouseholdId(null);
  }, []);

  const handleCreateHousehold = useCallback(() => {
    setEditingHouseholdId(null);
    setIsHouseholdModalOpen(true);
  }, []);

  const handleEditHousehold = useCallback((householdId: string) => {
    setEditingHouseholdId(householdId);
    setIsHouseholdModalOpen(true);
  }, []);

  const handleHouseholdModalClose = useCallback(() => {
    setIsHouseholdModalOpen(false);
    setEditingHouseholdId(null);
  }, []);

  const handleHouseholdSuccess = useCallback(() => {
    // Just close the modal - the list will refetch
    setIsHouseholdModalOpen(false);
    setEditingHouseholdId(null);
    showToast('Household saved successfully', 'success');
  }, [showToast]);

  // Pledge handlers
  const handleSelectPledge = useCallback((pledgeId: string) => {
    setSelectedPledgeId(pledgeId);
    if (currentPage !== 'pledges') {
      navigateToPage('pledges');
    }
  }, [navigateToPage, currentPage]);

  const handleBackFromPledge = useCallback(() => {
    setSelectedPledgeId(null);
  }, []);

  const handleCreatePledge = useCallback(() => {
    setEditingPledgeId(null);
    setIsPledgeModalOpen(true);
  }, []);

  const handleEditPledge = useCallback((pledgeId: string) => {
    setEditingPledgeId(pledgeId);
    setIsPledgeModalOpen(true);
  }, []);

  const handlePledgeModalClose = useCallback(() => {
    setIsPledgeModalOpen(false);
    setEditingPledgeId(null);
  }, []);

  const handlePledgeSuccess = useCallback(() => {
    setIsPledgeModalOpen(false);
    setEditingPledgeId(null);
    showToast('Pledge saved successfully', 'success');
  }, [showToast]);

  const handleDeletePledge = useCallback(async () => {
    if (!selectedPledgeId) return;
    // The PledgeList component handles deletion, just go back to list
    setSelectedPledgeId(null);
    showToast('Pledge deleted', 'success');
  }, [selectedPledgeId, showToast]);

  const handleSaveActivity = (activity: Omit<Activity, 'createdById'> & { id?: string }) => {
    if (activity.id) {
      setActivities(prev => prev.map(act => 
        act.id === activity.id 
          ? { ...act, ...activity } 
          : act
      ).sort((a,b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()));
      showToast(`Activity "${activity.title}" updated successfully`, 'success');
    } else {
      const newActivity: Activity = {
        ...(activity as Omit<Activity, 'id' | 'createdById'>),
        id: `act-${Date.now()}`,
        createdById: currentUserId, 
      };
      setActivities(prev => [newActivity, ...prev].sort((a,b) => new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()));
      showToast(`Activity "${newActivity.title}" created successfully`, 'success');
    }
    setIsActivityDialogOpen(false);
    setEditingActivity(null);
  };
  
  const handleScheduleActivity = (activityData: Partial<Activity>) => {
    const newActivity: Activity = {
      id: '',
      type: ActivityType.Call,
      title: '',
      status: ActivityStatus.Scheduled,
      activityDate: new Date().toISOString().split('T')[0],
      createdById: currentUserId,
      ...activityData
    };
    setEditingActivity(newActivity);
    setIsActivityDialogOpen(true);
  };


  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsActivityDialogOpen(true);
  };

  const handleDeleteActivity = (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      setActivities(prev => prev.filter(a => a.id !== activityId));
      showToast('Activity deleted successfully', 'success');
    }
  };

  const handleSendMessage = (roomId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      roomId,
      text,
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const handleCreateRoom = (roomName: string) => {
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      name: roomName.startsWith('#') ? roomName : `#${roomName}`,
    };
    setChatRooms(prev => [...prev, newRoom]);
    setIsCreateRoomDialogOpen(false);
    showToast('Channel created!', 'success');
  };
  
  const handleAddTeamMember = (newMember: Omit<TeamMember, 'id'>) => {
    const memberWithId: TeamMember = {
        ...newMember,
        id: `c-${Date.now()}`,
    };
    setTeamMembers(prev => [...prev, memberWithId]);
    setIsAddTeamMemberDialogOpen(false);
    showToast('Team member added.', 'success');
  };

  const handleUpdateTeamMember = (updatedMember: TeamMember) => {
    setTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    showToast('Team member updated.', 'success');
  };

  const handleAddContact = (newContact: Omit<Client, 'id' | 'createdAt'>) => {
    const contactWithId: Client = {
        ...newContact,
        id: `cl-${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, contactWithId]);
    setIsAddContactDialogOpen(false);
    showToast('Organization added.', 'success');
  };

  const handleAddVolunteer = (newVolunteer: Omit<Volunteer, 'id'>) => {
    const volunteerWithId: Volunteer = {
        ...newVolunteer,
        id: `v-${Date.now()}`,
    };
    setVolunteers(prev => [...prev, volunteerWithId]);
    setIsAddVolunteerDialogOpen(false);
    showToast('Volunteer added.', 'success');
  }

  const handleAddProject = () => {
    setIsProjectPlannerOpen(true);
  };

  const handleCreateProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: projectData.id || `p-${Date.now()}`,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      clientId: projectData.clientId || '',
      teamMemberIds: projectData.teamMemberIds || [],
      startDate: projectData.startDate || new Date().toISOString().split('T')[0],
      endDate: projectData.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: projectData.status || ProjectStatus.Planning,
      tasks: projectData.tasks || [],
      pinned: projectData.pinned || false,
      starred: projectData.starred || false,
      tags: projectData.tags || [],
      budget: projectData.budget,
      notes: projectData.notes,
    };

    setProjects(prev => [newProject, ...prev]);
    showToast(`Project "${newProject.name}" created successfully!`, 'success');
    handleSelectProject(newProject.id);
  };

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (projectToDelete && window.confirm(`Are you sure you want to delete "${projectToDelete.name}"?`)) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      showToast(`Project "${projectToDelete.name}" deleted`, 'success');
    }
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, ...updates } : p
      )
    );
    
    // Show toast for certain updates
    if (updates.pinned !== undefined) {
      showToast(updates.pinned ? 'Project pinned' : 'Project unpinned', 'success');
    } else if (updates.starred !== undefined) {
      showToast(updates.starred ? 'Project starred' : 'Star removed', 'success');
    } else if (updates.archived !== undefined) {
      showToast(updates.archived ? 'Project archived' : 'Project restored', 'success');
    } else if (updates.isTemplate) {
      showToast('Project saved as template', 'success');
    }
  };

  const handleSaveProjectPlan = async (plan: AiProjectPlan, clientId: string) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Estimate 3 month duration

    const newTasks: Task[] = plan.phases.flatMap(phase =>
        phase.tasks.map(taskDesc => ({
            id: '', // Will be generated by Supabase
            description: taskDesc,
            teamMemberId: '', // Unassigned initially
            dueDate: endDate.toISOString().split('T')[0],
            status: TaskStatus.ToDo,
            phase: phase.phaseName,
        }))
    );

    const projectData: Partial<Project> = {
        name: plan.projectName,
        description: plan.description,
        clientId,
        teamMemberIds: [], // Unassigned initially
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: ProjectStatus.Planning,
        tasks: newTasks,
    };

    try {
      // Persist to Supabase
      const savedProject = await projectService.create(projectData);

      // Update local state with the saved project (includes DB-generated ID)
      setProjects(prev => [savedProject, ...prev]);
      setIsProjectPlannerOpen(false);
      showToast(`Project "${savedProject.name}" created successfully!`, 'success');
      handleSelectProject(savedProject.id);
    } catch (error) {
      console.error('Error saving project:', error);
      showToast('Failed to save project. Please try again.', 'error');
    }
  };


  // --- Case Management Handlers ---
  const handleAddCase = () => {
    setEditingCase(null);
    setIsCaseDialogOpen(true);
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsCaseDialogOpen(true);
  };

  const handleDeleteCase = (caseId: string) => {
    const caseToDelete = cases.find(c => c.id === caseId);
    if (window.confirm(`Are you sure you want to delete this case: "${caseToDelete?.title}"?`)) {
      setCases(prev => prev.filter(c => c.id !== caseId));
      showToast(`Case "${caseToDelete?.title}" deleted successfully`, 'success');
    }
  };

  const handleSaveCase = (caseToSave: Omit<Case, 'createdAt' | 'lastUpdatedAt'> & { id?: string }) => {
    const now = new Date().toISOString();
    if (caseToSave.id) {
      // Update existing case
      setCases(prev => prev.map(c =>
        c.id === caseToSave.id
          ? { ...c, ...caseToSave, lastUpdatedAt: now }
          : c
      ));
      showToast(`Case "${caseToSave.title}" updated successfully!`, 'success');
    } else {
      // Create new case
      const newCase: Case = {
        ...(caseToSave as Omit<Case, 'id' | 'createdAt' | 'lastUpdatedAt'>),
        id: `case-${Date.now()}`,
        createdAt: now,
        lastUpdatedAt: now,
        comments: [],
      };
      setCases(prev => [newCase, ...prev]);
      showToast(`Case "${caseToSave.title}" created successfully!`, 'success');
    }
    setIsCaseDialogOpen(false);
    setEditingCase(null);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: CaseStatus) => {
    setCases(prevCases => prevCases.map(c => 
        c.id === caseId ? { ...c, status: newStatus, lastUpdatedAt: new Date().toISOString() } : c
    ));
    showToast(`Case moved to "${newStatus}"`, 'success');
  };

  const handleAddCaseComment = (caseId: string, text: string) => {
    const newComment: CaseComment = {
        id: `com-${Date.now()}`,
        authorId: currentUserId,
        text,
        timestamp: new Date().toISOString(),
    };
    setCases(prevCases => prevCases.map(c => {
        if (c.id === caseId) {
            return {
                ...c,
                comments: [...(c.comments || []), newComment],
            };
        }
        return c;
    }));
    showToast('Comment added.', 'success');
  };

  const handleUpdateTaskNote = (projectId: string, taskId: string, notes: string) => {
    setProjects(prevProjects => 
        prevProjects.map(p => {
            if (p.id === projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t => {
                        if (t.id === taskId) {
                            return { ...t, notes };
                        }
                        return t;
                    })
                };
            }
            return p;
        })
    );
    showToast('Task note saved.', 'success');
  };


  // --- Gold Pages Handlers ---
  const handleCreateNewPage = () => {
    const newPage: Webpage = {
      id: `wp-${Date.now()}`,
      relatedId: '', // Will be set in editor
      title: 'Untitled Page',
      status: WebpageStatus.Draft,
      lastUpdated: new Date().toISOString(),
      visits: 0,
      engagementScore: 0,
      content: [],
    };
    setEditingWebpage(newPage);
    setIsGoldPagesEditorOpen(true);
    showToast('New page created. Start editing!', 'info');
  };

  const handleEditPage = (pageId: string) => {
    const pageToEdit = webpages.find(p => p.id === pageId);
    if (pageToEdit) {
      setEditingWebpage(pageToEdit);
      setIsGoldPagesEditorOpen(true);
    }
  };

  const handleCloseEditor = () => {
    setEditingWebpage(null);
    setIsGoldPagesEditorOpen(false);
  };

  const handleSaveWebpage = (pageToSave: Webpage) => {
    setWebpages(prev => {
      const exists = prev.some(p => p.id === pageToSave.id);
      if (exists) {
        return prev.map(p => p.id === pageToSave.id ? { ...pageToSave, lastUpdated: new Date().toISOString() } : p);
      }
      return [...prev, { ...pageToSave, lastUpdated: new Date().toISOString() }];
    });
    handleCloseEditor();
    showToast('Webpage saved successfully!', 'success');
  };
  // --- End Gold Pages Handlers ---

  const handleSaveEvent = (eventToSave: Event) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventToSave.id);
      if (exists) {
        return prev.map(e => e.id === eventToSave.id ? eventToSave : e);
      }
      return [...prev, eventToSave].sort((a,b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    });
    showToast('Event saved!', 'success');
  };
  
  const handleSavePortalLayout = (layout: PortalLayout) => {
    let newLayouts;
    const exists = portalLayouts.some(l => l.clientId === layout.clientId);
    if (exists) {
        newLayouts = portalLayouts.map(l => l.clientId === layout.clientId ? layout : l);
    } else {
        newLayouts = [...portalLayouts, layout];
    }
    setPortalLayouts(newLayouts);
    portalDbService.saveLayouts(newLayouts);
    showToast('Portal layout saved!', 'success');
  };

  const handlePortalLogin = (clientId: string) => {
    setPortalClientId(clientId);
  };

  const handlePortalLogout = () => {
    setPortalClientId(null);
  };
  
  const handleSaveEmailCampaign = (campaign: Omit<EmailCampaign, 'id' | 'sentDate' | 'stats' | 'status'> & { scheduleDate?: string }) => {
    const isScheduled = !!campaign.scheduleDate;
    const newCampaign: EmailCampaign = {
        ...campaign,
        id: `ec-${Date.now()}`,
        status: isScheduled ? 'Scheduled' : 'Sent',
        sentDate: isScheduled ? undefined : new Date().toISOString(),
        stats: { sent: clients.length, opened: 0, clicked: 0, unsubscribes: 0 },
    };
    setEmailCampaigns(prev => [newCampaign, ...prev].sort((a, b) => {
        const dateA = a.scheduleDate || a.sentDate || 0;
        const dateB = b.scheduleDate || b.sentDate || 0;
        return new Date(dateB as string).getTime() - new Date(dateA as string).getTime();
    }));
    showToast(`Campaign ${isScheduled ? 'scheduled' : 'sent'}!`, 'success');
  };

  const handleSearch = useCallback(async (query: string, includeWebSearch: boolean) => {
    setSearchQuery(query);
    setIsSearching(true);
    navigateToPage('search-results');
    setSearchResults(null);

    const searchStartTime = performance.now();
    const hasApiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

    try {
        const allTasks: EnrichedTask[] = projects.flatMap(p =>
            p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
        );

        const allDataForSearch = { clients, projects, tasks: allTasks, cases, teamMembers, activities, volunteers, documents };

        // Always perform local search first (instant results)
        const localSearchStart = performance.now();
        const localResults = performLocalSearch(query, allDataForSearch);
        const localSearchTime = performance.now() - localSearchStart;

        // Start with local results immediately with metadata
        let finalResults: SearchResults = {
            projects: localResults.projects,
            clients: localResults.clients,
            tasks: localResults.tasks,
            teamMembers: localResults.teamMembers,
            activities: localResults.activities,
            volunteers: localResults.volunteers,
            cases: localResults.cases,
            documents: localResults.documents,
            webResults: [],
            navigation: localResults.navigation,
            features: localResults.features,
            meta: {
                localSearchComplete: true,
                aiSearchComplete: false,
                aiSearchEnabled: hasApiKey,
                searchStartTime,
                localSearchTime,
            }
        };

        // Show local results immediately
        setSearchResults(finalResults);
        setIsSearching(false); // Stop loading indicator - local results are ready

        // Try AI-enhanced search in background if API key is available
        if (hasApiKey) {
            const aiSearchStart = performance.now();
            try {
                const { internalResults, webResults } = await performAdvancedSearch(query, allDataForSearch, includeWebSearch);
                const aiSearchTime = performance.now() - aiSearchStart;

                // Merge AI results with local results (AI may find semantic matches local missed)
                const aiProjects = projects.filter(p => internalResults.projectIds?.includes(p.id));
                const aiClients = clients.filter(c => internalResults.clientIds?.includes(c.id));
                const aiTasks = allTasks.filter(t => internalResults.taskIds?.includes(t.id));
                const aiTeamMembers = teamMembers.filter(tm => internalResults.teamMemberIds?.includes(tm.id));
                const aiActivities = activities.filter(a => internalResults.activityIds?.includes(a.id));
                const aiVolunteers = volunteers.filter(v => internalResults.volunteerIds?.includes(v.id));
                const aiCases = cases.filter(c => internalResults.caseIds?.includes(c.id));
                const aiDocuments = documents.filter(d => internalResults.documentIds?.includes(d.id));

                // Merge and deduplicate results
                const mergeById = <T extends { id: string }>(local: T[], ai: T[]): T[] => {
                    const ids = new Set(local.map(item => item.id));
                    return [...local, ...ai.filter(item => !ids.has(item.id))];
                };

                finalResults = {
                    projects: mergeById(localResults.projects, aiProjects),
                    clients: mergeById(localResults.clients, aiClients),
                    tasks: mergeById(localResults.tasks, aiTasks),
                    teamMembers: mergeById(localResults.teamMembers, aiTeamMembers),
                    activities: mergeById(localResults.activities, aiActivities),
                    volunteers: mergeById(localResults.volunteers, aiVolunteers),
                    cases: mergeById(localResults.cases, aiCases),
                    documents: mergeById(localResults.documents, aiDocuments),
                    webResults: webResults,
                    navigation: localResults.navigation,
                    features: localResults.features,
                    meta: {
                        localSearchComplete: true,
                        aiSearchComplete: true,
                        aiSearchEnabled: true,
                        searchStartTime,
                        localSearchTime,
                        aiSearchTime,
                    }
                };

                setSearchResults(finalResults);
            } catch (aiError) {
                console.warn("AI search failed, using local results only:", aiError);
                // Update meta to show AI failed
                setSearchResults(prev => prev ? {
                    ...prev,
                    meta: {
                        ...prev.meta!,
                        aiSearchComplete: true,
                        aiSearchError: aiError instanceof Error ? aiError.message : 'AI search failed',
                    }
                } : prev);
            }
        }

    } catch (error) {
        console.error("Search failed:", error);
        setSearchResults({
            projects: [], clients: [], tasks: [], teamMembers: [],
            activities: [], volunteers: [], cases: [], documents: [],
            webResults: [], navigation: [], features: [],
            meta: {
                localSearchComplete: false,
                aiSearchComplete: false,
                aiSearchEnabled: hasApiKey,
                searchStartTime,
                aiSearchError: error instanceof Error ? error.message : 'Search failed',
            }
        });
        setIsSearching(false);
    }
}, [clients, projects, cases, teamMembers, activities, volunteers, documents, navigateToPage]);

  // --- AI Meeting Assistant Handlers ---
  const handleOpenMeetingAssistant = (activity: Activity) => {
    setSelectedActivityForAssistant(activity);
  };

  const handleCloseMeetingAssistant = () => {
    setSelectedActivityForAssistant(null);
  };

  const handleSaveActionItems = (newTasks: Omit<Task, 'id' | 'status' | 'dueDate'>[], projectId: string) => {
    if (!projectId) {
      showToast('Could not save tasks: No project selected.', 'error');
      return;
    }

    setProjects(prevProjects => {
      return prevProjects.map(p => {
        if (p.id === projectId) {
          const addedTasks: Task[] = newTasks.map(t => ({
            ...t,
            id: `task-${Date.now()}-${Math.random()}`,
            status: TaskStatus.ToDo,
            dueDate: p.endDate, // Default to project end date
          }));
          return { ...p, tasks: [...p.tasks, ...addedTasks] };
        }
        return p;
      });
    });

    showToast(`${newTasks.length} action item(s) added to project.`, 'success');
    handleCloseMeetingAssistant();
  };

  // Compute breadcrumbs based on current page and detail context
  const currentBreadcrumbs = useMemo((): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Always start with Dashboard
    if (currentPage !== 'dashboard') {
      items.push({
        label: 'Dashboard',
        onClick: () => navigateToPage('dashboard')
      });
    }

    // Add current page
    const currentLabel = pageLabels[currentPage] || currentPage;

    // Check for detail views and add intermediate + detail breadcrumbs
    if (currentPage === 'projects' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId);
      items.push({
        label: 'Projects',
        onClick: () => {
          setSelectedProjectId(null);
          navigateToPage('projects');
        }
      });
      items.push({ label: project?.name || 'Project Detail' });
    } else if (currentPage === 'contacts' && selectedContactId) {
      const contact = clients.find(c => c.id === selectedContactId);
      items.push({
        label: 'Contacts',
        onClick: () => {
          setSelectedContactId(null);
          navigateToPage('contacts');
        }
      });
      items.push({ label: contact?.name || 'Contact Detail' });
    } else if (currentPage === 'organizations' && selectedOrganizationId) {
      const org = clients.find(c => c.id === selectedOrganizationId);
      items.push({
        label: 'Organizations',
        onClick: () => {
          setSelectedOrganizationId(null);
          navigateToPage('organizations');
        }
      });
      items.push({ label: org?.name || 'Organization Detail' });
    } else if (currentPage === 'case' && selectedCaseId) {
      const caseItem = cases.find(c => c.id === selectedCaseId);
      items.push({
        label: 'Cases',
        onClick: () => {
          setSelectedCaseId(null);
          navigateToPage('case');
        }
      });
      items.push({ label: caseItem?.title || 'Case Detail' });
    } else if (currentPage === 'households' && selectedHouseholdId) {
      items.push({
        label: 'Households',
        onClick: () => {
          setSelectedHouseholdId(null);
          navigateToPage('households');
        }
      });
      items.push({ label: 'Household Detail' });
    } else if (currentPage === 'pledges' && selectedPledgeId) {
      items.push({
        label: 'Pledges',
        onClick: () => {
          setSelectedPledgeId(null);
          navigateToPage('pledges');
        }
      });
      items.push({ label: 'Pledge Detail' });
    } else {
      // No detail view - just add the current page label
      items.push({ label: currentLabel });
    }

    return items;
  }, [currentPage, selectedProjectId, selectedContactId, selectedOrganizationId, selectedCaseId, selectedHouseholdId, selectedPledgeId, projects, clients, cases, pageLabels, navigateToPage]);

  const renderContent = () => {
    if (currentPage === 'projects' && selectedProjectId) {
        const project = projects.find(p => p.id === selectedProjectId);
        if (project) {
            const client = clients.find(c => c.id === project.clientId);
            const projectTeamMembers = teamMembers.filter(c => project.teamMemberIds.includes(c.id));
            const projectCases = cases.filter(c => c.clientId === project.clientId);
            return (
                <Suspense fallback={<LoadingState message="Loading project details..." />}>
                    <ProjectDetail
              project={project}
              client={client}
              currentUser={currentUser!}
              teamMembers={teamMembers}
              projectTeamMembers={projectTeamMembers}
              allTeamMembers={teamMembers}
              cases={projectCases}
              onBack={handleBackToList}
              onUpdateTaskNote={handleUpdateTaskNote}
            />
                </Suspense>
            );
        }
    }
    
    if (currentPage === 'case' && selectedCaseId) {
        const caseItem = cases.find(c => c.id === selectedCaseId);
        const currentUser = teamMembers.find(tm => tm.id === currentUserId);
        if (caseItem && currentUser) {
            const client = clients.find(c => c.id === caseItem.clientId);
            const assignee = teamMembers.find(tm => tm.id === caseItem.assignedToId);
            return <CaseDetail
                caseItem={caseItem}
                client={client}
                assignee={assignee}
                activities={activities.filter(a => a.caseId === selectedCaseId)}
                teamMembers={teamMembers}
                currentUser={currentUser}
                onBack={handleBackFromCase}
                onAddComment={handleAddCaseComment}
            />
        }
    }
    
    if (currentPage === 'organizations' && selectedOrganizationId) {
        const organization = clients.find(c => c.id === selectedOrganizationId);
        if(organization) {
            return <OrganizationDetail
                client={organization}
                projects={projects.filter(p => p.clientId === selectedOrganizationId)}
                activities={activities.filter(a => a.clientId === selectedOrganizationId)}
                cases={cases.filter(c => c.clientId === selectedOrganizationId)}
                donations={donations.filter(d => d.clientId === selectedOrganizationId)}
                documents={documents.filter(d => d.relatedId === selectedOrganizationId && d.category === DocumentCategory.Client)}
                teamMembers={teamMembers}
                events={events.filter(e => e.clientId === selectedOrganizationId)}
                onBack={handleBackFromOrganizations}
                onSelectProject={handleSelectProject}
                onScheduleActivity={handleScheduleActivity}
                currentUserId={currentUserId}
             />
        }
    }

    if (currentPage === 'contacts' && selectedContactId) {
        return <ContactDetail contactId={selectedContactId} currentUser={currentUser!} teamMembers={teamMembers} onBack={handleBackFromContact} onNavigateToHousehold={handleSelectHousehold} />;
    }

    if (currentPage === 'households' && selectedHouseholdId) {
        return <HouseholdDetail householdId={selectedHouseholdId} onBack={handleBackFromHousehold} onEdit={() => handleEditHousehold(selectedHouseholdId)} />;
    }

    if (currentPage === 'pledges' && selectedPledgeId) {
        return <PledgeDetail
          pledgeId={selectedPledgeId}
          onBack={handleBackFromPledge}
          onEdit={() => handleEditPledge(selectedPledgeId)}
          onDelete={handleDeletePledge}
        />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard 
                  projects={projects} 
                  clients={clients} 
                  cases={cases}
                  activities={activities}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSelectProject={handleSelectProject}
                  setCurrentPage={navigateToPage}
                  onScheduleEvent={() => setIsActivityDialogOpen(true)}
                  documents={documents}
                  donations={donations}
               />;
      case 'projects':
        return <ProjectsCommandCenter
          projects={projects}
          clients={clients}
          teamMembers={teamMembers}
          activities={activities}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onUpdateProject={(project) => handleUpdateProject(project.id, project)}
          onDeleteProject={handleDeleteProject}
        />;
      case 'project-hub':
        // Redirect to projects (they're now merged)
        navigateToPage('projects');
        return null;
      case 'activities':
        return <ActivityFeed 
          activities={activities} 
          projects={projects} 
          clients={clients} 
          teamMembers={teamMembers}
          onLogActivity={() => { setEditingActivity(null); setIsActivityDialogOpen(true); }}
          onEdit={handleEditActivity}
          onDelete={handleDeleteActivity}
          onProcessMeeting={handleOpenMeetingAssistant}
        />;
      case 'organizations':
        // Dedicated organization list with separate database
        return <OrganizationList
          onNavigateToContact={(contactId) => {
            setSelectedContactId(contactId);
            setCurrentPage('contacts');
          }}
          onAddOrganization={() => {
            // TODO: Open add organization dialog
            console.log('Add organization clicked');
          }}
        />;
      case 'team':
        return (
          <TeamMemberList
            teamMembers={teamMembers}
            onAddTeamMember={() => setIsAddTeamMemberDialogOpen(true)}
            onUpdateTeamMember={handleUpdateTeamMember}
            currentUserPermission={teamMembers.find(m => m.id === currentUserId)?.permission || 'viewer'}
            currentUserId={currentUserId}
          />
        );
      case 'chat':
        return <PulseChat
                  rooms={chatRooms}
                  messages={chatMessages}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                  onCreateRoom={() => setIsCreateRoomDialogOpen(true)}
                  activities={activities}
                  clients={clients}
                  projects={projects}
                  onLogActivity={() => { setEditingActivity(null); setIsActivityDialogOpen(true); }}
                  onOpenPulseSettings={() => navigateToPage('pulse-settings')}
                />;
      case 'contacts':
        // New redesigned contacts view with relationship intelligence
        return <ContactsPageNew />;
      case 'contacts-old':
        // Legacy contacts view - kept for reference
        return <Contacts
          defaultType="all"
          onSelectContact={handleSelectContact}
          onNavigateToOrganization={(orgId) => {
            setSelectedOrganizationId(orgId);
            setCurrentPage('organizations');
          }}
        />;
      case 'households':
        return <HouseholdList
          onSelectHousehold={handleSelectHousehold}
          onCreateNew={handleCreateHousehold}
          onEdit={handleEditHousehold}
        />;
      case 'donations':
        return <Donations />;
      case 'pledges':
        return <PledgeList
          onSelectPledge={handleSelectPledge}
          onCreateNew={handleCreatePledge}
          onEdit={handleEditPledge}
        />;
      case 'stewardship':
        return <Stewardship />;
      case 'campaigns':
        return <CampaignManagement />;
      case 'calendar':
        return <CalendarView teamMembers={teamMembers} projects={projects} activities={activities} tasks={tasks} />;
      case 'calendar-settings':
        return <CalendarIntegration />;
      case 'tasks':
        return <TaskView
          projects={projects}
          teamMembers={teamMembers}
          currentUser={teamMembers.find(tm => tm.id === currentUserId) || teamMembers[0]}
          onSelectTask={handleSelectProject}
          tasks={tasks}
          onTasksUpdate={handleTasksUpdate}
        />;
      case 'form-generator':
        return <FormGenerator clients={clients} />;
      case 'grant-assistant':
        return <GrantAssistant projects={projects} donations={donations} clients={clients} />;
      case 'portal-builder':
        return <PortalBuilder
                    clients={clients}
                    projects={projects}
                    teamMembers={teamMembers}
                    activities={activities}
                    donations={donations}
                    documents={documents}
                    events={events}
                    portalLayouts={portalLayouts}
                    onSaveLayout={handleSavePortalLayout}
                />;
      case 'client-portal':
        if (portalClientId) {
            const client = clients.find(c => c.id === portalClientId);
            if (!client) {
                setPortalClientId(null);
                return <ClientPortalLogin clients={clients} onSelectClient={handlePortalLogin} />;
            }
            const layout = portalLayouts.find(l => l.clientId === portalClientId);
            const clientProjects = projects.filter(p => p.clientId === client.id);
            const clientProjectIds = clientProjects.map(p => p.id);
            const clientTeamMemberIds = new Set(clientProjects.flatMap(p => p.teamMemberIds));
            const clientVolunteers = volunteers.filter(v => 
                v.assignedClientIds.includes(client.id) || 
                v.assignedProjectIds.some(pId => clientProjectIds.includes(pId))
            );
            
            return <ClientPortal 
                        client={client} 
                        layout={layout}
                        projects={clientProjects}
                        tasks={projects.flatMap(p => p.tasks.filter(t => clientProjectIds.includes(p.id) && t.sharedWithClient))}
                        activities={activities.filter(a => a.clientId === client.id && a.sharedWithClient)}
                        donations={donations.filter(d => d.clientId === client.id)}
                        documents={documents.filter(d => d.relatedId === client.id && d.category === DocumentCategory.Client)}
                        events={events.filter(e => e.clientId === client.id)}
                        team={teamMembers.filter(tm => clientTeamMemberIds.has(tm.id))}
                        volunteers={clientVolunteers}
                        onLogout={handlePortalLogout} 
                    />;
        }
        return <ClientPortalLogin clients={clients} onSelectClient={handlePortalLogin} />;
      case 'volunteers': 
        return <VolunteerList 
                  volunteers={volunteers} 
                  clients={clients} 
                  projects={projects} 
                  teamMembers={teamMembers}
                  onAddVolunteer={() => setIsAddVolunteerDialogOpen(true)} 
                />;
      case 'charity':
        return <CharityHub
                  clients={clients}
                  donations={donations}
                  volunteers={volunteers}
                  onNavigateToView={(view) => {
                    // Handle navigation to specific charity features
                    console.log('Navigate to charity view:', view);
                  }}
                  onSetPage={(page) => setCurrentPage(page as Page)}
                />;
      case 'case': 
        return <CaseManagement 
                  cases={cases} 
                  clients={clients} 
                  teamMembers={teamMembers}
                  onAddCase={handleAddCase}
                  onEditCase={handleEditCase}
                  onDeleteCase={handleDeleteCase}
                  onSelectCase={handleSelectCase}
                  onUpdateCaseStatus={handleUpdateCaseStatus}
                />;
      case 'documents':
        return <DocumentsHub
                  documents={documents}
                  clients={clients}
                  projects={projects}
                  teamMembers={teamMembers}
                  currentUser={currentUser}
                />;
      case 'web-management':
        return <WebManagement 
                  webpages={webpages} 
                  clients={clients}
                  onCreatePage={handleCreateNewPage}
                  onEditPage={handleEditPage} 
                />;
      case 'ai-tools':
      case 'forge':
        // AI Content Studio - CRM-integrated content creation workspace
        return <AiContentStudio />;
      case 'live-chat':
        return <LiveChat />;
      case 'search-results':
        return <SearchResultsPage
            query={searchQuery}
            isLoading={isSearching}
            results={searchResults}
            onNavigateToProject={handleSelectProject}
            onNavigateToPage={navigateToPage}
            onFeatureAction={(action) => {
              // Handle quick action shortcuts from search
              switch (action) {
                case 'add-contact':
                  setIsAddContactDialogOpen(true);
                  break;
                case 'add-project':
                  navigateToPage('projects');
                  // Could open new project dialog here
                  break;
                case 'add-team-member':
                  setIsAddTeamMemberDialogOpen(true);
                  break;
                case 'record-donation':
                  navigateToPage('charity');
                  break;
                case 'add-activity':
                  setEditingActivity(null);
                  setIsActivityDialogOpen(true);
                  break;
                case 'add-case':
                  setEditingCase(null);
                  setIsCaseDialogOpen(true);
                  break;
                case 'upload-document':
                  navigateToPage('documents');
                  break;
                case 'ai-project-planner':
                  setIsProjectPlannerOpen(true);
                  break;
                case 'ai-chat':
                  navigateToPage('forge');
                  break;
                case 'quick-actions':
                  // Could toggle quick actions menu
                  break;
                case 'toggle-theme':
                  // Theme is handled by ThemeToggle component
                  navigateToPage('settings');
                  break;
                case 'export':
                  navigateToPage('settings');
                  break;
                default:
                  console.log('Unknown feature action:', action);
              }
            }}
        />;
      
      case 'video': return <VideoConference />;
      case 'email': return <EmailCampaigns campaigns={emailCampaigns} clients={clients} onSaveCampaign={handleSaveEmailCampaign} />;
      case 'events': return <EventEditor events={events} clients={clients} volunteers={volunteers} onSave={handleSaveEvent} />;
      case 'reports':
          return <ReportsHub onNavigate={navigateToPage} />;
      case 'analytics':
          return <AnalyticsDashboard />;
      case 'impact':
          return <ImpactDashboard />;
      case 'impact-reports':
          return <ImpactReportBuilder />;
      case 'donor-pipeline':
          return <DonorPipeline clients={clients} />;
      case 'cultivation':
          return <CultivationPlanBuilder clients={clients} />;
      case 'touchpoints':
          return <TouchpointTracker clients={clients} />;
      case 'relationship-timeline':
          return <TimelineDemo />;
      case 'outreach-hub':
          return <OutreachHub
            clients={clients}
            donations={donations}
            volunteers={volunteers}
            emailCampaigns={emailCampaigns}
            events={events}
            projects={projects}
            onAddVolunteer={() => setIsAddVolunteerDialogOpen(true)}
            onSaveEmailCampaign={handleSaveEmailCampaign}
            onSaveEvent={handleSaveEvent}
          />;
      case 'pulse-settings':
          return <PulseIntegrationSettings
            projects={projects}
            clients={clients}
            cases={cases}
            tasks={tasks}
            activities={activities}
            onSyncComplete={() => loadAllData()}
          />;
      case 'connect':
          return <ConnectHub
            projects={projects}
            clients={clients}
            cases={cases}
            tasks={tasks}
            activities={activities}
            onSyncComplete={() => loadAllData()}
          />;
      case 'settings':
          return <Settings onSignOut={handleSignOut} currentUser={currentUser} />;
      case 'design-preview':
          return <DesignPreview />;
      default:
        return <Dashboard 
                  projects={projects} 
                  clients={clients} 
                  cases={cases}
                  activities={activities}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSelectProject={handleSelectProject}
                  setCurrentPage={navigateToPage}
                  onScheduleEvent={() => setIsActivityDialogOpen(true)}
                />;
    }
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <Login
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGoogleSignIn={handleGoogleSignIn}
      />
    );
  }

  // Get current user as TeamMember
  const currentUser = teamMembers.find(tm => tm.id === currentUserId);

  // CMF tokens handle light/dark via CSS, no need for inline isDark checks
  return (
        <div
          className="flex h-screen"
          style={{
            backgroundColor: 'var(--cmf-bg)',
            color: 'var(--cmf-text)'
          }}
        >
          <Sidebar
            currentPage={currentPage}
            onNavigate={navigateToPage}
            notifications={notifications}
            recentItems={recentItems}
          />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header
            onSearch={handleSearch}
            isSearching={isSearching}
            currentPage={currentPage}
            currentUser={currentUser}
            onNavigate={handleNotificationNavigate}
            breadcrumbs={currentBreadcrumbs}
            onGoBack={goBack}
            onGoForward={goForward}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
          />
          <main
            className="flex-1 p-6 sm:p-8 overflow-y-auto bg-ambient-gradient"
            style={{ backgroundColor: 'var(--cmf-bg)' }}
          >
              <div key={currentPage} className="page-content-wrapper">
                  <Suspense fallback={<LoadingState message="Loading page..." />}>
                      {renderContent()}
                  </Suspense>
              </div>
          </main>
          
          <QuickAddButton 
            id="quick-add-button"
            actions={quickActions}
            position="bottom-right"
          />
        </div>

        {/* Dialogs & Modals */}
        <ActivityDialog 
          isOpen={isActivityDialogOpen}
          onClose={() => { setIsActivityDialogOpen(false); setEditingActivity(null); }}
          onSave={handleSaveActivity}
          clients={clients}
          projects={projects}
          activityToEdit={editingActivity}
        />
        <CaseDialog
          isOpen={isCaseDialogOpen}
          onClose={() => { setIsCaseDialogOpen(false); setEditingCase(null); }}
          onSave={handleSaveCase}
          clients={clients}
          teamMembers={teamMembers}
          caseToEdit={editingCase}
        />
        <CreateRoomDialog
          isOpen={isCreateRoomDialogOpen}
          onClose={() => setIsCreateRoomDialogOpen(false)}
          onSave={handleCreateRoom}
        />
        <AddTeamMemberDialog
          isOpen={isAddTeamMemberDialogOpen}
          onClose={() => setIsAddTeamMemberDialogOpen(false)}
          onSave={handleAddTeamMember}
        />
        <AddContactDialog
          isOpen={isAddContactDialogOpen}
          onClose={() => setIsAddContactDialogOpen(false)}
          onSave={handleAddContact}
        />
        <AddVolunteerDialog
          isOpen={isAddVolunteerDialogOpen}
          onClose={() => setIsAddVolunteerDialogOpen(false)}
          onSave={handleAddVolunteer}
          clients={clients}
          projects={projects}
        />
        <HouseholdModal
          isOpen={isHouseholdModalOpen}
          onClose={handleHouseholdModalClose}
          onSuccess={handleHouseholdSuccess}
          householdId={editingHouseholdId}
        />
        <PledgeModal
          isOpen={isPledgeModalOpen}
          onClose={handlePledgeModalClose}
          onSuccess={handlePledgeSuccess}
          pledgeId={editingPledgeId}
        />
        <ProjectPlannerModal
            isOpen={isProjectPlannerOpen}
            onClose={() => setIsProjectPlannerOpen(false)}
            onSave={handleSaveProjectPlan}
            clients={clients}
        />
        <MeetingAssistantModal
            isOpen={!!selectedActivityForAssistant}
            onClose={handleCloseMeetingAssistant}
            activity={selectedActivityForAssistant}
            projects={projects}
            teamMembers={teamMembers}
            onSaveTasks={handleSaveActionItems}
        />
        {isGoldPagesEditorOpen && editingWebpage && (
          <div className="absolute inset-0 z-50 bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl">
            <GoldPages
              webpage={editingWebpage}
              onClose={handleCloseEditor}
              onSave={handleSaveWebpage}
              clients={clients}
            />
          </div>
        )}
        <GuidedTour
            steps={tourSteps}
            isOpen={isTourOpen}
            onClose={() => setIsTourOpen(false)}
            pageName={currentPage}
        />
         <AiChatBot
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
        />
        <Suspense fallback={null}>
          <ConversationalAssistant
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            context={{
              tasks,
              projects,
              contacts: clients,
              currentUser: teamMembers.find(m => m.id === currentUserId),
            }}
          />
        </Suspense>
        <QuickActions
            isOpen={quickActionsState.isOpen}
            onClose={quickActionsState.close}
            onNavigate={navigateToPage}
            onCreateClient={() => setIsAddContactDialogOpen(true)}
            onCreateTask={() => navigateToPage('tasks')}
            onCreateProject={() => navigateToPage('projects')}
            onAiAssist={() => setIsAiChatOpen(true)}
        />

        {/* Keyboard Shortcuts Panel */}
        <KeyboardShortcutsPanel
            isOpen={keyboardShortcuts.isOpen}
            onClose={keyboardShortcuts.close}
        />

        {/* Onboarding Flow for new users */}
        <OnboardingFlow
          userName={teamMembers.find(m => m.id === currentUserId)?.name?.split(' ')[0]}
          onComplete={completeOnboarding}
          onStartTour={() => setIsTourOpen(true)}
          onSkip={completeOnboarding}
        />

        {/* Mobile Navigation */}
        {isMobile && (
          <>
            <FloatingActionButton actions={mobileFabActions} />
            <BottomNav
              items={mobileNavItems}
              activeId={currentPage === 'menu' ? 'menu' : currentPage}
              onNavigate={(id) => {
                if (id === 'menu') {
                  // Could open a menu drawer or navigate to settings
                  navigateToPage('settings');
                } else {
                  navigateToPage(id as Page);
                }
              }}
            />
          </>
        )}
      </div>
  );
};

export default App;
