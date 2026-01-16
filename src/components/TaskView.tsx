import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Project, TeamMember, EnrichedTask } from '../types';
import { TaskStatus } from '../types';
import { getDeadlineStatus } from '../utils/dateHelpers';
import { taskManagementService, type ExtendedTask as ServiceExtendedTask } from '../services/taskManagementService';
import { taskMetricsService } from '../services/taskMetricsService';
import { supabase } from '../services/supabaseClient';
import {
  CheckSquare,
  Clock,
  Calendar,
  Users,
  LayoutGrid,
  List,
  GitBranch,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  X,
  AlertTriangle,
  Flag,
  User,
  Briefcase,
  Building,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  Circle,
  ArrowRight,
  CalendarDays,
  Timer,
  Tag,
  MessageSquare,
  Paperclip,
  Edit3,
  Trash2,
  GripVertical,
  Check,
  ChevronLeft,
  Zap,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
type ExtendedTaskStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'overdue';
type Department = 'Consulting' | 'Operations' | 'Finance' | 'HR' | 'Marketing';
type ViewMode = 'list' | 'kanban' | 'timeline' | 'department' | 'calendar';

interface ExtendedTask {
  id: string;
  title: string;
  description: string;
  status: ExtendedTaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  assignedToId: string;
  assignedToName: string;
  department: Department;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  timeEstimate: number; // hours
  timeSpent: number; // hours
  tags: string[];
  subtasks: { id: string; title: string; completed: boolean }[];
  comments: number;
  attachments: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const statusConfig: Record<ExtendedTaskStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  new: { label: 'New', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: <Circle className="w-4 h-4" /> },
  assigned: { label: 'Assigned', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: <User className="w-4 h-4" /> },
  in_progress: { label: 'In Progress', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: <Play className="w-4 h-4" /> },
  completed: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: <CheckCircle className="w-4 h-4" /> },
  overdue: { label: 'Overdue', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: <AlertTriangle className="w-4 h-4" /> },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-700/50' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const departmentConfig: Record<Department, { color: string; icon: React.ReactNode }> = {
  Consulting: { color: 'bg-blue-500', icon: <Briefcase className="w-4 h-4" /> },
  Operations: { color: 'bg-green-500', icon: <Building className="w-4 h-4" /> },
  Finance: { color: 'bg-emerald-500', icon: <Building className="w-4 h-4" /> },
  HR: { color: 'bg-pink-500', icon: <Users className="w-4 h-4" /> },
  Marketing: { color: 'bg-purple-500', icon: <Building className="w-4 h-4" /> },
};

// ============================================================================
// SAMPLE DATA - 35 Tasks
// ============================================================================

const generateDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

const getDefaultDueDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

