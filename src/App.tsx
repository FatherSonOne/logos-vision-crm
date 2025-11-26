
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { useRealtime } from './hooks/useRealtime';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail';
import { mockClients, mockTeamMembers, mockProjects, mockActivities, mockChatRooms, mockChatMessages, mockDonations, mockVolunteers, mockCases, mockDocuments, mockWebpages, mockEvents, mockEmailCampaigns } from './data/mockData';
import { clientService } from './services/clientService';
import { projectService } from './services/projectService';
import { activityService } from './services/activityService';
import { teamMemberService } from './services/teamMemberService';
import { volunteerService } from './services/volunteerService';
import { caseService } from './services/caseService';
import { eventService } from './services/eventService';
import { emailCampaignService } from './services/emailCampaignService';
import { portalDbService } from './services/portalDbService';
import { performAdvancedSearch } from './services/geminiService';
// FIX: Correctly alias Document as AppDocument on import.
import type { Client, TeamMember, Project, EnrichedTask, Activity, ChatRoom, ChatMessage, Donation, Volunteer, Case, Document as AppDocument, Webpage, CaseComment, Event, PortalLayout, EmailCampaign, WebSearchResult, SearchResults, AiProjectPlan, Task } from '../types';
import { ProjectStatus, TaskStatus, ActivityType, ActivityStatus, CaseStatus, DocumentCategory } from '../types';
import type { Page } from '../types';
import { ClientList } from './components/ClientList';
import { OrganizationDetail } from './components/OrganizationDetail';
import { TeamMemberList } from './components/ConsultantList';
import { ActivityFeed } from './components/ActivityFeed';
import { ActivityDialog } from './components/ActivityDialog';
import { TeamChat } from './components/TeamChat';
import { CreateRoomDialog } from './components/CreateRoomDialog';
import { VideoConference } from './components/VideoConference';
import { AddTeamMemberDialog } from './components/AddTeamMemberDialog';
import { ContactList } from './components/ContactList';
import { AddContactDialog } from './components/AddContactDialog';
import { Donations } from './components/Donations';
import { CalendarView } from './components/CalendarView';
import { TaskView } from './components/TaskView';
import { FormGenerator } from './components/FormGenerator';
import { VolunteerList } from './components/VolunteerList';
import { AddVolunteerDialog } from './components/AddVolunteerDialog';
import { CharityTracker } from './components/CharityTracker';
import { CaseManagement } from './components/CaseManagement';
import { DocumentLibrary } from './components/DocumentLibrary';
import { WebManagement } from './components/WebManagement';
import { GoldPages } from './components/GoldPages';
import { WebpageStatus } from '../types';
import { AiChatBot } from './components/AiChatBot';
import { AiTools } from './components/AiTools';
import { LiveChat } from './components/LiveChat';
import { CaseDialog } from './components/CaseDialog';
import { SearchResultsPage } from './components/SearchResultsPage';
import { CaseDetail } from './components/CaseDetail';
import { EventEditor } from './components/EventEditor';
import { Reports } from './components/Reports';
import { PortalBuilder } from './components/PortalBuilder';
import { ClientPortalLogin } from './components/ClientPortalLogin';
import { ClientPortal } from './components/ClientPortal';
import { EmailCampaigns } from './components/EmailCampaigns';
import { GrantAssistant } from './components/GrantAssistant';
import { useToast } from './components/ui/Toast';
import { GuidedTour, TourStep } from './components/GuidedTour';
import { QuickAddButton, QuickAction } from './components/quickadd/QuickAddButton';
import { ProjectPlannerModal } from './components/ProjectPlannerModal';
import { MeetingAssistantModal } from './components/MeetingAssistantModal';
import { ClipboardListIcon, CaseIcon, BuildingIcon, SparklesIcon, FolderIcon, CalendarIcon, HandHeartIcon } from './components/icons';
import { Breadcrumbs, getBreadcrumbsForPage } from './components/ui/Breadcrumbs';
import { CommandPalette } from './components/CommandPalette';
import { allNavItems } from './components/navigationConfig';
import { AccordionExample } from './components/AccordionExample';
import { ProjectsHub } from './components/ProjectsHub';

