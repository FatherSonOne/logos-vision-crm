import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { generateProjectPlan } from '../services/geminiService';
import type { Client, AiProjectPlan } from '../types';
import { Button } from './ui/Button';

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
}

interface EnhancedTask {
  id: string;
  title: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
}

type ViewMode = 'flowchart' | 'gantt' | 'kanban' | 'list';
type PlannerStep = 'template' | 'customize' | 'clarify' | 'review';

interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  answer?: string | string[];
  placeholder?: string;
}

interface ConversationMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
}

// ============================================================================
// AI TYPING INDICATOR COMPONENT
// ============================================================================

const AITypingIndicator: React.FC<{ message?: string }> = ({ message = "AI is thinking..." }) => (
  <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--cmf-surface-2)' }}>
    <div className="flex gap-1">
      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--cmf-accent)', animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--cmf-accent)', animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--cmf-accent)', animationDelay: '300ms' }} />
    </div>
    <span className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>{message}</span>
  </div>
);

// ============================================================================
// AI RESPONSE TYPEWRITER COMPONENT
// ============================================================================

const TypewriterText: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({
  text,
  speed = 15,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;

    let index = 0;
    setDisplayedText('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="animate-pulse">|</span>}
    </span>
  );
};

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================

const PlanSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 rounded w-2/3" style={{ backgroundColor: 'var(--cmf-surface-3)' }} />
    <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--cmf-surface-3)' }} />
    <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--cmf-surface-3)' }} />
    <div className="space-y-3 mt-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--cmf-surface-2)' }}>
          <div className="h-5 rounded w-1/3 mb-3" style={{ backgroundColor: 'var(--cmf-surface-3)' }} />
          <div className="space-y-2">
            {[1, 2, 3].map(j => (
              <div key={j} className="h-3 rounded w-full" style={{ backgroundColor: 'var(--cmf-surface-3)' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

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
          'Secure funding',
          'Hire program staff',
          'Develop training curriculum',
          'Acquire equipment and supplies',
          'Set up program space'
        ]
      },
      {
        phaseName: 'Pilot Launch',
        estimatedDuration: '4-8 weeks',
        tasks: [
          'Recruit initial participants',
          'Deliver pilot program',
          'Collect feedback',
          'Make adjustments',
          'Document best practices'
        ]
      },
      {
        phaseName: 'Full Implementation',
        estimatedDuration: 'Ongoing',
        tasks: [
          'Scale program delivery',
          'Monitor outcomes',
          'Report to stakeholders',
          'Continuous improvement',
          'Plan for sustainability'
        ]
      }
    ]
  }
];

// ============================================================================
// AI GOAL ANALYSIS HELPER
// ============================================================================

const analyzeGoalForClarification = (goal: string, template: ProjectTemplate | null): ClarifyingQuestion[] => {
  const questions: ClarifyingQuestion[] = [];
  const lowerGoal = goal.toLowerCase();
  const wordCount = goal.trim().split(/\s+/).length;

  // Check if goal is too short or vague
  if (wordCount < 10) {
    questions.push({
      id: 'goal-detail',
      question: "Could you provide more details about your project? What specific outcomes are you hoping to achieve?",
      type: 'text',
      placeholder: "e.g., Increase donor retention by 20%, serve 500 new beneficiaries, etc."
    });
  }

  // Check for timeline mentions
  if (!lowerGoal.match(/\b(week|month|year|quarter|q[1-4]|deadline|by|before|after|during|timeline|schedule)\b/)) {
    questions.push({
      id: 'timeline',
      question: "What's your target timeline for this project?",
      type: 'select',
      options: [
        "Within 1 month",
        "1-3 months",
        "3-6 months",
        "6-12 months",
        "Ongoing / No specific deadline"
      ]
    });
  }

  // Check for budget mentions
  if (!lowerGoal.match(/\b(budget|cost|fund|dollar|\$|money|expense|invest|spend|price)\b/)) {
    questions.push({
      id: 'budget',
      question: "Do you have a budget range in mind for this project?",
      type: 'select',
      options: [
        "Under $1,000",
        "$1,000 - $5,000",
        "$5,000 - $25,000",
        "$25,000 - $100,000",
        "Over $100,000",
        "Budget not yet determined"
      ]
    });
  }

  // Check for target audience mentions (for awareness/event projects)
  if (template && ['awareness', 'fundraising', 'event'].includes(template.category)) {
    if (!lowerGoal.match(/\b(audience|donor|volunteer|community|public|youth|senior|family|corporate|sponsor)\b/)) {
      questions.push({
        id: 'target-audience',
        question: "Who is your primary target audience for this project?",
        type: 'multiselect',
        options: [
          "Individual donors",
          "Corporate sponsors",
          "Community members",
          "Volunteers",
          "Media/Press",
          "Government/Officials",
          "Youth/Students",
          "Families"
        ]
      });
    }
  }

  // Check for success metrics
  if (!lowerGoal.match(/\b(measure|metric|goal|kpi|success|result|outcome|impact|achieve|target|raise|reach)\b/)) {
    questions.push({
      id: 'success-metrics',
      question: "How will you measure success for this project?",
      type: 'text',
      placeholder: "e.g., Number of attendees, funds raised, new volunteers recruited, etc."
    });
  }

  // Check for team/resource mentions
  if (!lowerGoal.match(/\b(team|staff|volunteer|member|resource|capacity|partner|contractor|vendor)\b/)) {
    questions.push({
      id: 'team-size',
      question: "How many team members will be involved in this project?",
      type: 'select',
      options: [
        "Just me (solo)",
        "2-3 people",
        "4-6 people",
        "7-10 people",
        "More than 10 people",
        "Not sure yet"
      ]
    });
  }

  // Only return up to 3 questions to avoid overwhelming the user
  return questions.slice(0, 3);
};

