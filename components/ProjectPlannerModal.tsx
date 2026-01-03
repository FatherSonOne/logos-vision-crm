import React, { useState, useCallback, useMemo } from 'react';
import { Modal } from './Modal';
import { generateProjectPlan } from '../src/services/geminiService';
import type { Client, AiProjectPlan } from '../types';
import { SparklesIcon } from './icons';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ProjectPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: AiProjectPlan, clientId: string) => void;
  clients: Client[];
}

interface ProjectTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: 'fundraising' | 'awareness' | 'volunteer' | 'grant' | 'event' | 'operations';
  defaultGoal: string;
  phases: {
    phaseName: string;
    tasks: string[];
    estimatedDuration?: string;
  }[];
  suggestedBudget?: string;
  suggestedTeamSize?: number;
}

interface EnhancedPhase {
  id: string;
  phaseName: string;
  tasks: EnhancedTask[];
  status: 'pending' | 'in_progress' | 'completed';
  collapsed: boolean;
  estimatedDuration?: string;
  assignedTo?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
  notes?: string;
}

interface EnhancedTask {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

type ViewMode = 'input' | 'flowchart' | 'gantt' | 'kanban' | 'list';
type PlannerStep = 'template' | 'customize' | 'review';

// ============================================================================
// PROJECT TEMPLATES
// ============================================================================

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'fundraising-event',
    name: 'Fundraising Event',
    icon: '🎉',
    description: '5K runs, galas, auctions, and charity dinners',
    category: 'fundraising',
    defaultGoal: 'Organize a fundraising event to raise funds for our cause',
    suggestedBudget: '$5,000 - $50,000',
    suggestedTeamSize: 5,
    phases: [
      {
        phaseName: 'Planning & Strategy',
        estimatedDuration: '2-4 weeks',
        tasks: [
          'Define fundraising goal and target amount',
          'Select event type and theme',
          'Identify venue options and dates',
          'Create preliminary budget',
          'Assemble planning committee'
        ]
      },
      {
        phaseName: 'Logistics & Vendors',
        estimatedDuration: '3-6 weeks',
        tasks: [
          'Book venue and confirm date',
          'Hire caterer and vendors',
          'Arrange entertainment or speakers',
          'Set up registration system',
          'Order supplies and materials'
        ]
      },
      {
        phaseName: 'Marketing & Outreach',
        estimatedDuration: '4-8 weeks',
        tasks: [
          'Create event branding and materials',
          'Launch social media campaign',
          'Send invitations and press releases',
          'Recruit sponsors and donors',
          'Follow up with potential attendees'
        ]
      },
      {
        phaseName: 'Execution',
        estimatedDuration: '1 week',
        tasks: [
          'Final venue walkthrough',
          'Coordinate volunteers',
          'Set up day-of logistics',
          'Manage event operations',
          'Collect donations and pledges'
        ]
      },
      {
        phaseName: 'Follow-up',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Send thank you notes to donors',
          'Process all donations',
          'Compile event report and metrics',
          'Gather feedback from attendees',
          'Document lessons learned'
        ]
      }
    ]
  },
  {
    id: 'awareness-campaign',
    name: 'Awareness Campaign',
    icon: '📢',
    description: 'Social media, email series, and public outreach',
    category: 'awareness',
    defaultGoal: 'Launch an awareness campaign to educate the public about our mission',
    suggestedBudget: '$1,000 - $10,000',
    suggestedTeamSize: 3,
    phases: [
      {
        phaseName: 'Research & Planning',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Define campaign objectives and KPIs',
          'Research target audience demographics',
          'Analyze competitor campaigns',
          'Create messaging framework',
          'Select communication channels'
        ]
      },
      {
        phaseName: 'Content Creation',
        estimatedDuration: '2-3 weeks',
        tasks: [
          'Develop campaign visuals and branding',
          'Write social media content calendar',
          'Create email newsletter series',
          'Produce video or multimedia content',
          'Design infographics and shareable assets'
        ]
      },
      {
        phaseName: 'Launch & Execution',
        estimatedDuration: '4-8 weeks',
        tasks: [
          'Schedule and publish content',
          'Monitor engagement and respond',
          'Run paid advertising campaigns',
          'Coordinate with influencers/partners',
          'Track metrics and adjust strategy'
        ]
      },
      {
        phaseName: 'Analysis & Reporting',
        estimatedDuration: '1 week',
        tasks: [
          'Compile campaign analytics',
          'Calculate ROI and impact',
          'Document successful tactics',
          'Prepare stakeholder report',
          'Plan follow-up initiatives'
        ]
      }
    ]
  },
  {
    id: 'volunteer-drive',
    name: 'Volunteer Drive',
    icon: '🤝',
    description: 'Recruitment, training, and volunteer management',
    category: 'volunteer',
    defaultGoal: 'Recruit and train new volunteers for our programs',
    suggestedBudget: '$500 - $2,000',
    suggestedTeamSize: 2,
    phases: [
      {
        phaseName: 'Needs Assessment',
        estimatedDuration: '1 week',
        tasks: [
          'Identify volunteer needs by program',
          'Define roles and responsibilities',
          'Set recruitment targets',
          'Create volunteer position descriptions',
          'Establish screening criteria'
        ]
      },
      {
        phaseName: 'Recruitment',
        estimatedDuration: '2-4 weeks',
        tasks: [
          'Post volunteer opportunities',
          'Reach out to community partners',
          'Host information sessions',
          'Process applications',
          'Conduct interviews and background checks'
        ]
      },
      {
        phaseName: 'Training & Onboarding',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Develop training materials',
          'Schedule orientation sessions',
          'Assign mentors to new volunteers',
          'Distribute volunteer handbook',
          'Set up communication channels'
        ]
      },
      {
        phaseName: 'Engagement & Retention',
        estimatedDuration: 'Ongoing',
        tasks: [
          'Create volunteer schedule',
          'Plan recognition activities',
          'Gather regular feedback',
          'Track volunteer hours',
          'Celebrate milestones and achievements'
        ]
      }
    ]
  },
  {
    id: 'grant-application',
    name: 'Grant Application',
    icon: '📑',
    description: 'Research, writing, and submission process',
    category: 'grant',
    defaultGoal: 'Apply for grant funding to support our programs',
    suggestedBudget: '$0 - $500',
    suggestedTeamSize: 2,
    phases: [
      {
        phaseName: 'Research & Identification',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Identify potential grant opportunities',
          'Review eligibility requirements',
          'Gather past grant history',
          'Assess organizational fit',
          'Create grant prospect list'
        ]
      },
      {
        phaseName: 'Preparation',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Collect required documents',
          'Update organizational budget',
          'Gather program data and outcomes',
          'Prepare letters of support',
          'Review submission requirements'
        ]
      },
      {
        phaseName: 'Writing',
        estimatedDuration: '2-4 weeks',
        tasks: [
          'Draft narrative sections',
          'Develop program budget',
          'Write executive summary',
          'Create logic model or theory of change',
          'Compile appendices'
        ]
      },
      {
        phaseName: 'Review & Submit',
        estimatedDuration: '1 week',
        tasks: [
          'Internal review and editing',
          'Get leadership approval',
          'Final formatting and assembly',
          'Submit before deadline',
          'Confirm receipt'
        ]
      },
      {
        phaseName: 'Follow-up',
        estimatedDuration: '1-4 weeks',
        tasks: [
          'Track application status',
          'Respond to funder questions',
          'Prepare for site visit if required',
          'Document lessons learned',
          'Plan for reporting requirements'
        ]
      }
    ]
  },
  {
    id: 'annual-report',
    name: 'Annual Report',
    icon: '📊',
    description: 'Data collection, design, and distribution',
    category: 'operations',
    defaultGoal: 'Create and publish our annual impact report',
    suggestedBudget: '$2,000 - $10,000',
    suggestedTeamSize: 3,
    phases: [
      {
        phaseName: 'Data Collection',
        estimatedDuration: '2-3 weeks',
        tasks: [
          'Gather program metrics and outcomes',
          'Compile financial statements',
          'Collect impact stories and testimonials',
          'Request photos from programs',
          'Verify all statistics'
        ]
      },
      {
        phaseName: 'Content Development',
        estimatedDuration: '2-3 weeks',
        tasks: [
          'Write executive letter',
          'Draft program narratives',
          'Create infographics',
          'Select featured stories',
          'Compile donor acknowledgments'
        ]
      },
      {
        phaseName: 'Design & Production',
        estimatedDuration: '2-4 weeks',
        tasks: [
          'Design layout and branding',
          'Review and approve proofs',
          'Make final edits',
          'Prepare print and digital versions',
          'Order printed copies'
        ]
      },
      {
        phaseName: 'Distribution',
        estimatedDuration: '1-2 weeks',
        tasks: [
          'Update website with report',
          'Send to donors and stakeholders',
          'Share on social media',
          'Present to board of directors',
          'Archive for future reference'
        ]
      }
    ]
  },
  {
    id: 'community-program',
    name: 'Community Program',
    icon: '🌍',
    description: 'New program launch and community engagement',
    category: 'event',
    defaultGoal: 'Launch a new community program to serve our target population',
    suggestedBudget: '$10,000 - $100,000',
    suggestedTeamSize: 4,
    phases: [
      {
        phaseName: 'Needs Assessment',
        estimatedDuration: '2-4 weeks',
        tasks: [
          'Conduct community research',
          'Survey target population',
          'Identify service gaps',
          'Engage community stakeholders',
          'Document findings'
        ]
      },
      {
        phaseName: 'Program Design',
        estimatedDuration: '2-4 weeks',
        tasks: [
          'Define program model',
          'Create logic model',
          'Develop evaluation framework',
          'Establish partnerships',
          'Design intake process'
        ]
      },
      {
        phaseName: 'Resource Development',
        estimatedDuration: '4-8 weeks',
        tasks: [
          'Secure funding sources',
          'Hire program staff',
          'Acquire materials and equipment',
          'Set up program space',
          'Create program materials'
        ]
      },
      {
        phaseName: 'Pilot & Launch',
        estimatedDuration: '4-8 weeks',
        tasks: [
          'Recruit initial participants',
          'Train staff and volunteers',
          'Run pilot program',
          'Gather feedback',
          'Official program launch'
        ]
      },
      {
        phaseName: 'Evaluation & Scale',
        estimatedDuration: 'Ongoing',
        tasks: [
          'Track program metrics',
          'Conduct participant surveys',
          'Report to funders',
          'Document best practices',
          'Plan for expansion'
        ]
      }
    ]
  }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const convertToEnhancedPlan = (plan: AiProjectPlan): EnhancedPhase[] => {
  return plan.phases.map((phase, idx) => ({
    id: generateId(),
    phaseName: phase.phaseName,
    tasks: phase.tasks.map(task => ({
      id: generateId(),
      title: task,
      completed: false,
    })),
    status: idx === 0 ? 'in_progress' : 'pending',
    collapsed: false,
  }));
};

