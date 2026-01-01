import React, { useState, useMemo } from 'react';
import type { Case, Client, TeamMember } from '../types';
import { CaseStatus, CasePriority } from '../types';
import { ExportButton, type ExportField } from './export/ExportButton';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';
import {
  Briefcase,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  Activity,
  BarChart3,
  Search,
  Filter,
  ChevronRight,
  X,
  ArrowUpRight,
  TrendingUp,
  Timer,
  Bell,
  Flag,
  Tag,
  Paperclip,
  Send,
  User,
  Building,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react';

// ============================================================================
// EXTENDED TYPES
// ============================================================================

type CaseType = 'legal' | 'grant' | 'strategic' | 'compliance' | 'hr' | 'general';
type ExtendedCaseStatus = 'new' | 'assigned' | 'in_progress' | 'escalated' | 'awaiting_client' | 'resolved' | 'closed';

interface CaseActivity {
  id: string;
  type: 'note' | 'status_change' | 'assignment' | 'escalation' | 'attachment' | 'message';
  description: string;
  oldValue?: string;
  newValue?: string;
  createdBy: string;
  createdAt: string;
  mentions?: string[];
}

interface CaseDocument {
  id: string;
  name: string;
  type: string;
  addedBy: string;
  addedAt: string;
}

interface ExtendedCase {
  id: string;
  title: string;
  description: string;
  caseType: CaseType;
  clientId: string;
  clientName: string;
  assignedToId: string;
  assignedToName: string;
  status: ExtendedCaseStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  slaTargetDate: string;
  isEscalated: boolean;
  escalationReason?: string;
  escalationDate?: string;
  tags: string[];
  activities: CaseActivity[];
  documents: CaseDocument[];
  resolutionSummary?: string;
}

interface CaseTemplate {
  id: string;
  name: string;
  caseType: CaseType;
  description: string;
  defaultPriority: 'low' | 'medium' | 'high' | 'critical';
  defaultSlaHours: number;
  suggestedTags: string[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const statusConfig: Record<ExtendedCaseStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  new: { label: 'New', color: 'text-blue-700', bgColor: 'bg-blue-100 dark:bg-blue-900/30', icon: <Briefcase className="w-4 h-4" /> },
  assigned: { label: 'Assigned', color: 'text-purple-700', bgColor: 'bg-purple-100 dark:bg-purple-900/30', icon: <User className="w-4 h-4" /> },
  in_progress: { label: 'In Progress', color: 'text-amber-700', bgColor: 'bg-amber-100 dark:bg-amber-900/30', icon: <Activity className="w-4 h-4" /> },
  escalated: { label: 'Escalated', color: 'text-red-700', bgColor: 'bg-red-100 dark:bg-red-900/30', icon: <AlertTriangle className="w-4 h-4" /> },
  awaiting_client: { label: 'Awaiting Client', color: 'text-cyan-700', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30', icon: <Clock className="w-4 h-4" /> },
  resolved: { label: 'Resolved', color: 'text-green-700', bgColor: 'bg-green-100 dark:bg-green-900/30', icon: <CheckCircle className="w-4 h-4" /> },
  closed: { label: 'Closed', color: 'text-gray-700', bgColor: 'bg-gray-100 dark:bg-gray-700/30', icon: <XCircle className="w-4 h-4" /> },
};

const priorityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-700/30' },
  medium: { label: 'Medium', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  high: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  critical: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
};

const caseTypeConfig: Record<CaseType, { label: string; color: string }> = {
  legal: { label: 'Legal', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  grant: { label: 'Grant', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  strategic: { label: 'Strategic', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  compliance: { label: 'Compliance', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  hr: { label: 'HR', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
  general: { label: 'General', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300' },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

const caseTemplates: CaseTemplate[] = [
  { id: '1', name: 'Legal Issue', caseType: 'legal', description: 'Legal disputes, contracts, and compliance matters', defaultPriority: 'high', defaultSlaHours: 48, suggestedTags: ['legal', 'contract', 'dispute'] },
  { id: '2', name: 'Grant Denial Appeal', caseType: 'grant', description: 'Appeal process for denied grant applications', defaultPriority: 'high', defaultSlaHours: 72, suggestedTags: ['grant', 'appeal', 'funding'] },
  { id: '3', name: 'Strategic Planning', caseType: 'strategic', description: 'Strategic planning and organizational challenges', defaultPriority: 'medium', defaultSlaHours: 120, suggestedTags: ['strategy', 'planning'] },
  { id: '4', name: 'Compliance Review', caseType: 'compliance', description: 'Regulatory compliance and audit matters', defaultPriority: 'high', defaultSlaHours: 48, suggestedTags: ['compliance', 'audit', 'regulatory'] },
  { id: '5', name: 'HR Matter', caseType: 'hr', description: 'Human resources issues and employee relations', defaultPriority: 'medium', defaultSlaHours: 72, suggestedTags: ['hr', 'employee', 'personnel'] },
];

const sampleCases: ExtendedCase[] = [
  {
    id: '1',
    title: 'Federal Grant Application Denial Appeal',
    description: 'Hope Harbor Foundation received denial for their federal education grant. Need to prepare appeal documentation and strategy.',
    caseType: 'grant',
    clientId: '1',
    clientName: 'Hope Harbor Foundation',
    assignedToId: '1',
    assignedToName: 'Sarah Johnson',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-12T14:30:00Z',
    slaTargetDate: '2024-12-15T17:00:00Z',
    isEscalated: false,
    tags: ['grant', 'appeal', 'federal', 'education'],
    activities: [
      { id: '1', type: 'note', description: 'Case created - Federal grant denial received', createdBy: 'Sarah Johnson', createdAt: '2024-12-01T09:00:00Z' },
      { id: '2', type: 'assignment', description: 'Case assigned to Sarah Johnson', createdBy: 'System', createdAt: '2024-12-01T09:05:00Z' },
      { id: '3', type: 'status_change', description: 'Status updated', oldValue: 'new', newValue: 'in_progress', createdBy: 'Sarah Johnson', createdAt: '2024-12-02T10:00:00Z' },
      { id: '4', type: 'note', description: 'Reviewed denial letter. Main issue is budget justification. Scheduling call with client to gather additional documentation.', createdBy: 'Sarah Johnson', createdAt: '2024-12-05T11:30:00Z' },
      { id: '5', type: 'attachment', description: 'Uploaded denial letter and original application', createdBy: 'Sarah Johnson', createdAt: '2024-12-05T11:45:00Z' },
    ],
    documents: [
      { id: '1', name: 'Grant_Denial_Letter.pdf', type: 'pdf', addedBy: 'Sarah Johnson', addedAt: '2024-12-05T11:45:00Z' },
      { id: '2', name: 'Original_Application.pdf', type: 'pdf', addedBy: 'Sarah Johnson', addedAt: '2024-12-05T11:45:00Z' },
    ],
  },
  {
    id: '2',
    title: 'Employment Contract Dispute Resolution',
    description: 'Lowcountry Food Bank has a contract dispute with a former executive director. Need legal review and mediation strategy.',
    caseType: 'legal',
    clientId: '2',
    clientName: 'Lowcountry Food Bank',
    assignedToId: '2',
    assignedToName: 'Michael Chen',
    status: 'escalated',
    priority: 'critical',
    createdAt: '2024-11-15T08:00:00Z',
    updatedAt: '2024-12-10T16:00:00Z',
    slaTargetDate: '2024-12-08T17:00:00Z',
    isEscalated: true,
    escalationReason: 'SLA breach - requires senior legal review',
    escalationDate: '2024-12-09T09:00:00Z',
    tags: ['legal', 'contract', 'dispute', 'executive'],
    activities: [
      { id: '1', type: 'note', description: 'Initial consultation with client board', createdBy: 'Michael Chen', createdAt: '2024-11-15T08:00:00Z' },
      { id: '2', type: 'escalation', description: 'Case escalated due to SLA breach and complexity', createdBy: 'Michael Chen', createdAt: '2024-12-09T09:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '3',
    title: 'Annual Compliance Audit Preparation',
    description: 'Coastal Conservation League needs assistance preparing for their annual state compliance audit.',
    caseType: 'compliance',
    clientId: '5',
    clientName: 'Coastal Conservation League',
    assignedToId: '1',
    assignedToName: 'Sarah Johnson',
    status: 'awaiting_client',
    priority: 'medium',
    createdAt: '2024-12-05T10:00:00Z',
    updatedAt: '2024-12-11T09:00:00Z',
    slaTargetDate: '2024-12-20T17:00:00Z',
    isEscalated: false,
    tags: ['compliance', 'audit', 'state'],
    activities: [
      { id: '1', type: 'note', description: 'Initial audit checklist sent to client', createdBy: 'Sarah Johnson', createdAt: '2024-12-05T10:00:00Z' },
      { id: '2', type: 'status_change', description: 'Waiting for client documents', oldValue: 'in_progress', newValue: 'awaiting_client', createdBy: 'Sarah Johnson', createdAt: '2024-12-11T09:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '4',
    title: 'Strategic Planning Workshop Development',
    description: 'United Way of the Midlands requested a strategic planning workshop for their 2025 initiatives.',
    caseType: 'strategic',
    clientId: '10',
    clientName: 'United Way of the Midlands',
    assignedToId: '3',
    assignedToName: 'Emily Davis',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-12-08T14:00:00Z',
    updatedAt: '2024-12-12T11:00:00Z',
    slaTargetDate: '2024-12-22T17:00:00Z',
    isEscalated: false,
    tags: ['strategy', 'workshop', '2025'],
    activities: [
      { id: '1', type: 'note', description: 'Kickoff meeting scheduled for next week', createdBy: 'Emily Davis', createdAt: '2024-12-08T14:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '5',
    title: 'Board Governance Policy Review',
    description: 'Habitat for Humanity SC needs comprehensive review and update of board governance policies.',
    caseType: 'compliance',
    clientId: '6',
    clientName: 'Habitat for Humanity SC',
    assignedToId: '2',
    assignedToName: 'Michael Chen',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-11-01T09:00:00Z',
    updatedAt: '2024-12-01T15:00:00Z',
    resolvedAt: '2024-12-01T15:00:00Z',
    slaTargetDate: '2024-12-05T17:00:00Z',
    isEscalated: false,
    tags: ['governance', 'policy', 'board'],
    resolutionSummary: 'Completed comprehensive policy review. Updated 12 policies and created 3 new ones. Board approved all changes.',
    activities: [
      { id: '1', type: 'note', description: 'Policy review completed', createdBy: 'Michael Chen', createdAt: '2024-12-01T15:00:00Z' },
      { id: '2', type: 'status_change', description: 'Case resolved', oldValue: 'in_progress', newValue: 'resolved', createdBy: 'Michael Chen', createdAt: '2024-12-01T15:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '6',
    title: 'Employee Misconduct Investigation',
    description: 'SC Youth Advocate Program reported potential employee misconduct. Confidential investigation required.',
    caseType: 'hr',
    clientId: '4',
    clientName: 'SC Youth Advocate Program',
    assignedToId: '1',
    assignedToName: 'Sarah Johnson',
    status: 'in_progress',
    priority: 'critical',
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2024-12-12T16:00:00Z',
    slaTargetDate: '2024-12-14T17:00:00Z',
    isEscalated: false,
    tags: ['hr', 'investigation', 'confidential'],
    activities: [
      { id: '1', type: 'note', description: 'Initial report received - highly confidential', createdBy: 'Sarah Johnson', createdAt: '2024-12-10T08:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '7',
    title: 'Donor Database Migration Consultation',
    description: 'Free Medical Clinic needs guidance on migrating donor database to new CRM system.',
    caseType: 'strategic',
    clientId: '7',
    clientName: 'Free Medical Clinic',
    assignedToId: '3',
    assignedToName: 'Emily Davis',
    status: 'new',
    priority: 'low',
    createdAt: '2024-12-12T10:00:00Z',
    updatedAt: '2024-12-12T10:00:00Z',
    slaTargetDate: '2024-12-26T17:00:00Z',
    isEscalated: false,
    tags: ['database', 'migration', 'crm'],
    activities: [],
    documents: [],
  },
  {
    id: '8',
    title: 'Nonprofit Status Tax Compliance Review',
    description: 'Charleston Symphony Orchestra needs 501(c)(3) compliance review ahead of annual filing.',
    caseType: 'compliance',
    clientId: '9',
    clientName: 'Charleston Symphony Orchestra',
    assignedToId: '2',
    assignedToName: 'Michael Chen',
    status: 'assigned',
    priority: 'medium',
    createdAt: '2024-12-11T11:00:00Z',
    updatedAt: '2024-12-11T14:00:00Z',
    slaTargetDate: '2024-12-18T17:00:00Z',
    isEscalated: false,
    tags: ['tax', '501c3', 'compliance'],
    activities: [
      { id: '1', type: 'assignment', description: 'Case assigned to Michael Chen', createdBy: 'System', createdAt: '2024-12-11T14:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '9',
    title: 'Merger Feasibility Study',
    description: 'Carolina Youth Development Center exploring potential merger with another youth services organization.',
    caseType: 'strategic',
    clientId: '8',
    clientName: 'Carolina Youth Development Center',
    assignedToId: '1',
    assignedToName: 'Sarah Johnson',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
    slaTargetDate: '2024-12-30T17:00:00Z',
    isEscalated: false,
    tags: ['merger', 'feasibility', 'due-diligence'],
    activities: [
      { id: '1', type: 'note', description: 'Initial stakeholder interviews completed', createdBy: 'Sarah Johnson', createdAt: '2024-12-01T10:00:00Z' },
      { id: '2', type: 'note', description: 'Financial analysis in progress', createdBy: 'Sarah Johnson', createdAt: '2024-12-10T14:00:00Z' },
    ],
    documents: [],
  },
  {
    id: '10',
    title: 'Volunteer Liability Waiver Update',
    description: 'Palmetto Animal League needs updated volunteer liability waivers after recent legal changes.',
    caseType: 'legal',
    clientId: '3',
    clientName: 'Palmetto Animal League',
    assignedToId: '2',
    assignedToName: 'Michael Chen',
    status: 'closed',
    priority: 'medium',
    createdAt: '2024-11-10T10:00:00Z',
    updatedAt: '2024-11-28T16:00:00Z',
    resolvedAt: '2024-11-25T14:00:00Z',
    closedAt: '2024-11-28T16:00:00Z',
    slaTargetDate: '2024-11-20T17:00:00Z',
    isEscalated: false,
    tags: ['legal', 'waiver', 'volunteer'],
    resolutionSummary: 'Updated volunteer liability waiver to comply with new state regulations. All existing volunteers re-signed.',
    activities: [
      { id: '1', type: 'status_change', description: 'Case closed after client confirmation', oldValue: 'resolved', newValue: 'closed', createdBy: 'Michael Chen', createdAt: '2024-11-28T16:00:00Z' },
    ],
    documents: [],
  },
];

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface CaseManagementProps {
  cases: Case[];
  clients: Client[];
  teamMembers: TeamMember[];
  onAddCase: () => void;
  onEditCase: (caseItem: Case) => void;
  onDeleteCase: (caseId: string) => void;
  onSelectCase: (caseId: string) => void;
  onUpdateCaseStatus: (caseId: string, newStatus: CaseStatus) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CaseManagement: React.FC<CaseManagementProps> = ({
  cases,
  clients,
  teamMembers,
  onAddCase,
  onEditCase,
  onDeleteCase,
  onSelectCase,
  onUpdateCaseStatus,
}) => {
  const [view, setView] = useState<'dashboard' | 'list' | 'board'>('dashboard');
  const [selectedCase, setSelectedCase] = useState<ExtendedCase | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtendedCaseStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Use sample data for enhanced display
  const enhancedCases = sampleCases;

  // Metrics
  const metrics = useMemo(() => {
    const total = enhancedCases.length;
    const open = enhancedCases.filter(c => !['resolved', 'closed'].includes(c.status)).length;
    const escalated = enhancedCases.filter(c => c.isEscalated).length;
    const overdue = enhancedCases.filter(c => {
      if (['resolved', 'closed'].includes(c.status)) return false;
      return new Date(c.slaTargetDate) < new Date();
    }).length;
    const resolved = enhancedCases.filter(c => c.status === 'resolved' || c.status === 'closed').length;
    const critical = enhancedCases.filter(c => c.priority === 'critical' && !['resolved', 'closed'].includes(c.status)).length;

    const avgResolutionDays = enhancedCases
      .filter(c => c.resolvedAt)
      .reduce((sum, c) => {
        const created = new Date(c.createdAt);
        const resolved = new Date(c.resolvedAt!);
        return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / (enhancedCases.filter(c => c.resolvedAt).length || 1);

    return { total, open, escalated, overdue, resolved, critical, avgResolutionDays };
  }, [enhancedCases]);

  // Filter cases
  const filteredCases = useMemo(() => {
    return enhancedCases.filter(c => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!c.title.toLowerCase().includes(query) &&
            !c.clientName.toLowerCase().includes(query) &&
            !c.description.toLowerCase().includes(query)) {
          return false;
        }
      }
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) return false;
      if (typeFilter !== 'all' && c.caseType !== typeFilter) return false;
      return true;
    });
  }, [enhancedCases, searchQuery, statusFilter, priorityFilter, typeFilter]);

  // Group by status for board view
  const casesByStatus = useMemo(() => {
    const groups: Record<ExtendedCaseStatus, ExtendedCase[]> = {
      new: [], assigned: [], in_progress: [], escalated: [], awaiting_client: [], resolved: [], closed: []
    };
    enhancedCases.forEach(c => {
      if (groups[c.status]) groups[c.status].push(c);
    });
    return groups;
  }, [enhancedCases]);

  if (selectedCase) {
    return (
      <CaseDetailView
        caseItem={selectedCase}
        onBack={() => setSelectedCase(null)}
        onStatusChange={(status) => console.log('Status change:', status)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-rose-500" />
            Case Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage client cases from creation to resolution
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Templates
          </button>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-2"
          >
            <PlusIcon size="sm" />
            New Case
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        {(['dashboard', 'list', 'board'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 font-medium capitalize border-b-2 -mb-px transition ${
              view === v
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard label="Total Cases" value={metrics.total} icon={<Briefcase />} color="bg-gray-500" />
            <MetricCard label="Open Cases" value={metrics.open} icon={<Activity />} color="bg-blue-500" />
            <MetricCard label="Escalated" value={metrics.escalated} icon={<AlertTriangle />} color="bg-red-500" />
            <MetricCard label="Overdue" value={metrics.overdue} icon={<Clock />} color="bg-orange-500" />
            <MetricCard label="Critical" value={metrics.critical} icon={<Flag />} color="bg-rose-500" />
            <MetricCard label="Resolved" value={metrics.resolved} icon={<CheckCircle />} color="bg-green-500" />
          </div>

          {/* Cases Needing Attention */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              Cases Needing Attention
            </h2>
            <div className="space-y-3">
              {enhancedCases
                .filter(c => c.isEscalated || new Date(c.slaTargetDate) < new Date() || c.priority === 'critical')
                .slice(0, 5)
                .map(c => (
                  <CaseRow key={c.id} caseItem={c} onClick={() => setSelectedCase(c)} />
                ))}
              {enhancedCases.filter(c => c.isEscalated || c.priority === 'critical').length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No urgent cases</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Cases
            </h2>
            <div className="space-y-3">
              {enhancedCases.slice(0, 5).map(c => (
                <CaseRow key={c.id} caseItem={c} onClick={() => setSelectedCase(c)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ExtendedCaseStatus | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Priorities</option>
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as CaseType | 'all')}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Types</option>
                {Object.entries(caseTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredCases.length} of {enhancedCases.length} cases
            </p>
          </div>

          {/* Case List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Case</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">SLA</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredCases.map(c => (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {c.isEscalated && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          <span className="font-medium text-gray-900 dark:text-white">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${caseTypeConfig[c.caseType].color}`}>
                          {caseTypeConfig[c.caseType].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.clientName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[c.status].bgColor} ${statusConfig[c.status].color}`}>
                          {statusConfig[c.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[c.priority].bgColor} ${priorityConfig[c.priority].color}`}>
                          {priorityConfig[c.priority].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <SlaIndicator targetDate={c.slaTargetDate} status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{c.assignedToName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Board View */}
      {view === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(['new', 'assigned', 'in_progress', 'escalated', 'awaiting_client', 'resolved'] as ExtendedCaseStatus[]).map(status => (
            <div key={status} className="w-72 flex-shrink-0">
              <div className={`rounded-lg ${statusConfig[status].bgColor} p-3 mb-2`}>
                <div className="flex items-center gap-2">
                  {statusConfig[status].icon}
                  <span className={`font-semibold ${statusConfig[status].color}`}>
                    {statusConfig[status].label}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    ({casesByStatus[status]?.length || 0})
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                {casesByStatus[status]?.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{c.title}</h4>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${priorityConfig[c.priority].bgColor} ${priorityConfig[c.priority].color}`}>
                        {c.priority.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{c.clientName}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${caseTypeConfig[c.caseType].color} px-1.5 py-0.5 rounded`}>
                        {caseTypeConfig[c.caseType].label}
                      </span>
                      <SlaIndicator targetDate={c.slaTargetDate} status={c.status} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <TemplatesModal templates={caseTemplates} onClose={() => setShowTemplates(false)} />
      )}

      {/* Create Case Dialog */}
      {showCreateDialog && (
        <CreateCaseDialog
          templates={caseTemplates}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// CASE DETAIL VIEW
// ============================================================================

interface CaseDetailViewProps {
  caseItem: ExtendedCase;
  onBack: () => void;
  onStatusChange: (status: ExtendedCaseStatus) => void;
}

const CaseDetailView: React.FC<CaseDetailViewProps> = ({ caseItem, onBack, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'documents' | 'communication' | 'team' | 'analytics'>('overview');
  const [newNote, setNewNote] = useState('');

  const daysOpen = Math.floor((new Date().getTime() - new Date(caseItem.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilSla = Math.ceil((new Date(caseItem.slaTargetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseItem.title}</h1>
            {caseItem.isEscalated && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ESCALATED
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[caseItem.status].bgColor} ${statusConfig[caseItem.status].color}`}>
              {statusConfig[caseItem.status].label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[caseItem.priority].bgColor} ${priorityConfig[caseItem.priority].color}`}>
              {priorityConfig[caseItem.priority].label}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${caseTypeConfig[caseItem.caseType].color}`}>
              {caseTypeConfig[caseItem.caseType].label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
            Edit
          </button>
          <select
            value={caseItem.status}
            onChange={(e) => onStatusChange(e.target.value as ExtendedCaseStatus)}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-medium"
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Client" value={caseItem.clientName} icon={<Building className="w-4 h-4" />} />
        <InfoCard label="Assigned To" value={caseItem.assignedToName} icon={<User className="w-4 h-4" />} />
        <InfoCard label="Days Open" value={`${daysOpen} days`} icon={<Clock className="w-4 h-4" />} />
        <InfoCard
          label="SLA"
          value={daysUntilSla > 0 ? `${daysUntilSla} days left` : `${Math.abs(daysUntilSla)} days overdue`}
          icon={<Timer className="w-4 h-4" />}
          alert={daysUntilSla <= 0}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        <div className="flex overflow-x-auto">
          {(['overview', 'timeline', 'documents', 'communication', 'team', 'analytics'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium capitalize whitespace-nowrap transition ${
                activeTab === tab
                  ? 'text-rose-600 border-b-2 border-rose-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{caseItem.description}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {caseItem.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {caseItem.resolutionSummary && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Resolution Summary
                </h3>
                <p className="text-green-700 dark:text-green-400">{caseItem.resolutionSummary}</p>
              </div>
            )}
            {caseItem.isEscalated && caseItem.escalationReason && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Escalation Reason
                </h3>
                <p className="text-red-700 dark:text-red-400">{caseItem.escalationReason}</p>
                <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                  Escalated on {new Date(caseItem.escalationDate!).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            {/* Add Note */}
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              />
              <button className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-4 mt-6">
              {caseItem.activities.map((activity, idx) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'escalation' ? 'bg-red-100 text-red-600' :
                      activity.type === 'status_change' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'assignment' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {activity.type === 'escalation' ? <AlertTriangle className="w-4 h-4" /> :
                       activity.type === 'status_change' ? <Activity className="w-4 h-4" /> :
                       activity.type === 'assignment' ? <User className="w-4 h-4" /> :
                       <MessageSquare className="w-4 h-4" />}
                    </div>
                    {idx < caseItem.activities.length - 1 && (
                      <div className="w-px h-full bg-gray-200 dark:bg-slate-700 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-gray-900 dark:text-white">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{activity.createdBy}</span>
                      <span>•</span>
                      <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Attached Documents</h3>
              <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Add Document
              </button>
            </div>
            {caseItem.documents.length > 0 ? (
              <div className="space-y-2">
                {caseItem.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Added by {doc.addedBy}</p>
                      </div>
                    </div>
                    <button className="text-rose-600 hover:text-rose-700">Download</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No documents attached</p>
            )}
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>Client communication log coming soon</p>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Currently Assigned</h4>
              <p className="text-gray-600 dark:text-gray-400">{caseItem.assignedToName}</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Time to Resolution</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {caseItem.resolvedAt ? `${Math.floor((new Date(caseItem.resolvedAt).getTime() - new Date(caseItem.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days` : 'In Progress'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Activities</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseItem.activities.length}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{caseItem.documents.length}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">SLA Status</p>
              <p className={`text-2xl font-bold ${new Date(caseItem.slaTargetDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                {new Date(caseItem.slaTargetDate) < new Date() ? 'Breached' : 'On Track'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const MetricCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string }> = ({
  label, value, icon, color
}) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  </div>
);

const InfoCard: React.FC<{ label: string; value: string; icon: React.ReactNode; alert?: boolean }> = ({
  label, value, icon, alert
}) => (
  <div className={`p-4 rounded-lg ${alert ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-700/50'}`}>
    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
    <p className={`font-medium ${alert ? 'text-red-700 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{value}</p>
  </div>
);

const CaseRow: React.FC<{ caseItem: ExtendedCase; onClick: () => void }> = ({ caseItem, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition"
  >
    <div className="flex items-center gap-3">
      {caseItem.isEscalated && <AlertTriangle className="w-4 h-4 text-red-500" />}
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{caseItem.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{caseItem.clientName}</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[caseItem.priority].bgColor} ${priorityConfig[caseItem.priority].color}`}>
        {priorityConfig[caseItem.priority].label}
      </span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </div>
  </div>
);

const SlaIndicator: React.FC<{ targetDate: string; status: ExtendedCaseStatus; compact?: boolean }> = ({
  targetDate, status, compact
}) => {
  if (['resolved', 'closed'].includes(status)) {
    return <span className="text-gray-400 text-xs">N/A</span>;
  }

  const daysLeft = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0;
  const isWarning = daysLeft <= 2 && daysLeft >= 0;

  return (
    <span className={`text-xs font-medium ${
      isOverdue ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-green-600'
    }`}>
      {compact ? (
        isOverdue ? `${Math.abs(daysLeft)}d late` : `${daysLeft}d`
      ) : (
        isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`
      )}
    </span>
  );
};

const TemplatesModal: React.FC<{ templates: CaseTemplate[]; onClose: () => void }> = ({ templates, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Case Templates</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
        {templates.map(t => (
          <div key={t.id} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-rose-300 dark:hover:border-rose-600 cursor-pointer transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{t.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.description}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${caseTypeConfig[t.caseType].color}`}>
                {caseTypeConfig[t.caseType].label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span>Priority: {t.defaultPriority}</span>
              <span>SLA: {t.defaultSlaHours}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CreateCaseDialog: React.FC<{ templates: CaseTemplate[]; onClose: () => void }> = ({ templates, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    caseType: 'general' as CaseType,
    priority: 'medium',
    clientName: '',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Case</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <form className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              placeholder="Case title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              placeholder="Case description"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select
                value={formData.caseType}
                onChange={e => setFormData({ ...formData, caseType: e.target.value as CaseType })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                {Object.entries(caseTypeConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              >
                {Object.entries(priorityConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-white"
              placeholder="Client organization"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
              Create Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