const initialTasks: ExtendedTask[] = [
  // CONSULTING DEPARTMENT
  { id: '1', title: 'Annual Impact Report - Final Review', description: 'Complete final review of annual impact report before printing', status: 'in_progress', priority: 'high', dueDate: generateDate(3), createdAt: generateDate(-10), assignedToId: '1', assignedToName: 'Sarah Johnson', department: 'Consulting', projectName: 'Hope Harbor Impact Report', clientName: 'Hope Harbor Foundation', timeEstimate: 4, timeSpent: 2, tags: ['report', 'annual'], subtasks: [{ id: '1a', title: 'Review financials', completed: true }, { id: '1b', title: 'Verify statistics', completed: false }], comments: 3, attachments: 2 },
  { id: '2', title: 'Grant Proposal - NEA Arts Grant', description: 'Draft grant proposal for National Endowment for Arts', status: 'assigned', priority: 'high', dueDate: generateDate(7), createdAt: generateDate(-5), assignedToId: '2', assignedToName: 'Michael Chen', department: 'Consulting', projectName: 'Grant Writing Q4', clientName: 'Charleston Symphony Orchestra', timeEstimate: 8, timeSpent: 0, tags: ['grant', 'arts'], subtasks: [], comments: 1, attachments: 0 },
  { id: '3', title: 'Strategic Plan Presentation', description: 'Prepare board presentation for strategic plan rollout', status: 'in_progress', priority: 'critical', dueDate: generateDate(1), createdAt: generateDate(-14), assignedToId: '1', assignedToName: 'Sarah Johnson', department: 'Consulting', projectName: 'United Way Strategy 2025', clientName: 'United Way of the Midlands', timeEstimate: 6, timeSpent: 4, tags: ['strategy', 'board'], subtasks: [{ id: '3a', title: 'Create slides', completed: true }, { id: '3b', title: 'Add metrics', completed: true }, { id: '3c', title: 'Review with team', completed: false }], comments: 5, attachments: 3 },
  { id: '4', title: 'Merger Due Diligence Report', description: 'Complete financial analysis for proposed merger', status: 'in_progress', priority: 'high', dueDate: generateDate(10), createdAt: generateDate(-21), assignedToId: '1', assignedToName: 'Sarah Johnson', department: 'Consulting', projectName: 'CYDC Merger Study', clientName: 'Carolina Youth Development Center', timeEstimate: 20, timeSpent: 12, tags: ['merger', 'analysis'], subtasks: [], comments: 8, attachments: 5 },
  { id: '5', title: 'Board Training Workshop Materials', description: 'Develop training materials for nonprofit board governance', status: 'new', priority: 'medium', dueDate: generateDate(14), createdAt: generateDate(-3), assignedToId: '3', assignedToName: 'Emily Davis', department: 'Consulting', projectName: 'Board Development', clientName: 'Palmetto Animal League', timeEstimate: 5, timeSpent: 0, tags: ['training', 'board'], subtasks: [], comments: 0, attachments: 0 },
  { id: '6', title: 'Donor Retention Analysis', description: 'Analyze donor retention rates and recommend improvements', status: 'completed', priority: 'medium', dueDate: generateDate(-5), createdAt: generateDate(-20), completedAt: generateDate(-6), assignedToId: '2', assignedToName: 'Michael Chen', department: 'Consulting', projectName: 'Donor Strategy', clientName: 'Lowcountry Food Bank', timeEstimate: 6, timeSpent: 7, tags: ['donors', 'analysis'], subtasks: [], comments: 4, attachments: 2 },
  { id: '7', title: 'Volunteer Program Assessment', description: 'Assess current volunteer program and provide recommendations', status: 'overdue', priority: 'high', dueDate: generateDate(-3), createdAt: generateDate(-17), assignedToId: '3', assignedToName: 'Emily Davis', department: 'Consulting', clientName: 'Habitat for Humanity SC', timeEstimate: 8, timeSpent: 3, tags: ['volunteer', 'assessment'], subtasks: [], comments: 2, attachments: 1 },

  // OPERATIONS DEPARTMENT
  { id: '8', title: 'CRM Data Migration', description: 'Migrate client data from old system to Logos Vision', status: 'in_progress', priority: 'high', dueDate: generateDate(5), createdAt: generateDate(-7), assignedToId: '4', assignedToName: 'David Wilson', department: 'Operations', timeEstimate: 12, timeSpent: 6, tags: ['crm', 'migration'], subtasks: [{ id: '8a', title: 'Export old data', completed: true }, { id: '8b', title: 'Clean data', completed: true }, { id: '8c', title: 'Import to new system', completed: false }, { id: '8d', title: 'Verify integrity', completed: false }], comments: 6, attachments: 3 },
  { id: '9', title: 'Office Equipment Inventory', description: 'Complete annual inventory of office equipment', status: 'new', priority: 'low', dueDate: generateDate(21), createdAt: generateDate(-2), assignedToId: '4', assignedToName: 'David Wilson', department: 'Operations', timeEstimate: 3, timeSpent: 0, tags: ['inventory', 'annual'], subtasks: [], comments: 0, attachments: 0 },
  { id: '10', title: 'Security Audit Preparation', description: 'Prepare documentation for upcoming security audit', status: 'assigned', priority: 'high', dueDate: generateDate(8), createdAt: generateDate(-4), assignedToId: '4', assignedToName: 'David Wilson', department: 'Operations', timeEstimate: 10, timeSpent: 0, tags: ['security', 'audit'], subtasks: [], comments: 1, attachments: 0 },
  { id: '11', title: 'Backup System Test', description: 'Test disaster recovery and backup systems', status: 'completed', priority: 'critical', dueDate: generateDate(-10), createdAt: generateDate(-25), completedAt: generateDate(-11), assignedToId: '4', assignedToName: 'David Wilson', department: 'Operations', timeEstimate: 4, timeSpent: 5, tags: ['backup', 'disaster-recovery'], subtasks: [], comments: 3, attachments: 1 },
  { id: '12', title: 'Vendor Contract Renewals', description: 'Review and renew annual vendor contracts', status: 'in_progress', priority: 'medium', dueDate: generateDate(12), createdAt: generateDate(-8), assignedToId: '4', assignedToName: 'David Wilson', department: 'Operations', timeEstimate: 6, timeSpent: 2, tags: ['contracts', 'vendors'], subtasks: [], comments: 2, attachments: 4 },

  // FINANCE DEPARTMENT
  { id: '13', title: 'Q4 Financial Report', description: 'Prepare Q4 financial statements and analysis', status: 'in_progress', priority: 'critical', dueDate: generateDate(2), createdAt: generateDate(-12), assignedToId: '5', assignedToName: 'Jennifer Lee', department: 'Finance', timeEstimate: 16, timeSpent: 10, tags: ['quarterly', 'report'], subtasks: [{ id: '13a', title: 'Reconcile accounts', completed: true }, { id: '13b', title: 'Generate statements', completed: false }, { id: '13c', title: 'Write analysis', completed: false }], comments: 4, attachments: 6 },
  { id: '14', title: 'Budget Planning 2025', description: 'Develop organizational budget for fiscal year 2025', status: 'new', priority: 'high', dueDate: generateDate(20), createdAt: generateDate(-1), assignedToId: '5', assignedToName: 'Jennifer Lee', department: 'Finance', timeEstimate: 24, timeSpent: 0, tags: ['budget', '2025'], subtasks: [], comments: 0, attachments: 0 },
  { id: '15', title: 'Grant Financial Reconciliation', description: 'Reconcile grant expenditures for federal reporting', status: 'overdue', priority: 'critical', dueDate: generateDate(-2), createdAt: generateDate(-15), assignedToId: '5', assignedToName: 'Jennifer Lee', department: 'Finance', timeEstimate: 8, timeSpent: 6, tags: ['grant', 'reconciliation'], subtasks: [], comments: 7, attachments: 8 },
  { id: '16', title: 'Payroll Processing', description: 'Process bi-weekly payroll for all staff', status: 'completed', priority: 'high', dueDate: generateDate(-1), createdAt: generateDate(-5), completedAt: generateDate(-1), assignedToId: '5', assignedToName: 'Jennifer Lee', department: 'Finance', timeEstimate: 2, timeSpent: 2, tags: ['payroll', 'recurring'], subtasks: [], comments: 0, attachments: 1 },
  { id: '17', title: 'Audit Preparation Documents', description: 'Gather and organize documents for annual audit', status: 'assigned', priority: 'medium', dueDate: generateDate(15), createdAt: generateDate(-3), assignedToId: '5', assignedToName: 'Jennifer Lee', department: 'Finance', timeEstimate: 12, timeSpent: 0, tags: ['audit', 'preparation'], subtasks: [], comments: 1, attachments: 0 },

  // HR DEPARTMENT
  { id: '18', title: 'New Employee Onboarding - John Smith', description: 'Complete onboarding process for new consultant', status: 'in_progress', priority: 'high', dueDate: generateDate(4), createdAt: generateDate(-3), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 8, timeSpent: 3, tags: ['onboarding', 'new-hire'], subtasks: [{ id: '18a', title: 'Paperwork', completed: true }, { id: '18b', title: 'IT setup', completed: true }, { id: '18c', title: 'Team introductions', completed: false }, { id: '18d', title: 'Training schedule', completed: false }], comments: 4, attachments: 5 },
  { id: '19', title: 'Performance Review Cycle', description: 'Coordinate annual performance review process', status: 'new', priority: 'medium', dueDate: generateDate(25), createdAt: generateDate(-2), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 20, timeSpent: 0, tags: ['performance', 'annual'], subtasks: [], comments: 0, attachments: 0 },
  { id: '20', title: 'Benefits Enrollment Update', description: 'Update benefits enrollment system for open enrollment', status: 'completed', priority: 'high', dueDate: generateDate(-7), createdAt: generateDate(-21), completedAt: generateDate(-8), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 10, timeSpent: 12, tags: ['benefits', 'enrollment'], subtasks: [], comments: 3, attachments: 2 },
  { id: '21', title: 'Job Description Updates', description: 'Update job descriptions for all positions', status: 'assigned', priority: 'low', dueDate: generateDate(30), createdAt: generateDate(-5), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 6, timeSpent: 0, tags: ['jobs', 'documentation'], subtasks: [], comments: 0, attachments: 0 },
  { id: '22', title: 'Employee Handbook Revision', description: 'Update employee handbook with new policies', status: 'in_progress', priority: 'medium', dueDate: generateDate(18), createdAt: generateDate(-10), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 15, timeSpent: 5, tags: ['handbook', 'policies'], subtasks: [], comments: 2, attachments: 1 },

  // MARKETING DEPARTMENT
  { id: '23', title: 'Year-End Newsletter', description: 'Design and write year-end newsletter for stakeholders', status: 'in_progress', priority: 'high', dueDate: generateDate(6), createdAt: generateDate(-8), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 8, timeSpent: 4, tags: ['newsletter', 'year-end'], subtasks: [{ id: '23a', title: 'Write articles', completed: true }, { id: '23b', title: 'Design layout', completed: false }, { id: '23c', title: 'Get approvals', completed: false }], comments: 5, attachments: 4 },
  { id: '24', title: 'Social Media Calendar - January', description: 'Plan social media content for January', status: 'new', priority: 'medium', dueDate: generateDate(16), createdAt: generateDate(-1), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 4, timeSpent: 0, tags: ['social-media', 'planning'], subtasks: [], comments: 0, attachments: 0 },
  { id: '25', title: 'Website Analytics Report', description: 'Compile monthly website analytics and insights', status: 'completed', priority: 'low', dueDate: generateDate(-3), createdAt: generateDate(-10), completedAt: generateDate(-4), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 2, timeSpent: 2, tags: ['analytics', 'report'], subtasks: [], comments: 1, attachments: 1 },
  { id: '26', title: 'Event Promotion - Gala 2025', description: 'Create promotional materials for annual gala', status: 'assigned', priority: 'high', dueDate: generateDate(22), createdAt: generateDate(-4), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 16, timeSpent: 0, tags: ['event', 'gala'], subtasks: [], comments: 2, attachments: 0 },
  { id: '27', title: 'Brand Guidelines Update', description: 'Update brand guidelines document with new assets', status: 'overdue', priority: 'medium', dueDate: generateDate(-5), createdAt: generateDate(-20), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 6, timeSpent: 2, tags: ['brand', 'guidelines'], subtasks: [], comments: 3, attachments: 2 },
  { id: '28', title: 'Client Success Stories', description: 'Gather and write 3 new client success stories', status: 'in_progress', priority: 'medium', dueDate: generateDate(11), createdAt: generateDate(-6), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 10, timeSpent: 3, tags: ['testimonials', 'content'], subtasks: [], comments: 1, attachments: 0 },

  // MORE TASKS
  { id: '29', title: 'Client Satisfaction Survey', description: 'Send and analyze annual client satisfaction survey', status: 'new', priority: 'medium', dueDate: generateDate(28), createdAt: generateDate(-2), assignedToId: '3', assignedToName: 'Emily Davis', department: 'Consulting', timeEstimate: 8, timeSpent: 0, tags: ['survey', 'clients'], subtasks: [], comments: 0, attachments: 0 },
  { id: '30', title: 'Team Building Event Planning', description: 'Plan Q1 team building activity', status: 'assigned', priority: 'low', dueDate: generateDate(35), createdAt: generateDate(-1), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 5, timeSpent: 0, tags: ['team', 'event'], subtasks: [], comments: 1, attachments: 0 },
  { id: '31', title: 'Software License Renewals', description: 'Review and renew software licenses', status: 'in_progress', priority: 'medium', dueDate: generateDate(9), createdAt: generateDate(-5), assignedToId: '4', assignedToName: 'David Wilson', department: 'Operations', timeEstimate: 3, timeSpent: 1, tags: ['software', 'licenses'], subtasks: [], comments: 0, attachments: 2 },
  { id: '32', title: 'Press Release - Partnership Announcement', description: 'Write press release for new partnership', status: 'overdue', priority: 'high', dueDate: generateDate(-1), createdAt: generateDate(-8), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', clientName: 'Coastal Conservation League', timeEstimate: 3, timeSpent: 1, tags: ['press', 'partnership'], subtasks: [], comments: 4, attachments: 1 },
  { id: '33', title: 'Compliance Training Update', description: 'Update annual compliance training materials', status: 'new', priority: 'medium', dueDate: generateDate(19), createdAt: generateDate(-3), assignedToId: '6', assignedToName: 'Rachel Green', department: 'HR', timeEstimate: 8, timeSpent: 0, tags: ['compliance', 'training'], subtasks: [], comments: 0, attachments: 0 },
  { id: '34', title: 'Invoice Processing - December', description: 'Process all December client invoices', status: 'in_progress', priority: 'high', dueDate: generateDate(0), createdAt: generateDate(-7), assignedToId: '5', assignedToName: 'Jennifer Lee', department: 'Finance', timeEstimate: 4, timeSpent: 3, tags: ['invoices', 'monthly'], subtasks: [], comments: 2, attachments: 0 },
  { id: '35', title: 'Annual Report Photography', description: 'Coordinate photography for annual report', status: 'assigned', priority: 'medium', dueDate: generateDate(13), createdAt: generateDate(-2), assignedToId: '7', assignedToName: 'Alex Thompson', department: 'Marketing', timeEstimate: 6, timeSpent: 0, tags: ['photography', 'annual-report'], subtasks: [], comments: 0, attachments: 0 },
];

// ============================================================================
// PROPS
// ============================================================================

interface TaskViewProps {
  projects: Project[];
  teamMembers: TeamMember[];
  onSelectTask: (projectId: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TaskView: React.FC<TaskViewProps> = ({ projects, teamMembers, onSelectTask }) => {
  // Core state
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtendedTaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<Department | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<ExtendedTask | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Set<Department>>(new Set(['Consulting', 'Operations', 'Finance', 'HR', 'Marketing']));
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);

  // Metrics state
  const [metricsData, setMetricsData] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    inProgress: 0,
    dueToday: 0,
    critical: 0
  });

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taskManagementService.getAllEnriched();
      setTasks(data);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      const metrics = await taskMetricsService.getOverallMetrics(tasks);
      setMetricsData(metrics);
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  }, [tasks]);

  // Initial load
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Load metrics when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      loadMetrics();
    }
  }, [tasks, loadMetrics]);

  // Real-time subscriptions
  useEffect(() => {
    const subscription = supabase
      .channel('tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks'
      }, (payload) => {
        console.log('Task changed:', payload);
        loadTasks();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadTasks]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const addTask = useCallback(async (taskData: Partial<ExtendedTask>) => {
    try {
      const newTask = await taskManagementService.create({
        title: taskData.title || 'New Task',
        description: taskData.description || '',
        status: taskData.status || 'new',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || getDefaultDueDate(),
        assignedToId: taskData.assignedToId || '',
        department: taskData.department || 'Consulting',
        projectId: taskData.projectId,
        timeEstimate: taskData.timeEstimate || 4,
        timeSpent: taskData.timeSpent || 0,
        tags: taskData.tags || [],
      });

      if (newTask) {
        setTasks(prev => [newTask, ...prev]);
        showToast('Task created successfully');
        return newTask;
      }
    } catch (err) {
      console.error('Error creating task:', err);
      showToast('Failed to create task', 'error');
      setError('Failed to create task. Please try again.');
    }
  }, [showToast]);

  const updateTask = useCallback(async (id: string, updates: Partial<ExtendedTask>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (selectedTask?.id === id) {
      setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
    }

    try {
      await taskManagementService.update(id, updates);
      showToast('Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
      showToast('Failed to update task', 'error');
      // Reload to get correct state
      loadTasks();
      setError('Failed to update task. Please try again.');
    }
  }, [selectedTask, showToast, loadTasks]);

  const deleteTask = useCallback(async (id: string) => {
    // Optimistic update
    const previousTasks = tasks;
    setTasks(prev => prev.filter(t => t.id !== id));
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedTask?.id === id) setSelectedTask(null);

    try {
      await taskManagementService.delete(id);
      showToast('Task deleted successfully');
    } catch (err) {
      console.error('Error deleting task:', err);
      showToast('Failed to delete task', 'error');
      // Revert on error
      setTasks(previousTasks);
      setError('Failed to delete task. Please try again.');
    }
  }, [selectedTask, showToast, tasks]);

  const updateTaskStatus = useCallback(async (id: string, status: ExtendedTaskStatus) => {
    const updates: Partial<ExtendedTask> = { status };
    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }
    await updateTask(id, updates);
  }, [updateTask]);

  const bulkUpdateTasks = useCallback(async (ids: Set<string>, updates: Partial<ExtendedTask>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => ids.has(t.id) ? { ...t, ...updates } : t));
    setSelectedTaskIds(new Set());

    try {
      if (updates.status) {
        await taskManagementService.bulkUpdateStatus(Array.from(ids), updates.status);
      }
      showToast(`${ids.size} tasks updated`);
    } catch (err) {
      console.error('Error bulk updating tasks:', err);
      showToast('Failed to update tasks', 'error');
      loadTasks();
      setError('Failed to update tasks. Please try again.');
    }
  }, [showToast, loadTasks]);

  const bulkDeleteTasks = useCallback(async (ids: Set<string>) => {
    // Optimistic update
    const previousTasks = tasks;
    setTasks(prev => prev.filter(t => !ids.has(t.id)));
    setSelectedTaskIds(new Set());

    try {
      await Promise.all(Array.from(ids).map(id => taskManagementService.delete(id)));
      showToast(`${ids.size} tasks deleted`);
    } catch (err) {
      console.error('Error bulk deleting tasks:', err);
      showToast('Failed to delete tasks', 'error');
      setTasks(previousTasks);
      setError('Failed to delete tasks. Please try again.');
    }
  }, [showToast, tasks]);

  // Get unique assignees from tasks
  const assignees = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach(t => map.set(t.assignedToId, t.assignedToName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  // Use metrics from state (loaded from taskMetricsService)
  const metrics = metricsData;

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (departmentFilter !== 'all' && t.department !== departmentFilter) return false;
      if (assigneeFilter !== 'all' && t.assignedToId !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, departmentFilter, assigneeFilter]);

  // Group by status for kanban
  const tasksByStatus = useMemo(() => {
    const groups: Record<ExtendedTaskStatus, ExtendedTask[]> = { new: [], assigned: [], in_progress: [], completed: [], overdue: [] };
    filteredTasks.forEach(t => groups[t.status]?.push(t));
    return groups;
  }, [filteredTasks]);

  // Group by department
  const tasksByDepartment = useMemo(() => {
    const groups: Record<Department, ExtendedTask[]> = { Consulting: [], Operations: [], Finance: [], HR: [], Marketing: [] };
    filteredTasks.forEach(t => groups[t.department]?.push(t));
    return groups;
  }, [filteredTasks]);

  const viewIcons: Record<ViewMode, React.ReactNode> = {
    list: <List className="w-4 h-4" />,
    kanban: <LayoutGrid className="w-4 h-4" />,
    timeline: <Clock className="w-4 h-4" />,
    department: <GitBranch className="w-4 h-4" />,
    calendar: <Calendar className="w-4 h-4" />,
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
        <span className="ml-4 text-gray-600 dark:text-gray-400">Loading tasks...</span>
      </div>
    );
  }

  // Empty state
  if (!loading && tasks.length === 0 && !error) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Create your first task to get started</p>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center gap-2 animate-slide-in ${
              toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {toast.type === 'info' && <Zap className="w-4 h-4" />}
            {toast.message}
          </div>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CheckSquare className="w-8 h-8 text-rose-500" />
            Task Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage tasks across all departments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplatesDialog(true)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border-2 border-rose-500 text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-2 transition-colors"
          >
            <GitBranch className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="Total Tasks" value={metrics.total} color="bg-gray-500" />
        <MetricCard label="In Progress" value={metrics.inProgress} color="bg-blue-500" />
        <MetricCard label="Overdue" value={metrics.overdue} color="bg-red-500" alert={metrics.overdue > 0} />
        <MetricCard label="Due Today" value={metrics.dueToday} color="bg-amber-500" />
        <MetricCard label="Critical" value={metrics.critical} color="bg-rose-500" alert={metrics.critical > 0} />
        <MetricCard label="Completed" value={metrics.completed} color="bg-green-500" />
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {(Object.keys(viewIcons) as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => setViewMode(v)}
            className={`px-4 py-2 font-medium capitalize border-b-2 -mb-px transition flex items-center gap-2 whitespace-nowrap ${
              viewMode === v
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {viewIcons[v]}
            {v}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
            />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ExtendedTaskStatus | 'all')} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white">
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white">
            <option value="all">All Priorities</option>
            {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value as Department | 'all')} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white">
            <option value="all">All Departments</option>
            {Object.keys(departmentConfig).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white">
            <option value="all">All Assignees</option>
            {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <p className="mt-2 text-sm text-gray-500">{filteredTasks.length} of {tasks.length} tasks</p>
      </div>

      {/* Enhanced Bulk Actions Toolbar - Floating */}
      {selectedTaskIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-slate-900 dark:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-4">
            {/* Selection count */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-600">
              <CheckSquare className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold">{selectedTaskIds.size} selected</span>
            </div>

            {/* Select all / Deselect all */}
            <div className="flex items-center gap-2 pr-4 border-r border-slate-600">
              {selectedTaskIds.size < filteredTasks.length ? (
                <button
                  onClick={() => setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)))}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Select all ({filteredTasks.length})
                </button>
              ) : (
                <button
                  onClick={() => setSelectedTaskIds(new Set())}
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                >
                  Deselect all
                </button>
              )}
            </div>

            {/* Bulk actions */}
            <div className="flex items-center gap-2">
              {/* Status dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    bulkUpdateTasks(selectedTaskIds, { status: e.target.value as ExtendedTaskStatus });
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors appearance-none pr-8 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Change Status</option>
                {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>

              {/* Priority dropdown */}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    bulkUpdateTasks(selectedTaskIds, { priority: e.target.value as TaskPriority });
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors appearance-none pr-8 cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Change Priority</option>
                {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>

              {/* Delete button */}
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedTaskIds.size} task(s)? This cannot be undone.`)) {
                    bulkDeleteTasks(selectedTaskIds);
                  }
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>

            {/* Cancel button */}
            <button
              onClick={() => setSelectedTaskIds(new Set())}
              className="ml-2 p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
              title="Cancel selection"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Views */}
      {viewMode === 'list' && (
        <ListView
          tasks={filteredTasks}
          onSelectTask={setSelectedTask}
          selectedTaskIds={selectedTaskIds}
          setSelectedTaskIds={setSelectedTaskIds}
          onUpdateStatus={updateTaskStatus}
          onUpdatePriority={(id, priority) => updateTask(id, { priority })}
          assignees={assignees}
          onAssign={(id, assigneeId, assigneeName) => updateTask(id, { assignedToId: assigneeId, assignedToName: assigneeName })}
        />
      )}
      {viewMode === 'kanban' && (
        <KanbanView
          tasksByStatus={tasksByStatus}
          onSelectTask={setSelectedTask}
          onUpdateStatus={updateTaskStatus}
          draggedTaskId={draggedTaskId}
          setDraggedTaskId={setDraggedTaskId}
        />
      )}
      {viewMode === 'timeline' && <GanttTimelineView tasks={filteredTasks} onSelectTask={setSelectedTask} onUpdateTask={updateTask} />}
      {viewMode === 'department' && <DepartmentView tasksByDepartment={tasksByDepartment} expandedDepts={expandedDepts} setExpandedDepts={setExpandedDepts} onSelectTask={setSelectedTask} />}
      {viewMode === 'calendar' && <CalendarViewComponent tasks={filteredTasks} onSelectTask={setSelectedTask} />}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={deleteTask}
          assignees={assignees}
        />
      )}

      {/* Create Task Dialog */}
      {showCreateDialog && (
        <CreateTaskDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={addTask}
          assignees={assignees}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Task?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteTask(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Task Templates Dialog */}
      {showTemplatesDialog && createPortal(
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTemplatesDialog(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <GitBranch className="w-6 h-6 text-rose-500" />
                    Task Templates
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Start with a pre-built template to save time</p>
                </div>
                <button
                  onClick={() => setShowTemplatesDialog(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Template 1: Client Onboarding */}
                <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg p-5 hover:border-rose-500 dark:hover:border-rose-500 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Client Onboarding</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">New client setup process</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">Consulting</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete onboarding process for new clients including documentation, contracts, and initial meetings.</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">5 subtasks</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">~16h estimated</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs rounded">High Priority</span>
                  </div>
                  <button
                    onClick={() => {
                      addTask({
                        title: 'Client Onboarding - [Client Name]',
                        description: 'Complete onboarding process for new client',
                        status: 'new',
                        priority: 'high',
                        dueDate: getDefaultDueDate(),
                        assignedToId: '',
                        assignedToName: 'Unassigned',
                        department: 'Consulting',
                        timeEstimate: 16,
                        timeSpent: 0,
                        tags: ['onboarding', 'client'],
                        subtasks: [
                          { id: crypto.randomUUID(), title: 'Send welcome packet', completed: false },
                          { id: crypto.randomUUID(), title: 'Schedule kickoff meeting', completed: false },
                          { id: crypto.randomUUID(), title: 'Complete intake forms', completed: false },
                          { id: crypto.randomUUID(), title: 'Set up client portal access', completed: false },
                          { id: crypto.randomUUID(), title: 'Assign account manager', completed: false },
                        ]
                      });
                      setShowTemplatesDialog(false);
                      showToast('Task created from template', 'success');
                    }}
                    className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>

                {/* Template 2: Quarterly Report */}
                <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg p-5 hover:border-rose-500 dark:hover:border-rose-500 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Quarterly Report</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Financial reporting process</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded">Finance</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Prepare comprehensive quarterly financial report including statements, analysis, and board presentation.</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">4 subtasks</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">~20h estimated</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-xs rounded">Critical</span>
                  </div>
                  <button
                    onClick={() => {
                      addTask({
                        title: 'Q4 Financial Report',
                        description: 'Prepare quarterly financial statements and analysis',
                        status: 'new',
                        priority: 'critical',
                        dueDate: getDefaultDueDate(),
                        assignedToId: '',
                        assignedToName: 'Unassigned',
                        department: 'Finance',
                        timeEstimate: 20,
                        timeSpent: 0,
                        tags: ['quarterly', 'report', 'financial'],
                        subtasks: [
                          { id: crypto.randomUUID(), title: 'Reconcile all accounts', completed: false },
                          { id: crypto.randomUUID(), title: 'Generate financial statements', completed: false },
                          { id: crypto.randomUUID(), title: 'Write executive summary', completed: false },
                          { id: crypto.randomUUID(), title: 'Prepare board presentation', completed: false },
                        ]
                      });
                      setShowTemplatesDialog(false);
                      showToast('Task created from template', 'success');
                    }}
                    className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>

                {/* Template 3: Employee Onboarding */}
                <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg p-5 hover:border-rose-500 dark:hover:border-rose-500 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                        <User className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Employee Onboarding</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">New hire setup</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded">HR</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Complete onboarding checklist for new employee including paperwork, IT setup, and training schedule.</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">6 subtasks</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">~12h estimated</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 text-xs rounded">High Priority</span>
                  </div>
                  <button
                    onClick={() => {
                      addTask({
                        title: 'New Employee Onboarding - [Employee Name]',
                        description: 'Complete onboarding process for new hire',
                        status: 'new',
                        priority: 'high',
                        dueDate: getDefaultDueDate(),
                        assignedToId: '',
                        assignedToName: 'Unassigned',
                        department: 'HR',
                        timeEstimate: 12,
                        timeSpent: 0,
                        tags: ['onboarding', 'hr', 'new-hire'],
                        subtasks: [
                          { id: crypto.randomUUID(), title: 'Process employment paperwork', completed: false },
                          { id: crypto.randomUUID(), title: 'Set up IT accounts and equipment', completed: false },
                          { id: crypto.randomUUID(), title: 'Schedule orientation session', completed: false },
                          { id: crypto.randomUUID(), title: 'Assign mentor/buddy', completed: false },
                          { id: crypto.randomUUID(), title: 'Create training plan', completed: false },
                          { id: crypto.randomUUID(), title: 'Add to team meetings and Slack channels', completed: false },
                        ]
                      });
                      setShowTemplatesDialog(false);
                      showToast('Task created from template', 'success');
                    }}
                    className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>

                {/* Template 4: Marketing Campaign */}
                <div className="border-2 border-gray-200 dark:border-slate-700 rounded-lg p-5 hover:border-rose-500 dark:hover:border-rose-500 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Marketing Campaign</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Campaign launch checklist</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded">Marketing</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Plan and execute marketing campaign including content creation, design, distribution, and analytics tracking.</p>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs text-gray-500">5 subtasks</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">~24h estimated</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-xs rounded">Medium</span>
                  </div>
                  <button
                    onClick={() => {
                      addTask({
                        title: 'Marketing Campaign - [Campaign Name]',
                        description: 'Plan and execute marketing campaign',
                        status: 'new',
                        priority: 'medium',
                        dueDate: getDefaultDueDate(),
                        assignedToId: '',
                        assignedToName: 'Unassigned',
                        department: 'Marketing',
                        timeEstimate: 24,
                        timeSpent: 0,
                        tags: ['campaign', 'marketing'],
                        subtasks: [
                          { id: crypto.randomUUID(), title: 'Define campaign objectives and KPIs', completed: false },
                          { id: crypto.randomUUID(), title: 'Create content and design assets', completed: false },
                          { id: crypto.randomUUID(), title: 'Set up tracking and analytics', completed: false },
                          { id: crypto.randomUUID(), title: 'Launch campaign across channels', completed: false },
                          { id: crypto.randomUUID(), title: 'Monitor and optimize performance', completed: false },
                        ]
                      });
                      setShowTemplatesDialog(false);
                      showToast('Task created from template', 'success');
                    }}
                    className="w-full px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors text-sm font-medium"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

// ============================================================================
// LIST VIEW WITH BULK ACTIONS
// ============================================================================

const ListView: React.FC<{
  tasks: ExtendedTask[];
  onSelectTask: (t: ExtendedTask) => void;
  selectedTaskIds: Set<string>;
  setSelectedTaskIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  onUpdateStatus: (id: string, status: ExtendedTaskStatus) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
  assignees: { id: string; name: string }[];
  onAssign: (id: string, assigneeId: string, assigneeName: string) => void;
}> = ({ tasks, onSelectTask, selectedTaskIds, setSelectedTaskIds, onUpdateStatus, onUpdatePriority, assignees, onAssign }) => {
  const allSelected = tasks.length > 0 && tasks.every(t => selectedTaskIds.has(t.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedTaskIds(new Set());
    } else {
      setSelectedTaskIds(new Set(tasks.map(t => t.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Task</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Assignee</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Department</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 group">
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(t.id)}
                    onChange={() => toggleOne(t.id)}
                    className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                </td>
                <td className="px-4 py-3 cursor-pointer" onClick={() => onSelectTask(t)}>
                  <div className="font-medium text-gray-900 dark:text-white">{t.title}</div>
                  {t.clientName && <div className="text-xs text-gray-500">{t.clientName}</div>}
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <select
                    value={t.status}
                    onChange={(e) => onUpdateStatus(t.id, e.target.value as ExtendedTaskStatus)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusConfig[t.status].bgColor} ${statusConfig[t.status].color}`}
                  >
                    {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <select
                    value={t.priority}
                    onChange={(e) => onUpdatePriority(t.id, e.target.value as TaskPriority)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${priorityConfig[t.priority].bgColor} ${priorityConfig[t.priority].color}`}
                  >
                    {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <DueDateDisplay dueDate={t.dueDate} status={t.status} />
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <select
                    value={t.assignedToId}
                    onChange={(e) => {
                      const assignee = assignees.find(a => a.id === e.target.value);
                      if (assignee) onAssign(t.id, assignee.id, assignee.name);
                    }}
                    className="text-sm text-gray-600 dark:text-gray-400 bg-transparent border-0 cursor-pointer"
                  >
                    {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs text-white ${departmentConfig[t.department].color}`}>
                    {t.department}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="w-20">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{t.timeSpent}h</span>
                      <span>{t.timeEstimate}h</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                      <div
                        className="h-full bg-rose-500 rounded-full transition-all"
                        style={{ width: `${Math.min((t.timeSpent / t.timeEstimate) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectTask(t)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {tasks.length === 0 && <div className="text-center py-12 text-gray-500">No tasks found</div>}
    </div>
  );
};

// ============================================================================
// KANBAN VIEW WITH DRAG & DROP
// ============================================================================

const KanbanView: React.FC<{
  tasksByStatus: Record<ExtendedTaskStatus, ExtendedTask[]>;
  onSelectTask: (t: ExtendedTask) => void;
  onUpdateStatus: (id: string, status: ExtendedTaskStatus) => void;
  draggedTaskId: string | null;
  setDraggedTaskId: (id: string | null) => void;
}> = ({ tasksByStatus, onSelectTask, onUpdateStatus, draggedTaskId, setDraggedTaskId }) => {
  const [dragOverStatus, setDragOverStatus] = useState<ExtendedTaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: ExtendedTaskStatus) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  const handleDragLeave = () => {
    setDragOverStatus(null);
  };

  const handleDrop = (e: React.DragEvent, status: ExtendedTaskStatus) => {
    e.preventDefault();
    if (draggedTaskId) {
      onUpdateStatus(draggedTaskId, status);
    }
    setDraggedTaskId(null);
    setDragOverStatus(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {(['new', 'assigned', 'in_progress', 'overdue', 'completed'] as ExtendedTaskStatus[]).map(status => (
        <div
          key={status}
          className={`w-72 flex-shrink-0 transition-all ${dragOverStatus === status ? 'scale-[1.02]' : ''}`}
          onDragOver={(e) => handleDragOver(e, status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, status)}
        >
          <div className={`rounded-lg ${statusConfig[status].bgColor} p-3 mb-3`}>
            <div className="flex items-center gap-2">
              {statusConfig[status].icon}
              <span className={`font-semibold ${statusConfig[status].color}`}>{statusConfig[status].label}</span>
              <span className="text-gray-500 text-sm">({tasksByStatus[status]?.length || 0})</span>
            </div>
          </div>
          <div className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${dragOverStatus === status ? 'bg-rose-50 dark:bg-rose-900/20 border-2 border-dashed border-rose-300' : ''}`}>
            {tasksByStatus[status]?.map(t => {
              const completedSubtasks = t.subtasks.filter(s => s.completed).length;
              const subtaskProgress = t.subtasks.length > 0 ? (completedSubtasks / t.subtasks.length) * 100 : 0;
              const isOverdue = new Date(t.dueDate) < new Date() && t.status !== 'completed';

              return (
                <div
                  key={t.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, t.id)}
                  onClick={() => onSelectTask(t)}
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border-2 p-4 cursor-grab hover:shadow-xl transition-all group relative ${
                    draggedTaskId === t.id ? 'opacity-50 rotate-2' : ''
                  } ${
                    t.priority === 'critical' ? 'border-red-300 dark:border-red-700 ring-1 ring-red-200 dark:ring-red-800' :
                    t.priority === 'high' ? 'border-orange-300 dark:border-orange-700' :
                    isOverdue ? 'border-red-200 dark:border-red-800' :
                    'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  {/* Priority Flag - Top Left */}
                  {t.priority === 'critical' && (
                    <div className="absolute -top-2 -left-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                      <Flag className="w-3 h-3 fill-current" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab flex-shrink-0" />
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">{t.title}</h4>
                    </div>
                    {/* Enhanced Priority Badge */}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border-2 flex-shrink-0 ${
                      t.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600' :
                      t.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-600' :
                      t.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600' :
                      'bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'
                    }`}>
                      {t.priority === 'critical' ? '🔥' : t.priority === 'high' ? '⚡' : t.priority === 'medium' ? '●' : '○'}
                    </span>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium">{t.assignedToName}</span>
                  </div>

                  {/* Subtasks Progress */}
                  {t.subtasks.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                        <div className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3" />
                          <span>Subtasks</span>
                        </div>
                        <span className="font-semibold">{completedSubtasks}/{t.subtasks.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            subtaskProgress === 100 ? 'bg-green-500' :
                            subtaskProgress >= 50 ? 'bg-blue-500' :
                            'bg-amber-500'
                          }`}
                          style={{ width: `${subtaskProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Time Tracking */}
                  {(t.timeEstimate > 0 || t.timeSpent > 0) && (
                    <div className="flex items-center gap-3 text-xs mb-3 p-2 bg-slate-50 dark:bg-slate-700/50 rounded">
                      <div className="flex items-center gap-1">
                        <Timer className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">{t.timeSpent}h / {t.timeEstimate}h</span>
                      </div>
                      {t.timeSpent > t.timeEstimate && (
                        <span className="text-red-600 dark:text-red-400 font-medium">Over budget!</span>
                      )}
                    </div>
                  )}

                  {/* Department & Due Date */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded text-white font-medium ${departmentConfig[t.department].color}`}>
                      {t.department}
                    </span>
                    <DueDateDisplay dueDate={t.dueDate} status={t.status} compact />
                  </div>

                  {/* Tags & Metadata */}
                  {(t.tags.length > 0 || t.comments > 0 || t.attachments > 0) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                      {t.comments > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3" />
                          <span>{t.comments}</span>
                        </div>
                      )}
                      {t.attachments > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Paperclip className="w-3 h-3" />
                          <span>{t.attachments}</span>
                        </div>
                      )}
                      {t.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// GANTT TIMELINE VIEW
// ============================================================================

const GanttTimelineView: React.FC<{
  tasks: ExtendedTask[];
  onSelectTask: (t: ExtendedTask) => void;
  onUpdateTask: (id: string, updates: Partial<ExtendedTask>) => void;
}> = ({ tasks, onSelectTask, onUpdateTask }) => {
  const [viewRange, setViewRange] = useState<'week' | 'month'>('month');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate date columns
  const dateColumns = useMemo(() => {
    const cols: Date[] = [];
    const start = new Date(today);
    start.setDate(start.getDate() - 7); // Start 7 days ago
    const days = viewRange === 'week' ? 14 : 35;
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      cols.push(d);
    }
    return cols;
  }, [viewRange]);

  const getTaskPosition = (task: ExtendedTask) => {
    const created = new Date(task.createdAt);
    const due = new Date(task.dueDate);
    const startCol = dateColumns[0];
    const endCol = dateColumns[dateColumns.length - 1];
    const totalDays = (endCol.getTime() - startCol.getTime()) / (1000 * 60 * 60 * 24);

    // Calculate position
    const taskStart = Math.max(created.getTime(), startCol.getTime());
    const taskEnd = Math.min(due.getTime(), endCol.getTime());
    const left = ((taskStart - startCol.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
    const width = ((taskEnd - taskStart) / (1000 * 60 * 60 * 24)) / totalDays * 100;

    return { left: Math.max(0, left), width: Math.max(2, Math.min(100 - left, width)) };
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by status priority, then by due date
    const statusOrder: Record<ExtendedTaskStatus, number> = { overdue: 0, in_progress: 1, assigned: 2, new: 3, completed: 4 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Timeline View</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewRange('week')}
            className={`px-3 py-1.5 rounded text-sm ${viewRange === 'week' ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}
          >
            2 Weeks
          </button>
          <button
            onClick={() => setViewRange('month')}
            className={`px-3 py-1.5 rounded text-sm ${viewRange === 'month' ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-slate-700'}`}
          >
            5 Weeks
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Date header */}
          <div className="flex border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-gray-50 dark:bg-slate-700/50">
            <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200 dark:border-slate-700 font-medium text-sm text-gray-500">
              Task
            </div>
            <div className="flex-1 flex">
              {dateColumns.map((date, idx) => {
                const isToday = date.toDateString() === today.toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[30px] p-1 text-center text-xs border-r border-gray-100 dark:border-slate-600 ${
                      isToday ? 'bg-rose-100 dark:bg-rose-900/30' : isWeekend ? 'bg-gray-100 dark:bg-slate-700/30' : ''
                    }`}
                  >
                    <div className={`font-medium ${isToday ? 'text-rose-600' : 'text-gray-500'}`}>
                      {date.getDate()}
                    </div>
                    <div className="text-gray-400 text-[10px]">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {sortedTasks.map(task => {
              const pos = getTaskPosition(task);
              const progress = task.timeEstimate > 0 ? (task.timeSpent / task.timeEstimate) * 100 : 0;

              return (
                <div key={task.id} className="flex hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <div
                    className="w-64 flex-shrink-0 p-3 border-r border-gray-200 dark:border-slate-700 cursor-pointer"
                    onClick={() => onSelectTask(task)}
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{task.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${statusConfig[task.status].bgColor} ${statusConfig[task.status].color}`}>
                        {statusConfig[task.status].label}
                      </span>
                      <span className="text-xs text-gray-500">{task.assignedToName}</span>
                    </div>
                  </div>
                  <div className="flex-1 relative py-3 px-2">
                    {/* Today marker */}
                    {dateColumns.some(d => d.toDateString() === today.toDateString()) && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                        style={{
                          left: `${((today.getTime() - dateColumns[0].getTime()) / (dateColumns[dateColumns.length - 1].getTime() - dateColumns[0].getTime())) * 100}%`
                        }}
                      />
                    )}
                    {/* Task bar */}
                    <div
                      className={`absolute h-8 rounded-lg cursor-pointer transition-all hover:scale-y-110 ${
                        task.status === 'completed' ? 'bg-green-200 dark:bg-green-900/50' :
                        task.status === 'overdue' ? 'bg-red-200 dark:bg-red-900/50' :
                        'bg-blue-200 dark:bg-blue-900/50'
                      }`}
                      style={{ left: `${pos.left}%`, width: `${pos.width}%`, top: '50%', transform: 'translateY(-50%)' }}
                      onClick={() => onSelectTask(task)}
                    >
                      {/* Progress fill */}
                      <div
                        className={`h-full rounded-lg transition-all ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'overdue' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                      {/* Priority indicator */}
                      <div
                        className={`absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
                          task.priority === 'critical' ? 'bg-red-500' :
                          task.priority === 'high' ? 'bg-orange-500' :
                          task.priority === 'medium' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">No tasks to display</div>
      )}
    </div>
  );
};

// ============================================================================
// DEPARTMENT VIEW
// ============================================================================

const DepartmentView: React.FC<{
  tasksByDepartment: Record<Department, ExtendedTask[]>;
  expandedDepts: Set<Department>;
  setExpandedDepts: React.Dispatch<React.SetStateAction<Set<Department>>>;
  onSelectTask: (t: ExtendedTask) => void;
}> = ({ tasksByDepartment, expandedDepts, setExpandedDepts, onSelectTask }) => {
  const toggleDept = (dept: Department) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(dept)) next.delete(dept);
      else next.add(dept);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {(Object.keys(departmentConfig) as Department[]).map(dept => {
        const tasks = tasksByDepartment[dept] || [];
        const completed = tasks.filter(t => t.status === 'completed').length;
        const overdue = tasks.filter(t => t.status === 'overdue').length;
        const isExpanded = expandedDepts.has(dept);

        return (
          <div key={dept} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => toggleDept(dept)}
              className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${departmentConfig[dept].color} text-white`}>
                  {departmentConfig[dept].icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{dept}</h3>
                  <p className="text-sm text-gray-500">{tasks.length} tasks • {completed} completed • {overdue} overdue</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-full">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${tasks.length > 0 ? (completed / tasks.length) * 100 : 0}%` }} />
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </div>
            </button>
            {isExpanded && (
              <div className="px-4 pb-4 space-y-2">
                {tasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      {statusConfig[t.status].icon}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                        <p className="text-xs text-gray-500">{t.assignedToName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[t.priority].bgColor} ${priorityConfig[t.priority].color}`}>
                        {priorityConfig[t.priority].label}
                      </span>
                      <DueDateDisplay dueDate={t.dueDate} status={t.status} compact />
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-center py-4 text-gray-500">No tasks</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================================================
// CALENDAR VIEW
// ============================================================================

const CalendarViewComponent: React.FC<{ tasks: ExtendedTask[]; onSelectTask: (t: ExtendedTask) => void }> = ({ tasks, onSelectTask }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const today = new Date();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getTasksForDay = (day: number) => {
    return tasks.filter(t => {
      const due = new Date(t.dueDate);
      return due.getDate() === day && due.getMonth() === currentMonth.getMonth() && due.getFullYear() === currentMonth.getFullYear();
    });
  };

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-sm font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={idx} className="h-28" />;
          const dayTasks = getTasksForDay(day);
          const isToday = day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
          return (
            <div
              key={idx}
              className={`h-28 border border-gray-200 dark:border-slate-700 rounded-lg p-1 overflow-hidden hover:border-rose-300 transition-colors ${
                isToday ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-rose-600' : 'text-gray-700 dark:text-gray-300'}`}>{day}</div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(t => (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t)}
                    className={`text-xs truncate px-1 py-0.5 rounded cursor-pointer hover:opacity-80 ${priorityConfig[t.priority].bgColor} ${priorityConfig[t.priority].color}`}
                  >
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && <div className="text-xs text-gray-500 pl-1">+{dayTasks.length - 3} more</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// TASK DETAIL MODAL WITH EDIT MODE
// ============================================================================

const TaskDetailModal: React.FC<{
  task: ExtendedTask;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<ExtendedTask>) => void;
  onDelete: (id: string) => void;
  assignees: { id: string; name: string }[];
}> = ({ task, onClose, onUpdate, onDelete, assignees }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'activity'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleLogTime = () => {
    const hours = prompt('Enter hours to log:');
    if (hours && !isNaN(Number(hours))) {
      onUpdate(task.id, { timeSpent: task.timeSpent + Number(hours) });
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title}
                  onChange={e => setEditData({ ...editData, title: e.target.value })}
                  className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-rose-500 focus:outline-none w-full"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {isEditing ? (
                  <>
                    <select
                      value={editData.status}
                      onChange={e => setEditData({ ...editData, status: e.target.value as ExtendedTaskStatus })}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[editData.status].bgColor} ${statusConfig[editData.status].color}`}
                    >
                      {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select
                      value={editData.priority}
                      onChange={e => setEditData({ ...editData, priority: e.target.value as TaskPriority })}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[editData.priority].bgColor} ${priorityConfig[editData.priority].color}`}
                    >
                      {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select
                      value={editData.department}
                      onChange={e => setEditData({ ...editData, department: e.target.value as Department })}
                      className={`px-2 py-1 rounded text-xs text-white ${departmentConfig[editData.department].color}`}
                    >
                      {Object.keys(departmentConfig).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </>
                ) : (
                  <>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[task.status].bgColor} ${statusConfig[task.status].color}`}>
                      {statusConfig[task.status].label}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[task.priority].bgColor} ${priorityConfig[task.priority].color}`}>
                      {priorityConfig[task.priority].label}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs text-white ${departmentConfig[task.department].color}`}>
                      {task.department}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => { setIsEditing(false); setEditData(task); }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-3 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Save
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <Edit3 className="w-5 h-5 text-gray-500" />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {!isEditing && (
          <div className="px-6 py-3 bg-gray-50 dark:bg-slate-700/30 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-gray-500 font-medium">Quick Actions:</span>
            {task.status !== 'completed' && (
              <button
                onClick={() => onUpdate(task.id, { status: 'completed', completedAt: new Date().toISOString() })}
                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3" /> Mark Complete
              </button>
            )}
            {task.status !== 'in_progress' && task.status !== 'completed' && (
              <button
                onClick={() => onUpdate(task.id, { status: 'in_progress' })}
                className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200 flex items-center gap-1"
              >
                <Play className="w-3 h-3" /> Start Task
              </button>
            )}
            <button
              onClick={handleLogTime}
              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 flex items-center gap-1"
            >
              <Timer className="w-3 h-3" /> Log Time
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="flex">
            {(['details', 'subtasks', 'activity'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium capitalize ${activeTab === tab ? 'text-rose-600 border-b-2 border-rose-500' : 'text-gray-500'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                {isEditing ? (
                  <textarea
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">{task.description || 'No description'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Assigned To</p>
                  {isEditing ? (
                    <select
                      value={editData.assignedToId}
                      onChange={e => {
                        const assignee = assignees.find(a => a.id === e.target.value);
                        if (assignee) {
                          setEditData({ ...editData, assignedToId: assignee.id, assignedToName: assignee.name });
                        }
                      }}
                      className="w-full mt-1 p-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded"
                    >
                      {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{task.assignedToName}</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Due Date</p>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.dueDate.split('T')[0]}
                      onChange={e => setEditData({ ...editData, dueDate: new Date(e.target.value).toISOString() })}
                      className="w-full mt-1 p-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Time Estimate</p>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.timeEstimate}
                      onChange={e => setEditData({ ...editData, timeEstimate: Number(e.target.value) })}
                      className="w-full mt-1 p-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded"
                    />
                  ) : (
                    <p className="font-medium text-gray-900 dark:text-white">{task.timeEstimate} hours</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Time Spent</p>
                  <p className="font-medium text-gray-900 dark:text-white">{task.timeSpent} hours</p>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-full mt-2">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${Math.min((task.timeSpent / task.timeEstimate) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              {task.clientName && (
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-gray-500">Client</p>
                  <p className="font-medium text-gray-900 dark:text-white">{task.clientName}</p>
                </div>
              )}
              {task.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-3">
              {task.subtasks.length > 0 ? task.subtasks.map(st => (
                <div
                  key={st.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={() => {
                    const newSubtasks = task.subtasks.map(s =>
                      s.id === st.id ? { ...s, completed: !s.completed } : s
                    );
                    onUpdate(task.id, { subtasks: newSubtasks });
                  }}
                >
                  {st.completed ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-400" />}
                  <span className={st.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}>{st.title}</span>
                </div>
              )) : <p className="text-center py-8 text-gray-500">No subtasks</p>}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white">Task created</p>
                  <p className="text-xs text-gray-500">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {task.completedAt && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white">Task completed</p>
                    <p className="text-xs text-gray-500">{new Date(task.completedAt).toLocaleString()}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MessageSquare className="w-4 h-4" />
                {task.comments} comments
                <Paperclip className="w-4 h-4 ml-4" />
                {task.attachments} attachments
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Task?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// CREATE TASK DIALOG
// ============================================================================

const CreateTaskDialog: React.FC<{
  onClose: () => void;
  onCreate: (task: Partial<ExtendedTask>) => void;
  assignees: { id: string; name: string }[];
}> = ({ onClose, onCreate, assignees }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    department: 'Consulting' as Department,
    dueDate: getDefaultDueDate(),
    timeEstimate: 4,
    assignedToId: assignees[0]?.id || '1',
    assignedToName: assignees[0]?.name || 'Unassigned',
    tags: '',
    clientName: '',
  });
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setErrors({ title: 'Title is required' });
      return;
    }

    onCreate({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      department: formData.department,
      dueDate: new Date(formData.dueDate).toISOString(),
      timeEstimate: formData.timeEstimate,
      assignedToId: formData.assignedToId,
      assignedToName: formData.assignedToName,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      clientName: formData.clientName || undefined,
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => { setFormData({ ...formData, title: e.target.value }); setErrors({}); }}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 dark:text-white ${
                errors.title ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'
              }`}
              placeholder="Task title"
              autoFocus
            />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              placeholder="Task description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignee</label>
              <select
                value={formData.assignedToId}
                onChange={e => {
                  const assignee = assignees.find(a => a.id === e.target.value);
                  if (assignee) {
                    setFormData({ ...formData, assignedToId: assignee.id, assignedToName: assignee.name });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                {assignees.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                {Object.keys(departmentConfig).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                {Object.entries(priorityConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Estimate (hours)</label>
              <input
                type="number"
                min="0"
                value={formData.timeEstimate}
                onChange={e => setFormData({ ...formData, timeEstimate: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client (optional)</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
                placeholder="Client name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              placeholder="e.g., urgent, client, report"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const MetricCard: React.FC<{ label: string; value: number; color: string; alert?: boolean }> = ({ label, value, color, alert }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border ${alert ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-slate-700'} p-4 transition-all hover:shadow-md`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        <CheckSquare className="w-4 h-4" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

const DueDateDisplay: React.FC<{ dueDate: string; status: ExtendedTaskStatus; compact?: boolean }> = ({ dueDate, status, compact }) => {
  if (status === 'completed') return <span className="text-gray-400 text-xs">Completed</span>;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isOverdue = diff < 0;
  const isDueToday = diff === 0;
  const isDueSoon = diff > 0 && diff <= 2;

  const color = isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-600' : isDueSoon ? 'text-orange-500' : 'text-gray-600';

  if (compact) {
    return <span className={`text-xs font-medium ${color}`}>{isOverdue ? `${Math.abs(diff)}d late` : isDueToday ? 'Today' : `${diff}d`}</span>;
  }

  return (
    <span className={`text-sm font-medium ${color}`}>
      {isOverdue ? `${Math.abs(diff)} days overdue` : isDueToday ? 'Due Today' : new Date(dueDate).toLocaleDateString()}
    </span>
  );
};

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .animate-slide-in {
    animation: slide-in 0.3s ease-out;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#task-view-styles')) {
  style.id = 'task-view-styles';
  document.head.appendChild(style);
}