const convertTemplateToEnhancedPlan = (template: ProjectTemplate): EnhancedPhase[] => {
  return template.phases.map((phase, idx) => ({
    id: generateId(),
    phaseName: phase.phaseName,
    tasks: phase.tasks.map(task => ({
      id: generateId(),
      title: task,
      completed: false,
    })),
    status: idx === 0 ? 'in_progress' : 'pending',
    collapsed: false,
    estimatedDuration: phase.estimatedDuration,
  }));
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Template Selection Card
const TemplateCard: React.FC<{
  template: ProjectTemplate;
  isSelected: boolean;
  onClick: () => void;
}> = ({ template, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className="p-4 rounded-xl text-left transition-all hover:scale-[1.02] w-full"
    style={{
      backgroundColor: isSelected ? 'var(--cmf-accent-muted)' : 'var(--cmf-surface-2)',
      border: `2px solid ${isSelected ? 'var(--cmf-accent)' : 'var(--cmf-border)'}`,
    }}
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl">{template.icon}</span>
      <div className="flex-1 min-w-0">
        <h4
          className="font-semibold text-sm"
          style={{ color: isSelected ? 'var(--cmf-accent)' : 'var(--cmf-text)' }}
        >
          {template.name}
        </h4>
        <p
          className="text-xs mt-0.5 line-clamp-2"
          style={{ color: 'var(--cmf-text-muted)' }}
        >
          {template.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className="text-[10px] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--cmf-surface-3)',
              color: 'var(--cmf-text-secondary)',
            }}
          >
            {template.phases.length} phases
          </span>
          {template.suggestedTeamSize && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--cmf-surface-3)',
                color: 'var(--cmf-text-secondary)',
              }}
            >
              {template.suggestedTeamSize}+ team
            </span>
          )}
        </div>
      </div>
    </div>
  </button>
);

