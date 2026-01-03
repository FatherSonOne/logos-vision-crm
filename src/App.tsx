
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { syncProjectToChannel, syncAll } from './services/logosSync';
import { syncPulseToLogosAll } from './services/pulseToLogosSync';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { ProjectHub } from './components/ProjectHub';
import { ProjectsCommandCenter } from './components/ProjectsCommandCenter';
import { portalDbService } from './services/portalDbService';
import { performAdvancedSearch } from './services/geminiService';
import { performLocalSearch } from './services/localSearchService';
// FIX: Correctly alias Document as AppDocument on import.
import type { Client, TeamMember, Project, EnrichedTask, Activity, ChatRoom, ChatMessage, Donation, Volunteer, Case, Document as AppDocument, Webpage, CaseComment, Event, PortalLayout, EmailCampaign, WebSearchResult, SearchResults, AiProjectPlan, Task, RecentItem } from './types';
import { ProjectStatus, TaskStatus, ActivityType, ActivityStatus, CaseStatus, DocumentCategory } from './types';
import type { Page } from './types';
import { getBreadcrumbsForPage, type BreadcrumbItem } from './components/ui/Breadcrumbs';
import { Contacts } from './components/Contacts';
import { ContactDetail } from './components/ContactDetail';
import { OrganizationList } from './components/OrganizationList';
import { HouseholdList, HouseholdDetail, HouseholdModal } from './components/households';
import { PledgeList, PledgeModal, PledgeDetail } from './components/pledges';
import { OrganizationDetail } from './components/OrganizationDetail';
import { TeamMemberList } from './components/ConsultantList';
import { ActivityFeed } from './components/ActivityFeed';
import { ActivityDialog } from './components/ActivityDialog';
import { PulseChat } from './components/PulseChat';
import { PulseIntegrationSettings } from './components/PulseIntegrationSettings';
import { SyncStatusWidget } from './components/SyncStatusWidget';
import { CreateRoomDialog } from './components/CreateRoomDialog';
import { VideoConference } from './components/VideoConference';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { AddContactDialog } from './components/AddContactDialog';
import { Donations } from './components/Donations';
import { Stewardship } from './components/Stewardship';
import { CampaignManagement } from './components/CampaignManagement';
import { CalendarView } from './components/CalendarView';
import { TaskView } from './components/TaskView';
import { FormGenerator } from './components/FormGenerator';
import { VolunteerList } from './components/VolunteerList';
import { AddVolunteerDialog } from './components/AddVolunteerDialog';
import { CharityTracker } from './components/CharityTracker';
import CharityHub from './components/CharityHub';
import { CaseManagement } from './components/CaseManagement';
import { DocumentLibrary } from './components/DocumentLibrary';
import { WebManagement } from './components/WebManagement';
import { GoldPages } from './components/GoldPages';
import { WebpageStatus } from './types';
import { AiChatBot } from './components/AiChatBot';
import { AiTools } from './components/AiTools';
import { LiveChat } from './components/LiveChat';
import { CaseDialog } from './components/CaseDialog';
import { SearchResultsPage } from './components/SearchResultsPage';
import { CaseDetail } from './components/CaseDetail';
import { EventEditor } from './components/EventEditor';
import { ReportsHub } from './components/reports/ReportsHub';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { PortalBuilder } from './components/PortalBuilder';
import { ClientPortalLogin } from './components/ClientPortalLogin';
import { ClientPortal } from './components/ClientPortal';
import { EmailCampaigns } from './components/EmailCampaigns';
import { GrantAssistant } from './components/GrantAssistant';
import { CalendarIntegration } from './components/CalendarIntegration';
import { ImpactDashboard } from './components/ImpactDashboard';
import { ImpactReportBuilder } from './components/ImpactReportBuilder';
import { DonorPipeline } from './components/DonorPipeline';
import { CultivationPlanBuilder } from './components/CultivationPlanBuilder';
import { TouchpointTracker } from './components/TouchpointTracker';
import { Settings } from './components/Settings';
import { OutreachHub } from './components/OutreachHub';
import { ConnectHub } from './components/ConnectHub';
import { LogoShowcase } from './components/DesignPreview';
import { QuickActions, useQuickActions } from './components/QuickActions';
import { ErrorBoundary, PageErrorBoundary, LoadingState } from './components/ErrorBoundary';
import { useToast } from './components/ui/Toast';
import { GuidedTour } from './components/GuidedTour';
import { OnboardingFlow, useOnboarding } from '../components/OnboardingFlow';
import {
  BottomNav,
  FloatingActionButton,
  useIsMobile,
  HomeIcon as MobileHomeIcon,
  ContactsIcon as MobileContactsIcon,
  DonationsIcon as MobileDonationsIcon,
  TasksIcon as MobileTasksIcon,
  MoreIcon as MobileMoreIcon
} from '../components/MobileOptimized';
import { getTourStepsForPage } from './components/ui/PageTourSteps';
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
  const [tasks, setTasks] = useState<Task[]>([]);
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

  // Load tasks
  try {
    setIsLoadingTasks(true);
    loadedTasks = USE_SAMPLE_DATA ? [] : await taskService.getAll();
    setTasks(loadedTasks);
    console.log('✅ Loaded', loadedTasks.length, 'tasks from', USE_SAMPLE_DATA ? 'Sample Data' : 'Supabase');
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

  // Load additional mock-only data
  if (USE_SAMPLE_DATA) {
    setDocuments(mockData.mockDocuments || []);
    setEvents(mockData.mockEvents || []);
    setWebpages(mockData.mockWebpages || []);
    setEmailCampaigns(mockData.mockEmailCampaigns || []);
    setChatRooms(mockData.mockChatRooms || []);
    setChatMessages(mockData.mockChatMessages || []);
    setPortalLayouts(mockData.mockPortalLayouts || []);
    console.log('✅ Loaded additional sample data (documents, events, webpages, campaigns, chat)');
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

// Load data on mount
useEffect(() => {
  loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    'ai-tools': 'AI Tools',
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
    'forge': 'AI Forge',
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
    setSelectedProjectId(id);
    navigateToPage('projects');
  }, [navigateToPage]);
  
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

  const handleSaveProjectPlan = (plan: AiProjectPlan, clientId: string) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3); // Estimate 3 month duration

    const newTasks = plan.phases.flatMap(phase => 
        phase.tasks.map(taskDesc => ({
            id: `task-${Date.now()}-${Math.random()}`,
            description: taskDesc,
            teamMemberId: '', // Unassigned initially
            dueDate: endDate.toISOString().split('T')[0],
            status: TaskStatus.ToDo,
            phase: phase.phaseName,
        }))
    );

    const newProject: Project = {
        id: `p-${Date.now()}`,
        name: plan.projectName,
        description: plan.description,
        clientId,
        teamMemberIds: [], // Unassigned initially
        startDate: today.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        status: ProjectStatus.Planning,
        tasks: newTasks,
    };

    setProjects(prev => [newProject, ...prev]);
    setIsProjectPlannerOpen(false);
    showToast(`Project "${newProject.name}" created successfully!`, 'success');
    handleSelectProject(newProject.id);
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
    const hasApiKey = !!import.meta.env.VITE_API_KEY;

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
            return <ProjectDetail 
              project={project} 
              client={client} 
              projectTeamMembers={projectTeamMembers} 
              allTeamMembers={teamMembers} 
              cases={projectCases}
              volunteers={volunteers}
              onBack={handleBackToList}
              onUpdateTaskNote={handleUpdateTaskNote}
            />
        }
    }
    
    if (currentPage === 'case' && selectedCaseId) {
        const caseItem = cases.find(c => c.id === selectedCaseId);
        if (caseItem) {
            const client = clients.find(c => c.id === caseItem.clientId);
            const assignee = teamMembers.find(tm => tm.id === caseItem.assignedToId);
            return <CaseDetail
                caseItem={caseItem}
                client={client}
                assignee={assignee}
                activities={activities.filter(a => a.caseId === selectedCaseId)}
                teamMembers={teamMembers}
                onBack={handleBackFromCase}
                onAddComment={handleAddCaseComment}
                currentUserId={currentUserId}
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
        return <ContactDetail contactId={selectedContactId} onBack={handleBackFromContact} onNavigateToHousehold={handleSelectHousehold} />;
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
        // Unified contacts view - shows all with toggle to filter by type
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
        return <CalendarView teamMembers={teamMembers} projects={projects} activities={activities} />;
      case 'calendar-settings':
        return <CalendarIntegration />;
      case 'tasks': 
        return <TaskView projects={projects} teamMembers={teamMembers} onSelectTask={handleSelectProject} />;
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
        return <DocumentLibrary 
                  documents={documents}
                  clients={clients}
                  projects={projects}
                  teamMembers={teamMembers}
                />;
      case 'web-management':
        return <WebManagement 
                  webpages={webpages} 
                  clients={clients}
                  onCreatePage={handleCreateNewPage}
                  onEditPage={handleEditPage} 
                />;
      case 'ai-tools':
        return <AiTools />;
      case 'forge':
        // AI Forge - consolidated AI tools workspace
        return <AiTools />;
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
          return <Settings />;
      case 'design-preview':
          return <LogoShowcase />;
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
                  {renderContent()}
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
        <QuickActions
            isOpen={quickActionsState.isOpen}
            onClose={quickActionsState.close}
            onNavigate={navigateToPage}
            onCreateClient={() => setIsAddContactDialogOpen(true)}
            onCreateTask={() => navigateToPage('tasks')}
            onCreateProject={() => navigateToPage('projects')}
            onAiAssist={() => setIsAiChatOpen(true)}
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