const App: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { showToast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(mockChatRooms);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [donations, setDonations] = useState<Donation[]>(mockDonations);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(true);
  const [documents, setDocuments] = useState<AppDocument[]>(mockDocuments);
  const [webpages, setWebpages] = useState<Webpage[]>(mockWebpages);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoadingEmailCampaigns, setIsLoadingEmailCampaigns] = useState(true);
  const [portalLayouts, setPortalLayouts] = useState<PortalLayout[]>([]);

  // Use authenticated user ID or fallback to 'c1' for development
  const currentUserId = user?.id || 'c1';

  // Load data from Supabase on mount
  useEffect(() => {
    loadClients();
    loadTeamMembers();
    loadProjects();
    loadActivities();
    loadVolunteers();
    loadCases();
    loadEvents();
    loadEmailCampaigns();
  }, []);

  // Real-time subscriptions for Cases
  useRealtime('cases', (payload) => {
    if (payload.eventType === 'INSERT') {
      const newCase = payload.new;
      setCases(prev => [newCase, ...prev]);
      showToast(`New case created: ${newCase.title}`, 'info');
    } else if (payload.eventType === 'UPDATE') {
      const updatedCase = payload.new;
      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    } else if (payload.eventType === 'DELETE') {
      const deletedCase = payload.old;
      setCases(prev => prev.filter(c => c.id !== deletedCase.id));
    }
  });

  // Real-time subscriptions for Projects
  useRealtime('projects', (payload) => {
    if (payload.eventType === 'INSERT') {
      const newProject = payload.new;
      setProjects(prev => [newProject, ...prev]);
      showToast(`New project created: ${newProject.name}`, 'info');
    } else if (payload.eventType === 'UPDATE') {
      const updatedProject = payload.new;
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    } else if (payload.eventType === 'DELETE') {
      const deletedProject = payload.old;
      setProjects(prev => prev.filter(p => p.id !== deletedProject.id));
    }
  });

  // Real-time subscriptions for Activities
  useRealtime('activities', (payload) => {
    if (payload.eventType === 'INSERT') {
      const newActivity = payload.new;
      setActivities(prev => [newActivity, ...prev]);
      showToast(`New activity: ${newActivity.title}`, 'info');
    } else if (payload.eventType === 'UPDATE') {
      const updatedActivity = payload.new;
      setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
    } else if (payload.eventType === 'DELETE') {
      const deletedActivity = payload.old;
      setActivities(prev => prev.filter(a => a.id !== deletedActivity.id));
    }
  });

  async function loadClients() {
    try {
      setIsLoadingClients(true);
      const data = await clientService.getAll();
      setClients(data);
      console.log('✅ Loaded', data.length, 'clients from Supabase');
    } catch (error) {
      console.error('❌ Error loading clients:', error);
      showToast('Failed to load clients', 'error');
      setClients(mockClients); // Fallback to mock data
    } finally {
      setIsLoadingClients(false);
    }
  }

  async function loadProjects() {
    try {
      setIsLoadingProjects(true);
      const data = await projectService.getAll();
      setProjects(data);
      console.log('✅ Loaded', data.length, 'projects from Supabase');
    } catch (error) {
      console.error('❌ Error loading projects:', error);
      showToast('Failed to load projects', 'error');
      setProjects(mockProjects); // Fallback to mock data
    } finally {
      setIsLoadingProjects(false);
    }
  }

  async function loadActivities() {
    try {
      setIsLoadingActivities(true);
      const data = await activityService.getAll();
      // Sort by date (newest first)
      const sorted = data.sort((a, b) => 
        new Date(b.activityDate).getTime() - new Date(a.activityDate).getTime()
      );
      setActivities(sorted);
      console.log('✅ Loaded', data.length, 'activities from Supabase');
    } catch (error) {
      console.error('❌ Error loading activities:', error);
      showToast('Failed to load activities', 'error');
      setActivities(mockActivities); // Fallback to mock data
    } finally {
      setIsLoadingActivities(false);
    }
  }

  async function loadTeamMembers() {
    try {
      setIsLoadingTeamMembers(true);
      const data = await teamMemberService.getAll();
      setTeamMembers(data);
      console.log('✅ Loaded', data.length, 'team members from Supabase');
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      showToast('Failed to load team members', 'error');
      setTeamMembers(mockTeamMembers); // Fallback to mock data
    } finally {
      setIsLoadingTeamMembers(false);
    }
  }

  async function loadVolunteers() {
    try {
      setIsLoadingVolunteers(true);
      const data = await volunteerService.getAll();
      setVolunteers(data);
      console.log('✅ Loaded', data.length, 'volunteers from Supabase');
    } catch (error) {
      console.error('❌ Error loading volunteers:', error);
      showToast('Failed to load volunteers', 'error');
      setVolunteers(mockVolunteers); // Fallback to mock data
    } finally {
      setIsLoadingVolunteers(false);
    }
  }

  async function loadCases() {
    try {
      setIsLoadingCases(true);
      const data = await caseService.getAll();
      setCases(data);
      console.log('✅ Loaded', data.length, 'cases from Supabase');
    } catch (error) {
      console.error('❌ Error loading cases:', error);
      showToast('Failed to load cases', 'error');
      setCases(mockCases); // Fallback to mock data
    } finally {
      setIsLoadingCases(false);
    }
  }

  async function loadEvents() {
    try {
      setIsLoadingEvents(true);
      const data = await eventService.getAll();
      setEvents(data);
      console.log('✅ Loaded', data.length, 'events from Supabase');
    } catch (error) {
      console.error('❌ Error loading events:', error);
      showToast('Failed to load events', 'error');
      setEvents(mockEvents); // Fallback to mock data
    } finally {
      setIsLoadingEvents(false);
    }
  }

  async function loadEmailCampaigns() {
    try {
      setIsLoadingEmailCampaigns(true);
      const data = await emailCampaignService.getAll();
      setEmailCampaigns(data);
      console.log('✅ Loaded', data.length, 'email campaigns from Supabase');
    } catch (error) {
      console.error('❌ Error loading email campaigns:', error);
      showToast('Failed to load email campaigns', 'error');
      setEmailCampaigns(mockEmailCampaigns); // Fallback to mock data
    } finally {
      setIsLoadingEmailCampaigns(false);
    }
  }