// View Mode Tabs
const ViewModeTabs: React.FC<{
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}> = ({ activeView, onViewChange }) => {
  const views: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'flowchart', label: 'Flowchart', icon: '🔀' },
    { id: 'gantt', label: 'Timeline', icon: '📅' },
    { id: 'kanban', label: 'Kanban', icon: '📋' },
    { id: 'list', label: 'List', icon: '📝' },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--cmf-surface-2)' }}>
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
          style={{
            backgroundColor: activeView === view.id ? 'var(--cmf-accent)' : 'transparent',
            color: activeView === view.id ? 'white' : 'var(--cmf-text-muted)',
          }}
        >
          <span>{view.icon}</span>
          <span>{view.label}</span>
        </button>
      ))}
    </div>
  );
};

// Flowchart View - Beautiful visual representation
const FlowchartView: React.FC<{
  phases: EnhancedPhase[];
  onPhaseClick: (phaseId: string) => void;
  onTaskToggle: (phaseId: string, taskId: string) => void;
}> = ({ phases, onPhaseClick, onTaskToggle }) => {
  const getStatusColor = (status: EnhancedPhase['status']) => {
    switch (status) {
      case 'completed': return 'var(--cmf-success)';
      case 'in_progress': return 'var(--cmf-accent)';
      default: return 'var(--cmf-text-muted)';
    }
  };

  const getStatusBg = (status: EnhancedPhase['status']) => {
    switch (status) {
      case 'completed': return 'var(--cmf-success-muted)';
      case 'in_progress': return 'var(--cmf-accent-muted)';
      default: return 'var(--cmf-surface-2)';
    }
  };

  const completedTasks = (phase: EnhancedPhase) =>
    phase.tasks.filter(t => t.completed).length;

  return (
    <div className="relative py-4">
      {/* Connection Line */}
      <div
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: 'var(--cmf-border)' }}
      />

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase, index) => (
          <div key={phase.id} className="relative flex gap-4">
            {/* Node */}
            <div
              className="relative z-10 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg transition-transform hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: getStatusBg(phase.status),
                border: `2px solid ${getStatusColor(phase.status)}`,
              }}
              onClick={() => onPhaseClick(phase.id)}
            >
              <span className="text-2xl font-bold" style={{ color: getStatusColor(phase.status) }}>
                {index + 1}
              </span>
              {phase.status === 'completed' && (
                <div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--cmf-success)' }}
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>

            {/* Phase Content */}
            <div
              className="flex-1 p-4 rounded-xl transition-all"
              style={{
                backgroundColor: 'var(--cmf-surface-2)',
                border: `1px solid ${phase.status === 'in_progress' ? 'var(--cmf-accent)' : 'var(--cmf-border)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4
                  className="font-semibold"
                  style={{ color: 'var(--cmf-text)' }}
                >
                  {phase.phaseName}
                </h4>
                <div className="flex items-center gap-2">
                  {phase.estimatedDuration && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--cmf-surface-3)',
                        color: 'var(--cmf-text-secondary)',
                      }}
                    >
                      {phase.estimatedDuration}
                    </span>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: getStatusBg(phase.status),
                      color: getStatusColor(phase.status),
                    }}
                  >
                    {completedTasks(phase)}/{phase.tasks.length} tasks
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                className="h-1.5 rounded-full mb-3 overflow-hidden"
                style={{ backgroundColor: 'var(--cmf-surface-3)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedTasks(phase) / phase.tasks.length) * 100}%`,
                    backgroundColor: getStatusColor(phase.status),
                  }}
                />
              </div>

              {/* Tasks */}
              {!phase.collapsed && (
                <div className="space-y-1.5">
                  {phase.tasks.map(task => (
                    <label
                      key={task.id}
                      className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                      style={{ backgroundColor: 'var(--cmf-surface)' }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onTaskToggle(phase.id, task.id)}
                        className="w-4 h-4 rounded accent-[var(--cmf-accent)]"
                      />
                      <span
                        className={`text-sm flex-1 ${task.completed ? 'line-through' : ''}`}
                        style={{ color: task.completed ? 'var(--cmf-text-muted)' : 'var(--cmf-text)' }}
                      >
                        {task.title}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Arrow to next phase */}
            {index < phases.length - 1 && (
              <div
                className="absolute left-[30px] -bottom-2 w-0.5 h-4"
                style={{ backgroundColor: 'var(--cmf-border)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Kanban View
const KanbanView: React.FC<{
  phases: EnhancedPhase[];
  onTaskToggle: (phaseId: string, taskId: string) => void;
}> = ({ phases, onTaskToggle }) => {
  const columns = [
    { id: 'pending', label: 'To Do', color: 'var(--cmf-text-muted)' },
    { id: 'in_progress', label: 'In Progress', color: 'var(--cmf-accent)' },
    { id: 'completed', label: 'Done', color: 'var(--cmf-success)' },
  ];

  const getTasksByStatus = (status: string) => {
    const tasks: { task: EnhancedTask; phase: EnhancedPhase }[] = [];
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const taskStatus = task.completed ? 'completed' :
          phase.status === 'in_progress' ? 'in_progress' : 'pending';
        if (taskStatus === status) {
          tasks.push({ task, phase });
        }
      });
    });
    return tasks;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map(column => (
        <div key={column.id} className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h4
              className="text-sm font-semibold"
              style={{ color: 'var(--cmf-text)' }}
            >
              {column.label}
            </h4>
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--cmf-surface-3)',
                color: 'var(--cmf-text-muted)',
              }}
            >
              {getTasksByStatus(column.id).length}
            </span>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {getTasksByStatus(column.id).map(({ task, phase }) => (
              <div
                key={task.id}
                className="p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--cmf-surface-2)',
                  border: '1px solid var(--cmf-border)',
                }}
                onClick={() => onTaskToggle(phase.id, task.id)}
              >
                <p
                  className="text-sm"
                  style={{ color: 'var(--cmf-text)' }}
                >
                  {task.title}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  {phase.phaseName}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Timeline/Gantt View (Simplified)
const GanttView: React.FC<{
  phases: EnhancedPhase[];
}> = ({ phases }) => {
  const getStatusColor = (status: EnhancedPhase['status']) => {
    switch (status) {
      case 'completed': return 'var(--cmf-success)';
      case 'in_progress': return 'var(--cmf-accent)';
      default: return 'var(--cmf-text-muted)';
    }
  };

  return (
    <div className="space-y-3">
      {phases.map((phase, index) => {
        const progress = phase.tasks.filter(t => t.completed).length / phase.tasks.length;
        return (
          <div key={phase.id} className="flex items-center gap-4">
            <div className="w-32 flex-shrink-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--cmf-text)' }}
              >
                {phase.phaseName}
              </p>
              <p
                className="text-xs"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                {phase.estimatedDuration || `Phase ${index + 1}`}
              </p>
            </div>
            <div className="flex-1">
              <div
                className="h-8 rounded-lg overflow-hidden relative"
                style={{ backgroundColor: 'var(--cmf-surface-2)' }}
              >
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center px-2"
                  style={{
                    width: `${Math.max(progress * 100, 10)}%`,
                    backgroundColor: getStatusColor(phase.status),
                  }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round(progress * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// List View (Simple)
const ListView: React.FC<{
  phases: EnhancedPhase[];
  onTaskToggle: (phaseId: string, taskId: string) => void;
}> = ({ phases, onTaskToggle }) => (
  <div className="space-y-4">
    {phases.map(phase => (
      <div key={phase.id}>
        <h4
          className="font-semibold mb-2"
          style={{ color: 'var(--cmf-text)' }}
        >
          {phase.phaseName}
        </h4>
        <div className="space-y-1 pl-4">
          {phase.tasks.map(task => (
            <label
              key={task.id}
              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:opacity-80"
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onTaskToggle(phase.id, task.id)}
                className="w-4 h-4 rounded"
              />
              <span
                className={`text-sm ${task.completed ? 'line-through' : ''}`}
                style={{ color: task.completed ? 'var(--cmf-text-muted)' : 'var(--cmf-text)' }}
              >
                {task.title}
              </span>
            </label>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ProjectPlannerModal: React.FC<ProjectPlannerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients
}) => {
  // State
  const [step, setStep] = useState<PlannerStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [goal, setGoal] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<AiProjectPlan | null>(null);
  const [enhancedPhases, setEnhancedPhases] = useState<EnhancedPhase[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('flowchart');
  const [useCustomGoal, setUseCustomGoal] = useState(false);

  // Styles
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--cmf-surface-2)',
    color: 'var(--cmf-text)',
    border: '1px solid var(--cmf-border)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--cmf-text-secondary)',
  };

  // Handlers
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setGoal(template.defaultGoal);
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    setUseCustomGoal(true);
    setGoal('');
    setStep('customize');
  };

  const handleContinueWithTemplate = () => {
    if (selectedTemplate) {
      const phases = convertTemplateToEnhancedPlan(selectedTemplate);
      setEnhancedPhases(phases);
      setPlan({
        projectName: selectedTemplate.name,
        description: goal || selectedTemplate.defaultGoal,
        phases: selectedTemplate.phases,
      });
      setStep('review');
    }
  };

  const handleGenerateAIPlan = async () => {
    if (!goal.trim()) {
      alert('Please describe your project goal.');
      return;
    }
    setIsLoading(true);
    try {
      const generatedPlan = await generateProjectPlan(goal);
      if (generatedPlan && !generatedPlan.error) {
        setPlan(generatedPlan);
        setEnhancedPhases(convertToEnhancedPlan(generatedPlan));
        setStep('review');
      } else {
        alert(generatedPlan?.error || 'Failed to generate plan');
      }
    } catch (error) {
      alert('Failed to generate plan. Please try again.');
    }
    setIsLoading(false);
  };

  const handleTaskToggle = useCallback((phaseId: string, taskId: string) => {
    setEnhancedPhases(prev => prev.map(phase => {
      if (phase.id !== phaseId) return phase;
      const updatedTasks = phase.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      const allCompleted = updatedTasks.every(t => t.completed);
      return {
        ...phase,
        tasks: updatedTasks,
        status: allCompleted ? 'completed' : phase.status === 'completed' ? 'in_progress' : phase.status,
      };
    }));
  }, []);

  const handlePhaseClick = useCallback((phaseId: string) => {
    setEnhancedPhases(prev => prev.map(phase =>
      phase.id === phaseId ? { ...phase, collapsed: !phase.collapsed } : phase
    ));
  }, []);

  const handleCreateProject = () => {
    if (plan && selectedClientId) {
      // Convert enhanced phases back to plan format
      const finalPlan: AiProjectPlan = {
        ...plan,
        phases: enhancedPhases.map(p => ({
          phaseName: p.phaseName,
          tasks: p.tasks.map(t => t.title),
        })),
      };
      onSave(finalPlan, selectedClientId);
    }
  };

  const handleClose = () => {
    setStep('template');
    setSelectedTemplate(null);
    setGoal('');
    setPlan(null);
    setEnhancedPhases([]);
    setIsLoading(false);
    setUseCustomGoal(false);
    onClose();
  };

  const handleBack = () => {
    if (step === 'review') {
      setStep(selectedTemplate ? 'template' : 'customize');
    } else if (step === 'customize') {
      setStep('template');
      setUseCustomGoal(false);
    }
  };

  // Progress stats
  const totalTasks = enhancedPhases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedTasks = enhancedPhases.reduce((acc, p) => acc + p.tasks.filter(t => t.completed).length, 0);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI Project Planner" size="xl">
      <div className="min-h-[500px]">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['template', 'customize', 'review'].map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step === s ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: ['template', 'customize', 'review'].indexOf(step) >= i
                    ? 'var(--cmf-accent)'
                    : 'var(--cmf-surface-2)',
                  color: ['template', 'customize', 'review'].indexOf(step) >= i
                    ? 'white'
                    : 'var(--cmf-text-muted)',
                  ringColor: 'var(--cmf-accent)',
                }}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className="flex-1 h-0.5 rounded"
                  style={{
                    backgroundColor: ['template', 'customize', 'review'].indexOf(step) > i
                      ? 'var(--cmf-accent)'
                      : 'var(--cmf-border)',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Template Selection */}
        {step === 'template' && (
          <div className="space-y-6">
            <div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--cmf-text)' }}
              >
                Choose a Template
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Start with a pre-built template or create a custom project from scratch
              </p>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-2">
              {PROJECT_TEMPLATES.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onClick={() => handleSelectTemplate(template)}
                />
              ))}
            </div>

            {/* Custom Option */}
            <button
              onClick={handleStartFromScratch}
              className="w-full p-4 rounded-xl text-center transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: 'var(--cmf-surface-2)',
                border: '2px dashed var(--cmf-border)',
              }}
            >
              <span className="text-2xl">✨</span>
              <p
                className="font-semibold text-sm mt-1"
                style={{ color: 'var(--cmf-text)' }}
              >
                Start from Scratch with AI
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Describe your goal and let AI generate a custom plan
              </p>
            </button>

            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                For Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none"
                style={inputStyle}
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--cmf-divider)' }}>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--cmf-text)',
                  border: '1px solid var(--cmf-border)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleContinueWithTemplate}
                disabled={!selectedTemplate}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--cmf-accent)',
                  color: 'white',
                }}
              >
                Continue with Template
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Customize Goal (for AI generation) */}
        {step === 'customize' && (
          <div className="space-y-6">
            <div>
              <h3
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--cmf-text)' }}
              >
                Describe Your Project
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--cmf-text-muted)' }}
              >
                Provide details about your project goal and AI will generate a comprehensive plan
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                Project Goal *
              </label>
              <textarea
                rows={4}
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Organize a 5K charity run for the Animal Rescue Shelter to raise $10,000. We need to handle registration, sponsors, volunteers, and post-event follow-up."
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)] resize-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                For Client
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none"
                style={inputStyle}
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-4" style={{ borderTop: '1px solid var(--cmf-divider)' }}>
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--cmf-text)',
                  border: '1px solid var(--cmf-border)',
                }}
              >
                Back
              </button>
              <button
                onClick={handleGenerateAIPlan}
                disabled={isLoading || !goal.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--cmf-accent)',
                  color: 'white',
                }}
              >
                <SparklesIcon />
                {isLoading ? 'Generating...' : 'Generate Plan with AI'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Edit Plan */}
        {step === 'review' && plan && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--cmf-text)' }}
                >
                  {plan.projectName}
                </h3>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  {plan.description}
                </p>
              </div>
              <div
                className="text-right flex-shrink-0 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--cmf-surface-2)' }}
              >
                <div
                  className="text-2xl font-bold"
                  style={{ color: 'var(--cmf-accent)' }}
                >
                  {completedTasks}/{totalTasks}
                </div>
                <div
                  className="text-xs"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  tasks ready
                </div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <ViewModeTabs activeView={viewMode} onViewChange={setViewMode} />

            {/* Plan Views */}
            <div
              className="rounded-xl p-4 max-h-[350px] overflow-y-auto"
              style={{
                backgroundColor: 'var(--cmf-surface)',
                border: '1px solid var(--cmf-border)',
              }}
            >
              {viewMode === 'flowchart' && (
                <FlowchartView
                  phases={enhancedPhases}
                  onPhaseClick={handlePhaseClick}
                  onTaskToggle={handleTaskToggle}
                />
              )}
              {viewMode === 'kanban' && (
                <KanbanView
                  phases={enhancedPhases}
                  onTaskToggle={handleTaskToggle}
                />
              )}
              {viewMode === 'gantt' && (
                <GanttView phases={enhancedPhases} />
              )}
              {viewMode === 'list' && (
                <ListView
                  phases={enhancedPhases}
                  onTaskToggle={handleTaskToggle}
                />
              )}
            </div>

            {/* Workflow Automation Hint */}
            <div
              className="p-3 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: 'var(--cmf-accent-muted)',
                border: '1px solid var(--cmf-accent)',
              }}
            >
              <span className="text-xl">🔗</span>
              <div className="flex-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: 'var(--cmf-accent)' }}
                >
                  Workflow Automation Ready
                </p>
                <p
                  className="text-xs"
                  style={{ color: 'var(--cmf-text-muted)' }}
                >
                  This project can be connected to Entomate for automated task triggers and notifications
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between gap-3 pt-4" style={{ borderTop: '1px solid var(--cmf-divider)' }}>
              <button
                onClick={handleBack}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--cmf-text)',
                  border: '1px solid var(--cmf-border)',
                }}
              >
                Back
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: 'var(--cmf-accent)',
                  color: 'white',
                }}
              >
                Create Project
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