// ============================================================================
// ICONS
// ============================================================================

// Plan Generation Icon - Workflow/Blueprint style
const PlanIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
    <path d="M9 8h6" />
  </svg>
);

// AI Brain Icon for AI-powered features
const AIBrainIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 014 4c0 1.5-.8 2.8-2 3.5v1.5h2a4 4 0 014 4c0 2.2-1.8 4-4 4h-1v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1H8a4 4 0 01-4-4 4 4 0 014-4h2V9.5A4 4 0 018 6a4 4 0 014-4z" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
    <circle cx="15" cy="9" r="1" fill="currentColor" />
    <circle cx="9" cy="15" r="1" fill="currentColor" />
    <circle cx="15" cy="15" r="1" fill="currentColor" />
  </svg>
);

const ChevronDownIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const CheckIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ============================================================================
// VIEW MODE COMPONENTS
// ============================================================================

// Beautiful Flowchart View
const FlowchartView: React.FC<{
  phases: EnhancedPhase[];
  onToggleTask: (phaseId: string, taskId: string) => void;
  onTogglePhase: (phaseId: string) => void;
}> = ({ phases, onToggleTask, onTogglePhase }) => {
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

  return (
    <div className="relative py-4">
      {/* Connector Line */}
      <div
        className="absolute left-8 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: 'var(--cmf-border)' }}
      />

      <div className="space-y-6">
        {phases.map((phase, index) => {
          const completedTasks = phase.tasks.filter(t => t.completed).length;
          const progress = phase.tasks.length > 0 ? (completedTasks / phase.tasks.length) * 100 : 0;

          return (
            <div key={phase.id} className="relative flex items-start gap-4">
              {/* Phase Node */}
              <div
                className="relative z-10 flex items-center justify-center w-16 h-16 rounded-2xl border-2 shadow-lg cursor-pointer transition-all hover:scale-105"
                style={{
                  backgroundColor: getStatusBg(phase.status),
                  borderColor: getStatusColor(phase.status),
                }}
                onClick={() => onTogglePhase(phase.id)}
              >
                <span className="text-2xl font-bold" style={{ color: getStatusColor(phase.status) }}>
                  {index + 1}
                </span>
              </div>

              {/* Phase Content */}
              <div className="flex-1 min-w-0">
                <div
                  className="p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--cmf-surface)',
                    borderColor: 'var(--cmf-border)',
                  }}
                  onClick={() => onTogglePhase(phase.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold" style={{ color: 'var(--cmf-text)' }}>
                      {phase.phaseName}
                    </h4>
                    <div className="flex items-center gap-2">
                      {phase.estimatedDuration && (
                        <span className="text-xs px-2 py-1 rounded-full" style={{
                          backgroundColor: 'var(--cmf-surface-2)',
                          color: 'var(--cmf-text-muted)'
                        }}>
                          {phase.estimatedDuration}
                        </span>
                      )}
                      <span
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: getStatusBg(phase.status),
                          color: getStatusColor(phase.status)
                        }}
                      >
                        {completedTasks}/{phase.tasks.length}
                      </span>
                      {phase.collapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--cmf-surface-3)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: getStatusColor(phase.status)
                      }}
                    />
                  </div>

                  {/* Tasks */}
                  {!phase.collapsed && (
                    <div className="space-y-2 mt-3">
                      {phase.tasks.map(task => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-opacity-50"
                          style={{ backgroundColor: task.completed ? 'var(--cmf-success-muted)' : 'transparent' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(phase.id, task.id);
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors"
                            style={{
                              borderColor: task.completed ? 'var(--cmf-success)' : 'var(--cmf-border)',
                              backgroundColor: task.completed ? 'var(--cmf-success)' : 'transparent'
                            }}
                          >
                            {task.completed && <CheckIcon className="h-3 w-3 text-white" />}
                          </div>
                          <span
                            className="text-sm flex-1"
                            style={{
                              color: task.completed ? 'var(--cmf-text-muted)' : 'var(--cmf-text)',
                              textDecoration: task.completed ? 'line-through' : 'none'
                            }}
                          >
                            {task.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Kanban View
const KanbanView: React.FC<{
  phases: EnhancedPhase[];
  onToggleTask: (phaseId: string, taskId: string) => void;
}> = ({ phases, onToggleTask }) => {
  const columns = [
    { id: 'pending', label: 'To Do', color: 'var(--cmf-text-muted)' },
    { id: 'in_progress', label: 'In Progress', color: 'var(--cmf-accent)' },
    { id: 'completed', label: 'Done', color: 'var(--cmf-success)' },
  ];

  const getTasksByStatus = (status: string) => {
    const tasks: { task: EnhancedTask; phase: EnhancedPhase }[] = [];
    phases.forEach(phase => {
      phase.tasks.forEach(task => {
        const taskStatus = task.completed ? 'completed' : 'pending';
        if (taskStatus === status) {
          tasks.push({ task, phase });
        }
      });
    });
    return tasks;
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map(column => {
        const tasks = getTasksByStatus(column.id);
        return (
          <div
            key={column.id}
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--cmf-surface-2)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h4 className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                {column.label}
              </h4>
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--cmf-surface-3)', color: 'var(--cmf-text-muted)' }}
              >
                {tasks.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {tasks.map(({ task, phase }) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--cmf-surface)',
                    borderColor: 'var(--cmf-border)'
                  }}
                  onClick={() => onToggleTask(phase.id, task.id)}
                >
                  <p className="text-sm" style={{ color: 'var(--cmf-text)' }}>
                    {task.title}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--cmf-text-muted)' }}>
                    {phase.phaseName}
                  </p>
                </div>
              ))}
              {tasks.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: 'var(--cmf-text-muted)' }}>
                  No tasks
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Gantt View (Simplified)
const GanttView: React.FC<{
  phases: EnhancedPhase[];
}> = ({ phases }) => {
  const colors = [
    'var(--cmf-accent)',
    'var(--cmf-success)',
    'var(--cmf-warning)',
    'var(--cmf-error)',
    '#8B5CF6',
    '#EC4899',
  ];

  return (
    <div className="space-y-3">
      {phases.map((phase, index) => {
        const completedTasks = phase.tasks.filter(t => t.completed).length;
        const progress = phase.tasks.length > 0 ? (completedTasks / phase.tasks.length) * 100 : 0;
        const color = colors[index % colors.length];

        return (
          <div key={phase.id} className="flex items-center gap-4">
            <div className="w-40 flex-shrink-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--cmf-text)' }}>
                {phase.phaseName}
              </p>
              <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
                {phase.estimatedDuration || 'TBD'}
              </p>
            </div>
            <div className="flex-1">
              <div
                className="h-8 rounded-lg relative overflow-hidden"
                style={{ backgroundColor: 'var(--cmf-surface-2)' }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: color,
                    opacity: 0.8
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium" style={{ color: 'var(--cmf-text)' }}>
                    {completedTasks}/{phase.tasks.length} tasks
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

// List View
const ListView: React.FC<{
  phases: EnhancedPhase[];
  onToggleTask: (phaseId: string, taskId: string) => void;
  onTogglePhase: (phaseId: string) => void;
}> = ({ phases, onToggleTask, onTogglePhase }) => {
  return (
    <div className="space-y-4">
      {phases.map(phase => (
        <div
          key={phase.id}
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: 'var(--cmf-border)' }}
        >
          <div
            className="p-4 cursor-pointer flex items-center justify-between"
            style={{ backgroundColor: 'var(--cmf-surface-2)' }}
            onClick={() => onTogglePhase(phase.id)}
          >
            <div className="flex items-center gap-3">
              {phase.collapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
              <h4 className="font-medium" style={{ color: 'var(--cmf-text)' }}>
                {phase.phaseName}
              </h4>
            </div>
            <span className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks
            </span>
          </div>

          {!phase.collapsed && (
            <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--cmf-surface)' }}>
              {phase.tasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
                  style={{ backgroundColor: task.completed ? 'var(--cmf-success-muted)' : 'transparent' }}
                  onClick={() => onToggleTask(phase.id, task.id)}
                >
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center"
                    style={{
                      borderColor: task.completed ? 'var(--cmf-success)' : 'var(--cmf-border)',
                      backgroundColor: task.completed ? 'var(--cmf-success)' : 'transparent'
                    }}
                  >
                    {task.completed && <CheckIcon className="h-3 w-3 text-white" />}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: task.completed ? 'var(--cmf-text-muted)' : 'var(--cmf-text)',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// View Mode Tabs
const ViewModeTabs: React.FC<{
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
}> = ({ currentView, onChangeView }) => {
  const views: { id: ViewMode; label: string; icon: string }[] = [
    { id: 'flowchart', label: 'Flowchart', icon: '📊' },
    { id: 'kanban', label: 'Kanban', icon: '📋' },
    { id: 'gantt', label: 'Timeline', icon: '📅' },
    { id: 'list', label: 'List', icon: '📝' },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--cmf-surface-2)' }}>
      {views.map(view => (
        <button
          key={view.id}
          onClick={() => onChangeView(view.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all"
          style={{
            backgroundColor: currentView === view.id ? 'var(--cmf-accent)' : 'transparent',
            color: currentView === view.id ? 'white' : 'var(--cmf-text-muted)',
          }}
        >
          <span>{view.icon}</span>
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  );
};

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
  const [plan, setPlan] = useState<AiProjectPlan | null>(null);
  const [enhancedPhases, setEnhancedPhases] = useState<EnhancedPhase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('flowchart');
  const [aiMessage, setAiMessage] = useState<string>('');
  const [showTypewriter, setShowTypewriter] = useState(false);

  // AI Clarifying Questions State
  const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnalyzingGoal, setIsAnalyzingGoal] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Answer input state for clarify step
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('template');
      setSelectedTemplate(null);
      setGoal('');
      setPlan(null);
      setEnhancedPhases([]);
      setIsLoading(false);
      setAiMessage('');
      setShowTypewriter(false);
      setSelectedClientId(clients[0]?.id || '');
      // Reset clarifying questions state
      setClarifyingQuestions([]);
      setConversation([]);
      setCurrentQuestionIndex(0);
      setIsAnalyzingGoal(false);
      setTextAnswer('');
      setSelectedOptions([]);
    }
  }, [isOpen, clients]);

  // Auto-scroll conversation
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Convert plan phases to enhanced phases
  const convertToEnhancedPhases = useCallback((planPhases: AiProjectPlan['phases']): EnhancedPhase[] => {
    return planPhases.map((phase, index) => ({
      id: `phase-${index}`,
      phaseName: phase.phaseName,
      tasks: phase.tasks.map((task, taskIndex) => ({
        id: `task-${index}-${taskIndex}`,
        title: task,
        completed: false,
      })),
      status: index === 0 ? 'in_progress' : 'pending',
      collapsed: false,
      estimatedDuration: selectedTemplate?.phases[index]?.estimatedDuration,
    }));
  }, [selectedTemplate]);

  // Handle template selection
  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setGoal(template.defaultGoal);
    setStep('customize');
  };

  // Check if goal needs clarification and proceed accordingly
  const handleAnalyzeAndProceed = async () => {
    if (!goal.trim() || !selectedClientId) {
      return;
    }

    setIsAnalyzingGoal(true);
    setAiMessage('Analyzing your project goal...');

    // Simulate AI analysis delay
    await new Promise(r => setTimeout(r, 1000));

    const questions = analyzeGoalForClarification(goal, selectedTemplate);

    if (questions.length > 0) {
      // Initialize conversation with AI greeting
      const greeting: ConversationMessage = {
        id: 'greeting',
        role: 'ai',
        content: `I'd like to understand your project better to create the most effective plan. Let me ask you a few quick questions.`,
        timestamp: new Date()
      };

      setClarifyingQuestions(questions);
      setConversation([greeting]);
      setCurrentQuestionIndex(0);
      setIsAnalyzingGoal(false);
      setAiMessage('');
      setStep('clarify');

      // Add first question after a short delay
      setTimeout(() => {
        const firstQuestion: ConversationMessage = {
          id: `q-${questions[0].id}`,
          role: 'ai',
          content: questions[0].question,
          timestamp: new Date()
        };
        setConversation(prev => [...prev, firstQuestion]);
      }, 500);
    } else {
      // Goal is detailed enough, proceed directly to generation
      setIsAnalyzingGoal(false);
      setAiMessage('');
      handleGenerate();
    }
  };

  // Handle answering a clarifying question
  const handleAnswerQuestion = async (answer: string | string[]) => {
    const currentQuestion = clarifyingQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Add user's answer to conversation
    const answerText = Array.isArray(answer) ? answer.join(', ') : answer;
    const userMessage: ConversationMessage = {
      id: `a-${currentQuestion.id}`,
      role: 'user',
      content: answerText,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    // Update the question with the answer
    setClarifyingQuestions(prev =>
      prev.map(q => q.id === currentQuestion.id ? { ...q, answer } : q)
    );

    // Move to next question or generate plan
    if (currentQuestionIndex < clarifyingQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // Add next question after a delay
      setTimeout(() => {
        const nextQuestion: ConversationMessage = {
          id: `q-${clarifyingQuestions[nextIndex].id}`,
          role: 'ai',
          content: clarifyingQuestions[nextIndex].question,
          timestamp: new Date()
        };
        setConversation(prev => [...prev, nextQuestion]);
      }, 600);
    } else {
      // All questions answered, generate the plan
      setTimeout(() => {
        const thankYou: ConversationMessage = {
          id: 'thank-you',
          role: 'ai',
          content: "Perfect! I have all the information I need. Let me generate your project plan...",
          timestamp: new Date()
        };
        setConversation(prev => [...prev, thankYou]);

        // Build enhanced goal with answers
        setTimeout(() => {
          handleGenerateWithContext();
        }, 1000);
      }, 500);
    }
  };

  // Skip clarifying questions and generate directly
  const handleSkipClarification = () => {
    const skipMessage: ConversationMessage = {
      id: 'skip',
      role: 'ai',
      content: "No problem! I'll generate a plan based on what you've provided.",
      timestamp: new Date()
    };
    setConversation(prev => [...prev, skipMessage]);

    setTimeout(() => {
      handleGenerate();
    }, 500);
  };

  // Generate plan with additional context from answers
  const handleGenerateWithContext = async () => {
    // Build enhanced goal with clarifying question answers
    let enhancedGoal = goal;
    clarifyingQuestions.forEach(q => {
      if (q.answer) {
        const answerText = Array.isArray(q.answer) ? q.answer.join(', ') : q.answer;
        switch (q.id) {
          case 'timeline':
            enhancedGoal += ` Timeline: ${answerText}.`;
            break;
          case 'budget':
            enhancedGoal += ` Budget: ${answerText}.`;
            break;
          case 'target-audience':
            enhancedGoal += ` Target audience: ${answerText}.`;
            break;
          case 'success-metrics':
            enhancedGoal += ` Success metrics: ${answerText}.`;
            break;
          case 'team-size':
            enhancedGoal += ` Team size: ${answerText}.`;
            break;
          case 'goal-detail':
            enhancedGoal += ` Additional details: ${answerText}.`;
            break;
        }
      }
    });

    // Update goal with enhanced version
    setGoal(enhancedGoal);

    // Generate plan with enhanced context
    setIsLoading(true);
    setPlan(null);
    setEnhancedPhases([]);
    setAiMessage('Analyzing your project requirements...');

    try {
      await new Promise(r => setTimeout(r, 800));
      setAiMessage('Designing project phases and tasks...');

      await new Promise(r => setTimeout(r, 600));
      setAiMessage('Optimizing workflow structure...');

      const generatedPlan = await generateProjectPlan(enhancedGoal);

      if (generatedPlan && !generatedPlan.error) {
        setPlan(generatedPlan);
        setEnhancedPhases(convertToEnhancedPhases(generatedPlan.phases));
        setShowTypewriter(true);
        setStep('review');
      } else if (selectedTemplate) {
        const templatePlan: AiProjectPlan = {
          projectName: enhancedGoal.substring(0, 50),
          description: enhancedGoal,
          phases: selectedTemplate.phases,
        };
        setPlan(templatePlan);
        setEnhancedPhases(convertToEnhancedPhases(templatePlan.phases));
        setShowTypewriter(true);
        setStep('review');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      if (selectedTemplate) {
        const templatePlan: AiProjectPlan = {
          projectName: enhancedGoal.substring(0, 50),
          description: enhancedGoal,
          phases: selectedTemplate.phases,
        };
        setPlan(templatePlan);
        setEnhancedPhases(convertToEnhancedPhases(templatePlan.phases));
        setStep('review');
      }
    } finally {
      setIsLoading(false);
      setAiMessage('');
    }
  };

  // Handle generate plan (original, called when no clarification needed)
  const handleGenerate = async () => {
    if (!goal.trim() || !selectedClientId) {
      return;
    }

    setIsLoading(true);
    setPlan(null);
    setEnhancedPhases([]);
    setAiMessage('Analyzing your project requirements...');

    try {
      // Simulate AI thinking phases
      await new Promise(r => setTimeout(r, 800));
      setAiMessage('Designing project phases and tasks...');

      await new Promise(r => setTimeout(r, 600));
      setAiMessage('Optimizing workflow structure...');

      const generatedPlan = await generateProjectPlan(goal);

      if (generatedPlan && !generatedPlan.error) {
        setPlan(generatedPlan);
        setEnhancedPhases(convertToEnhancedPhases(generatedPlan.phases));
        setShowTypewriter(true);
        setStep('review');
      } else {
        // If AI generation fails, use template phases if available
        if (selectedTemplate) {
          const templatePlan: AiProjectPlan = {
            projectName: goal.substring(0, 50),
            description: goal,
            phases: selectedTemplate.phases,
          };
          setPlan(templatePlan);
          setEnhancedPhases(convertToEnhancedPhases(templatePlan.phases));
          setShowTypewriter(true);
          setStep('review');
        }
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      // Fallback to template
      if (selectedTemplate) {
        const templatePlan: AiProjectPlan = {
          projectName: goal.substring(0, 50),
          description: goal,
          phases: selectedTemplate.phases,
        };
        setPlan(templatePlan);
        setEnhancedPhases(convertToEnhancedPhases(templatePlan.phases));
        setStep('review');
      }
    } finally {
      setIsLoading(false);
      setAiMessage('');
    }
  };

  // Handle task toggle
  const handleToggleTask = (phaseId: string, taskId: string) => {
    setEnhancedPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        const updatedTasks = phase.tasks.map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const completedCount = updatedTasks.filter(t => t.completed).length;
        const newStatus = completedCount === updatedTasks.length ? 'completed' :
                         completedCount > 0 ? 'in_progress' : 'pending';
        return { ...phase, tasks: updatedTasks, status: newStatus };
      }
      return phase;
    }));
  };

  // Handle phase collapse toggle
  const handleTogglePhase = (phaseId: string) => {
    setEnhancedPhases(prev => prev.map(phase =>
      phase.id === phaseId ? { ...phase, collapsed: !phase.collapsed } : phase
    ));
  };

  // Handle create project
  const handleCreateProject = () => {
    if (plan && selectedClientId) {
      onSave(plan, selectedClientId);
    }
  };

  // Handle close
  const handleClose = () => {
    onClose();
  };

  // Styles
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--cmf-surface-2)',
    color: 'var(--cmf-text)',
    border: '1px solid var(--cmf-border)',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--cmf-text-secondary)',
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'template', label: 'Template' },
      { id: 'customize', label: 'Customize' },
      { id: 'clarify', label: 'Clarify' },
      { id: 'review', label: 'Review' },
    ];

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                style={{
                  backgroundColor: step === s.id || steps.findIndex(x => x.id === step) > index
                    ? 'var(--cmf-accent)'
                    : 'var(--cmf-surface-2)',
                  color: step === s.id || steps.findIndex(x => x.id === step) > index
                    ? 'white'
                    : 'var(--cmf-text-muted)',
                }}
              >
                {index + 1}
              </div>
              <span
                className="text-sm hidden sm:inline"
                style={{
                  color: step === s.id ? 'var(--cmf-text)' : 'var(--cmf-text-muted)'
                }}
              >
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="w-8 h-0.5"
                style={{ backgroundColor: 'var(--cmf-border)' }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render template selection
  const renderTemplateStep = () => (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
        Choose a template to get started, or create a custom project plan.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PROJECT_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="p-4 rounded-xl border text-left transition-all hover:shadow-lg hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--cmf-surface)',
              borderColor: 'var(--cmf-border)',
            }}
          >
            <span className="text-3xl block mb-2">{template.icon}</span>
            <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--cmf-text)' }}>
              {template.name}
            </h4>
            <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
              {template.description}
            </p>
          </button>
        ))}
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => setStep('customize')}
          className="text-sm font-medium underline"
          style={{ color: 'var(--cmf-accent)' }}
        >
          Or start with a blank project
        </button>
      </div>
    </div>
  );

  // Render customize step
  const renderCustomizeStep = () => (
    <div className="space-y-4">
      {selectedTemplate && (
        <div
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ backgroundColor: 'var(--cmf-surface-2)' }}
        >
          <span className="text-2xl">{selectedTemplate.icon}</span>
          <div>
            <h4 className="font-medium text-sm" style={{ color: 'var(--cmf-text)' }}>
              {selectedTemplate.name}
            </h4>
            <p className="text-xs" style={{ color: 'var(--cmf-text-muted)' }}>
              {selectedTemplate.suggestedBudget} • {selectedTemplate.suggestedTeamSize} team members
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setGoal('');
              setStep('template');
            }}
            className="ml-auto text-xs px-2 py-1 rounded"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            Change
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
          Project Goal *
        </label>
        <textarea
          rows={3}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Describe your project goal in detail..."
          className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
          style={inputStyle}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
          For Client *
        </label>
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full h-10 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
          style={inputStyle}
        >
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>

      {isLoading || isAnalyzingGoal ? (
        <div className="space-y-4">
          <AITypingIndicator message={aiMessage || 'Analyzing your project goal...'} />
          {isLoading && <PlanSkeleton />}
        </div>
      ) : (
        <Button
          onClick={handleAnalyzeAndProceed}
          disabled={!goal.trim() || !selectedClientId}
          variant="primary"
          className="w-full flex items-center justify-center gap-2"
        >
          <AIBrainIcon />
          Generate AI Plan
        </Button>
      )}
    </div>
  );

  // Render clarify step (AI asking questions)
  const renderClarifyStep = () => {
    const currentQuestion = clarifyingQuestions[currentQuestionIndex];

    const handleSubmitTextAnswer = () => {
      if (textAnswer.trim()) {
        handleAnswerQuestion(textAnswer.trim());
        setTextAnswer('');
      }
    };

    const handleSelectOption = (option: string) => {
      if (currentQuestion?.type === 'multiselect') {
        setSelectedOptions(prev =>
          prev.includes(option)
            ? prev.filter(o => o !== option)
            : [...prev, option]
        );
      } else {
        handleAnswerQuestion(option);
      }
    };

    const handleSubmitMultiSelect = () => {
      if (selectedOptions.length > 0) {
        handleAnswerQuestion(selectedOptions);
        setSelectedOptions([]);
      }
    };

    return (
      <div className="space-y-4">
        {/* Conversation Thread */}
        <div
          className="max-h-[300px] overflow-y-auto space-y-3 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--cmf-surface-2)' }}
        >
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}
                style={{
                  backgroundColor: msg.role === 'user'
                    ? 'var(--cmf-accent)'
                    : 'var(--cmf-surface)',
                  color: msg.role === 'user'
                    ? 'white'
                    : 'var(--cmf-text)',
                }}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1">
                    <AIBrainIcon />
                    <span className="text-xs font-medium" style={{ color: 'var(--cmf-text-muted)' }}>
                      AI Assistant
                    </span>
                  </div>
                )}
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Show loading indicator when generating plan */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="p-3 rounded-lg rounded-bl-none"
                style={{ backgroundColor: 'var(--cmf-surface)' }}
              >
                <AITypingIndicator message={aiMessage} />
              </div>
            </div>
          )}

          <div ref={conversationEndRef} />
        </div>

        {/* Answer Input Area */}
        {currentQuestion && !isLoading && conversation.length > 1 && (
          <div className="space-y-3">
            {currentQuestion.type === 'text' && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder={currentQuestion.placeholder || "Type your answer..."}
                  className="flex-1 h-10 px-3 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--cmf-accent)]"
                  style={inputStyle}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitTextAnswer();
                    }
                  }}
                />
                <Button
                  onClick={handleSubmitTextAnswer}
                  disabled={!textAnswer.trim()}
                  variant="primary"
                >
                  Send
                </Button>
              </div>
            )}

            {currentQuestion.type === 'select' && currentQuestion.options && (
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="px-3 py-2 text-sm rounded-lg border transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: 'var(--cmf-surface)',
                      borderColor: 'var(--cmf-border)',
                      color: 'var(--cmf-text)',
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'multiselect' && currentQuestion.options && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map(option => (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      className="px-3 py-2 text-sm rounded-lg border transition-all"
                      style={{
                        backgroundColor: selectedOptions.includes(option)
                          ? 'var(--cmf-accent-muted)'
                          : 'var(--cmf-surface)',
                        borderColor: selectedOptions.includes(option)
                          ? 'var(--cmf-accent)'
                          : 'var(--cmf-border)',
                        color: selectedOptions.includes(option)
                          ? 'var(--cmf-accent)'
                          : 'var(--cmf-text)',
                      }}
                    >
                      {selectedOptions.includes(option) && '✓ '}
                      {option}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleSubmitMultiSelect}
                  disabled={selectedOptions.length === 0}
                  variant="primary"
                  className="w-full"
                >
                  Confirm Selection ({selectedOptions.length} selected)
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Skip option */}
        {!isLoading && (
          <div className="text-center">
            <button
              onClick={handleSkipClarification}
              className="text-sm underline"
              style={{ color: 'var(--cmf-text-muted)' }}
            >
              Skip questions and generate plan now
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render review step
  const renderReviewStep = () => (
    <div className="space-y-4">
      {plan && (
        <>
          <div
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--cmf-surface-2)' }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--cmf-text)' }}>
              {showTypewriter ? (
                <TypewriterText text={plan.projectName} speed={30} />
              ) : (
                plan.projectName
              )}
            </h3>
            <p className="text-sm" style={{ color: 'var(--cmf-text-muted)' }}>
              {showTypewriter ? (
                <TypewriterText text={plan.description} speed={10} onComplete={() => setShowTypewriter(false)} />
              ) : (
                plan.description
              )}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <ViewModeTabs currentView={viewMode} onChangeView={setViewMode} />
          </div>

          <div className="max-h-[400px] overflow-y-auto pr-2">
            {viewMode === 'flowchart' && (
              <FlowchartView
                phases={enhancedPhases}
                onToggleTask={handleToggleTask}
                onTogglePhase={handleTogglePhase}
              />
            )}
            {viewMode === 'kanban' && (
              <KanbanView
                phases={enhancedPhases}
                onToggleTask={handleToggleTask}
              />
            )}
            {viewMode === 'gantt' && (
              <GanttView phases={enhancedPhases} />
            )}
            {viewMode === 'list' && (
              <ListView
                phases={enhancedPhases}
                onToggleTask={handleToggleTask}
                onTogglePhase={handleTogglePhase}
              />
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="AI Project Planner"
      size="lg"
    >
      <div className="space-y-4">
        {renderStepIndicator()}

        {step === 'template' && renderTemplateStep()}
        {step === 'customize' && renderCustomizeStep()}
        {step === 'clarify' && renderClarifyStep()}
        {step === 'review' && renderReviewStep()}

        <div
          className="flex justify-between gap-3 pt-4"
          style={{ borderTop: '1px solid var(--cmf-divider)' }}
        >
          {step !== 'template' && step !== 'clarify' && (
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'customize') setStep('template');
                else if (step === 'review') setStep('customize');
              }}
            >
              Back
            </Button>
          )}
          {step === 'clarify' && (
            <Button
              variant="outline"
              onClick={() => {
                setClarifyingQuestions([]);
                setConversation([]);
                setCurrentQuestionIndex(0);
                setStep('customize');
              }}
            >
              Back
            </Button>
          )}

          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            {step === 'review' && plan && (
              <Button variant="primary" onClick={handleCreateProject}>
                Create Project
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