const [currentProjectsView, setCurrentProjectsView] = useState<'hub' | 'list' | 'kanban' | 'gantt' | 'flowchart' | 'resources'>('hub');
  const [openTabs, setOpenTabs] = useState<Page[]>(['dashboard']);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [portalClientId, setPortalClientId] = useState<string | null>(null);

  // Generate breadcrumbs based on current page and context
  const breadcrumbs = useMemo(() => {
    let detailContext: any = {};
    let isDetailView = false;
    
    // Detect if we're in a detail view
    if (selectedProjectId && currentPage === 'projects') {
      isDetailView = true;
      const project = projects.find(p => p.id === selectedProjectId);
      if (project) {
        detailContext.projectName = project.name;
        const client = clients.find(c => c.id === project.clientId);
        if (client) {
          detailContext.clientName = client.name;
        }
      }
    }
    
    if (selectedOrganizationId && currentPage === 'organizations') {
      isDetailView = true;
      const client = clients.find(c => c.id === selectedOrganizationId);
      if (client) {
        detailContext.clientName = client.name;
      }
    }
    
    if (selectedCaseId && currentPage === 'case') {
      isDetailView = true;
      const caseItem = cases.find(c => c.id === selectedCaseId);
      if (caseItem) {
        detailContext.caseTitle = caseItem.title;
      }
    }
    
    // Generate breadcrumbs
    const items = getBreadcrumbsForPage(currentPage, detailContext);
    
    // If we're in a detail view, make sure the parent page is clickable
    // by not marking it as the current page
    if (isDetailView && items.length > 0) {
      // The last item is the detail (current page)
      // The second-to-last should be clickable
      return items;
    }
    
    return items;
  }, [currentPage, selectedProjectId, selectedOrganizationId, selectedCaseId, projects, clients, cases]);

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

  // State for Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [recentPages, setRecentPages] = useState<Array<{ page: Page; label: string }>>([]);


  // State for Gold Pages editor
  const [isGoldPagesEditorOpen, setIsGoldPagesEditorOpen] = useState(false);
  const [editingWebpage, setEditingWebpage] = useState<Webpage | null>(null);
  
  // State for Notifications
  const [notifications, setNotifications] = useState<Set<Page>>(new Set());

  // State for Guided Tour
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  // State for Theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
        return localStorage.getItem('theme') as 'light' | 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });

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
        id: 'add-client',
        label: 'Add Organization',
        icon: <BuildingIcon />,
        color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300',
        onClick: () => setIsAddContactDialogOpen(true),
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
    ];
    let primaryActionId: string | null = null;
    switch (currentPage) {
      case 'projects': primaryActionId = 'new-project'; break;
      case 'organizations':
      case 'contacts': primaryActionId = 'add-client'; break;
      case 'case': primaryActionId = 'create-case'; break;
      case 'volunteers': primaryActionId = 'add-volunteer'; break;
      case 'activities': primaryActionId = 'log-activity'; break;
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

  const tourSteps: TourStep[] = [
    {
        selector: '#main-sidebar',
        title: "Main Navigation",
        content: "This is your main sidebar. You can navigate to all major sections of the application from here.",
        position: 'right'
    },
    {
        selector: '#global-search-form',
        title: "Global Search",
        content: "Use this powerful search bar to find anything in your CRM, from projects to contacts. You can even search the web for new leads.",
        position: 'bottom'
    },
    {
        selector: '#stat-card-active-projects',
        title: "At-a-Glance Metrics",
        content: "Your dashboard provides key metrics to give you a quick overview of your organization's performance.",
        position: 'bottom'
    },
    {
        selector: '#quick-add-button',
        title: "Quick Actions",
        content: "Use this button to quickly add new items like projects, activities, or contacts from anywhere in the app. Try using Cmd/Ctrl + K!",
        position: 'left'
    }
  ];

  useEffect(() => {
      const layouts = portalDbService.getLayouts();
      setPortalLayouts(layouts);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
        root.classList.add('dark');
        body.classList.add('dark-mode');
        body.classList.remove('light-mode');
    } else {
        root.classList.remove('dark');
        body.classList.add('light-mode');
        body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Command Palette Keyboard Shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Track recent pages when navigating
  useEffect(() => {
    const navItem = allNavItems.find(item => item.pageId === currentPage);
    if (navItem) {
      setRecentPages(prev => {
        // Remove if already exists
        const filtered = prev.filter(p => p.page !== currentPage);
        // Add to beginning
        const updated = [{ page: currentPage, label: navItem.label }, ...filtered];
        // Keep only last 5
        return updated.slice(0, 5);
      });
    }
  }, [currentPage]);

  // Check for new data on initial load to set notifications
  useEffect(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const newNotifications = new Set<Page>();

    if (mockCases.some(c => new Date(c.createdAt).getTime() > oneDayAgo)) {
        newNotifications.add('case');
    }
    if (mockActivities.some(a => new Date(a.activityDate).getTime() > oneDayAgo)) {
        newNotifications.add('activities');
    }
    if (mockDonations.some(d => new Date(d.donationDate).getTime() > oneDayAgo)) {
        newNotifications.add('donations');
    }
    
    setNotifications(newNotifications);
  }, []);

  const switchActivePage = useCallback((page: Page) => {
    setCurrentPage(page);
    setSelectedProjectId(null);
    setSelectedCaseId(null);
    setSelectedOrganizationId(null);
    setPortalClientId(null);
    setNotifications(prev => {
        const newNotifications = new Set(prev);
        newNotifications.delete(page);
        return newNotifications;
    });
  }, []);

  const navigateToPage = useCallback((page: Page) => {
    if (!openTabs.includes(page)) {
      setOpenTabs(prev => [...prev, page]);
    }
    switchActivePage(page);
  }, [openTabs, switchActivePage]);
  
  const handleCloseTab = useCallback((pageToClose: Page, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const tabIndex = openTabs.indexOf(pageToClose);
    if (tabIndex === -1 || openTabs.length <= 1) return;

    const newTabs = openTabs.filter(p => p !== pageToClose);
    setOpenTabs(newTabs);

    if (currentPage === pageToClose) {
        const newIndex = tabIndex > 0 ? tabIndex - 1 : 0;
        switchActivePage(newTabs[newIndex]);
    }
  }, [openTabs, currentPage, switchActivePage]);


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    // Only navigate if not already on projects page (navigateToPage would clear selectedProjectId)
    if (currentPage !== 'projects') {
      setCurrentPage('projects');
      if (!openTabs.includes('projects')) {
        setOpenTabs(prev => [...prev, 'projects']);
      }
    }
  }, [currentPage, openTabs]);
  
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

  const handleAddContact = async (newContact: Omit<Client, 'id' | 'createdAt'>) => {
    try {
      const contactWithId: Client = {
        ...newContact,
        id: `cl-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const savedClient = await clientService.create(contactWithId);
      setClients(prev => [...prev, savedClient]);
      setIsAddContactDialogOpen(false);
      showToast('Organization added.', 'success');
    } catch (error) {
      console.error('Error adding client:', error);
      showToast('Failed to add organization', 'error');
    }
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

  const handleDeleteCase = async (caseId: string) => {
    const caseToDelete = cases.find(c => c.id === caseId);
    if (window.confirm(`Are you sure you want to delete this case: "${caseToDelete?.title}"?`)) {
      try {
        await caseService.delete(caseId);
        setCases(prev => prev.filter(c => c.id !== caseId));
        showToast(`Case "${caseToDelete?.title}" deleted successfully`, 'success');
      } catch (error) {
        console.error('Error deleting case:', error);
        showToast('Failed to delete case', 'error');
      }
    }
  };

  const handleSaveCase = async (caseToSave: Omit<Case, 'createdAt' | 'lastUpdatedAt'> & { id?: string }) => {
    try {
      if (caseToSave.id) {
        // Update existing case
        const updatedCase = await caseService.update(caseToSave.id, caseToSave);
        setCases(prev => prev.map(c => c.id === caseToSave.id ? updatedCase : c));
        showToast(`Case "${caseToSave.title}" updated successfully!`, 'success');
      } else {
        // Create new case
        const newCase = await caseService.create({
          ...caseToSave,
          id: `case-${Date.now()}`, // Generate temporary ID
        });
        setCases(prev => [newCase, ...prev]);
        showToast(`Case "${caseToSave.title}" created successfully!`, 'success');
      }
      setIsCaseDialogOpen(false);
      setEditingCase(null);
    } catch (error) {
      console.error('Error saving case:', error);
      showToast('Failed to save case', 'error');
    }
  };

  const handleUpdateCaseStatus = async (caseId: string, newStatus: CaseStatus) => {
    try {
      const updatedCase = await caseService.update(caseId, { status: newStatus });
      setCases(prevCases => prevCases.map(c => c.id === caseId ? updatedCase : c));
      showToast(`Case moved to "${newStatus}"`, 'success');
    } catch (error) {
      console.error('Error updating case status:', error);
      showToast('Failed to update case status', 'error');
    }
  };

  const handleAddCaseComment = async (caseId: string, text: string) => {
    try {
      const newComment = await caseService.addComment(caseId, {
        authorId: currentUserId,
        text,
      });
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
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Failed to add comment', 'error');
    }
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

    try {
        const allTasks: EnrichedTask[] = projects.flatMap(p => 
            p.tasks.map(t => ({...t, projectName: p.name, projectId: p.id}))
        );

        const allDataForAI = { clients, projects, tasks: allTasks, cases, teamMembers, activities, volunteers, documents };
        
        const { internalResults, webResults } = await performAdvancedSearch(query, allDataForAI, includeWebSearch);
        
        const finalResults: SearchResults = {
            projects: projects.filter(p => internalResults.projectIds?.includes(p.id)),
            clients: clients.filter(c => internalResults.clientIds?.includes(c.id)),
            tasks: allTasks.filter(t => internalResults.taskIds?.includes(t.id)),
            teamMembers: teamMembers.filter(tm => internalResults.teamMemberIds?.includes(tm.id)),
            activities: activities.filter(a => internalResults.activityIds?.includes(a.id)),
            volunteers: volunteers.filter(v => internalResults.volunteerIds?.includes(v.id)),
            cases: cases.filter(c => internalResults.caseIds?.includes(c.id)),
            documents: documents.filter(d => internalResults.documentIds?.includes(d.id)),
            webResults: webResults,
        };
        setSearchResults(finalResults);

    } catch (error) {
        console.error("Advanced search failed:", error);
        setSearchResults({ projects: [], clients: [], tasks: [], teamMembers: [], activities: [], volunteers: [], cases: [], documents: [], webResults: [] });
    } finally {
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

  // --- Command Palette Quick Action Handler ---
  const handleCommandPaletteAction = (action: string) => {
    switch (action) {
      case 'new-project':
        setIsProjectPlannerOpen(true);
        break;
      case 'new-client':
        setIsAddContactDialogOpen(true);
        break;
      case 'new-volunteer':
        setIsAddVolunteerDialogOpen(true);
        break;
      case 'new-activity':
        setEditingActivity(null);
        setIsActivityDialogOpen(true);
        break;
      case 'new-case':
        setEditingCase(null);
        setIsCaseDialogOpen(true);
        break;
      case 'new-team-member':
        setIsAddTeamMemberDialogOpen(true);
        break;
      default:
        console.warn('Unknown quick action:', action);
    }
  };

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
  if (currentProjectsView === 'hub') {
    return <ProjectsHub
      projects={projects}
      clients={clients}
      onNavigateToView={(view) => setCurrentProjectsView(view)}
      onCreateProject={handleAddProject}
    />;
  }
  return <ProjectList 
    projects={projects} 
    clients={clients} 
    onSelectProject={handleSelectProject} 
    onAddProject={handleAddProject}
    onEditProject={(id) => {
      showToast('Edit feature coming soon!', 'info');
    }}
    onDeleteProject={(id) => {
      const project = projects.find(p => p.id === id);
      if (project && window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
        setProjects(prev => prev.filter(p => p.id !== id));
        showToast(`Project "${project.name}" deleted successfully`, 'success');
      }
    }}
    onDuplicateProject={(project) => {
      const newProject: Project = {
        ...project,
        id: `p-${Date.now()}`,
        name: `${project.name} (Copy)`,
        startDate: new Date().toISOString().split('T')[0],
      };
      setProjects(prev => [newProject, ...prev]);
      showToast(`Project "${newProject.name}" created successfully`, 'success');
    }}
  />;
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
        return <ClientList clients={clients} onAddOrganization={() => setIsAddContactDialogOpen(true)} onSelectOrganization={handleSelectOrganization} />;
      case 'team':
        return <TeamMemberList teamMembers={teamMembers} onAddTeamMember={() => setIsAddTeamMemberDialogOpen(true)} />;
      case 'chat':
        return <TeamChat 
                  rooms={chatRooms}
                  messages={chatMessages}
                  teamMembers={teamMembers}
                  currentUserId={currentUserId}
                  onSendMessage={handleSendMessage}
                  onCreateRoom={() => setIsCreateRoomDialogOpen(true)}
                  activities={activities}
                  clients={clients}
                  projects={projects}
                  onLogActivity={() => setIsActivityDialogOpen(true)}
                />;
      case 'contacts': 
        return <ContactList clients={clients} onAddContact={() => setIsAddContactDialogOpen(true)} />;
      case 'donations':
        return <Donations donations={donations} clients={clients} />;
      case 'calendar': 
        return <CalendarView teamMembers={teamMembers} projects={projects} activities={activities} />;
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
        return <CharityTracker clients={clients} donations={donations} />;
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
      case 'live-chat':
        return <LiveChat />;
      case 'search-results':
        return <SearchResultsPage
            query={searchQuery}
            isLoading={isSearching}
            results={searchResults}
            onNavigateToProject={handleSelectProject}
            onNavigateToPage={navigateToPage}
        />;
      
      case 'video': return <VideoConference />;
      case 'email': return <EmailCampaigns campaigns={emailCampaigns} clients={clients} onSaveCampaign={handleSaveEmailCampaign} />;
      case 'events': return <EventEditor events={events} clients={clients} volunteers={volunteers} onSave={handleSaveEvent} />;
      case 'reports':
          return <Reports
            projects={projects}
            clients={clients}
            donations={donations}
            activities={activities}
            cases={cases}
            teamMembers={teamMembers}
            documents={documents}
          />;
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

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (!error) {
      showToast('Welcome back!', 'success');
    }
    return { error };
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const { error } = await signUp(email, password, { name, role: 'user' });
    if (!error) {
      showToast('Account created! Please sign in.', 'success');
    }
    return { error };
  };

  const handleLogout = async () => {
    await signOut();
    showToast('Logged out successfully', 'success');
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} onSignUp={handleSignUp} />;
  }

  return (
      <div className="flex h-screen text-slate-800 dark:text-slate-200">
        <Sidebar currentPage={currentPage} onNavigate={navigateToPage} notifications={notifications} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header
            onSearch={handleSearch}
            isSearching={isSearching}
            theme={theme}
            onToggleTheme={toggleTheme}
            openTabs={openTabs}
            currentPage={currentPage}
            onNavigate={switchActivePage}
            onCloseTab={handleCloseTab}
            onStartTour={() => setIsTourOpen(true)}
            userEmail={user.email}
            onLogout={handleLogout}
          />
          {/* Increased padding from p-6 sm:p-8 to p-8 sm:p-10 lg:p-12 for more breathing room */}
          {/* Added max-width container for better readability on ultra-wide screens */}
          <main className="flex-1 p-8 sm:p-10 lg:p-12 overflow-y-auto">
              <div className="max-w-[1920px] mx-auto">
                  {/* Breadcrumbs Navigation */}
                  <Breadcrumbs 
                    items={breadcrumbs} 
                    currentPage={currentPage}
                    onNavigate={navigateToPage}
                  />
                  
                  <div key={currentPage} className="page-content-wrapper">
                      {renderContent()}
                  </div>
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
        />
         <AiChatBot 
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
        />
        
        {/* Command Palette - Press Ctrl/Cmd+K to open */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={navigateToPage}
          onQuickAction={handleCommandPaletteAction}
          recentPages={recentPages}
        />
      </div>
  );
};

export default App;
