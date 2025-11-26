// ProjectTemplates.tsx - Pre-defined Project Templates for Non-Profits
import React, { useState } from 'react';
import { ProjectStatus, TaskStatus, type Project, type Task } from '../../types';
import { TemplateIcon, PlusIcon, CloseIcon, CheckCircleIcon } from '../icons';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'fundraising' | 'community' | 'operations' | 'advocacy' | 'custom';
  defaultDuration: number; // days
  phases: {
    name: string;
    tasks: string[];
  }[];
  tags: string[];
}

// Pre-built templates for common non-profit projects
export const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'template-fundraising-campaign',
    name: 'Fundraising Campaign',
    description: 'Complete fundraising campaign from planning to donor follow-up',
    category: 'fundraising',
    defaultDuration: 90,
    phases: [
      {
        name: 'Planning',
        tasks: [
          'Define campaign goals and target amount',
          'Identify target donor segments',
          'Create campaign messaging and materials',
          'Set up donation tracking system'
        ]
      },
      {
        name: 'Launch',
        tasks: [
          'Launch campaign website/landing page',
          'Send initial outreach emails',
          'Begin social media promotion',
          'Host kick-off event'
        ]
      },
      {
        name: 'Execution',
        tasks: [
          'Weekly donor outreach calls',
          'Send campaign updates to supporters',
          'Process and track incoming donations',
          'Coordinate matching gift opportunities'
        ]
      },
      {
        name: 'Wrap-Up',
        tasks: [
          'Send thank you letters to all donors',
          'Compile campaign results report',
          'Update donor database with new contacts',
          'Plan follow-up stewardship activities'
        ]
      }
    ],
    tags: ['fundraising', 'donors', 'campaign']
  },
  {
    id: 'template-grant-application',
    name: 'Grant Application',
    description: 'End-to-end grant application process from research to submission',
    category: 'fundraising',
    defaultDuration: 60,
    phases: [
      {
        name: 'Research',
        tasks: [
          'Research potential grant opportunities',
          'Review grant guidelines and requirements',
          'Assess organizational eligibility',
          'Contact program officer (if appropriate)'
        ]
      },
      {
        name: 'Preparation',
        tasks: [
          'Gather required organizational documents',
          'Draft project narrative and budget',
          'Collect letters of support',
          'Prepare financial statements'
        ]
      },
      {
        name: 'Writing',
        tasks: [
          'Write executive summary',
          'Complete application questions',
          'Finalize project budget',
          'Create logic model/theory of change'
        ]
      },
      {
        name: 'Review & Submit',
        tasks: [
          'Internal review and editing',
          'Board approval (if required)',
          'Final formatting and assembly',
          'Submit application before deadline'
        ]
      }
    ],
    tags: ['grants', 'funding', 'application']
  },
  {
    id: 'template-volunteer-program',
    name: 'Volunteer Program Launch',
    description: 'Launch a new volunteer program from recruitment to engagement',
    category: 'community',
    defaultDuration: 45,
    phases: [
      {
        name: 'Design',
        tasks: [
          'Define volunteer roles and responsibilities',
          'Create volunteer position descriptions',
          'Design training curriculum',
          'Set up volunteer management system'
        ]
      },
      {
        name: 'Recruitment',
        tasks: [
          'Create recruitment materials',
          'Post volunteer opportunities',
          'Conduct outreach to community partners',
          'Screen and interview candidates'
        ]
      },
      {
        name: 'Onboarding',
        tasks: [
          'Conduct background checks',
          'Schedule orientation sessions',
          'Provide initial training',
          'Assign mentors/supervisors'
        ]
      },
      {
        name: 'Launch',
        tasks: [
          'Begin volunteer placements',
          'Establish check-in schedule',
          'Create recognition program',
          'Set up feedback mechanisms'
        ]
      }
    ],
    tags: ['volunteers', 'community', 'engagement']
  },
  {
    id: 'template-community-event',
    name: 'Community Event',
    description: 'Plan and execute a community event from concept to completion',
    category: 'community',
    defaultDuration: 60,
    phases: [
      {
        name: 'Concept',
        tasks: [
          'Define event goals and target audience',
          'Set budget and timeline',
          'Form planning committee',
          'Research potential venues'
        ]
      },
      {
        name: 'Planning',
        tasks: [
          'Secure venue and permits',
          'Book speakers/entertainment',
          'Create event marketing plan',
          'Recruit volunteers'
        ]
      },
      {
        name: 'Promotion',
        tasks: [
          'Launch registration/RSVP system',
          'Send email invitations',
          'Social media promotion',
          'Partner outreach'
        ]
      },
      {
        name: 'Execution',
        tasks: [
          'Finalize event logistics',
          'Conduct volunteer training',
          'Execute event day',
          'Collect attendee feedback'
        ]
      },
      {
        name: 'Follow-Up',
        tasks: [
          'Send thank you communications',
          'Process event data',
          'Create event report',
          'Plan next steps with contacts'
        ]
      }
    ],
    tags: ['events', 'community', 'outreach']
  },
  {
    id: 'template-strategic-plan',
    name: 'Strategic Planning',
    description: 'Develop or update organizational strategic plan',
    category: 'operations',
    defaultDuration: 120,
    phases: [
      {
        name: 'Assessment',
        tasks: [
          'Review current mission and programs',
          'Gather stakeholder input',
          'Conduct SWOT analysis',
          'Analyze organizational data'
        ]
      },
      {
        name: 'Vision Setting',
        tasks: [
          'Facilitate board/staff visioning session',
          'Draft mission/vision statements',
          'Identify strategic priorities',
          'Define success metrics'
        ]
      },
      {
        name: 'Goal Development',
        tasks: [
          'Develop strategic goals',
          'Create action plans for each goal',
          'Assign responsibilities',
          'Create implementation timeline'
        ]
      },
      {
        name: 'Finalization',
        tasks: [
          'Draft strategic plan document',
          'Review with stakeholders',
          'Board approval',
          'Communication and rollout'
        ]
      }
    ],
    tags: ['strategy', 'planning', 'organizational']
  },
  {
    id: 'template-advocacy-campaign',
    name: 'Advocacy Campaign',
    description: 'Run an advocacy or awareness campaign',
    category: 'advocacy',
    defaultDuration: 90,
    phases: [
      {
        name: 'Research',
        tasks: [
          'Define advocacy goals and targets',
          'Research policy landscape',
          'Identify allies and opponents',
          'Develop key messages'
        ]
      },
      {
        name: 'Coalition Building',
        tasks: [
          'Reach out to potential partners',
          'Form coalition structure',
          'Develop shared messaging',
          'Create advocacy toolkit'
        ]
      },
      {
        name: 'Mobilization',
        tasks: [
          'Launch public awareness campaign',
          'Engage supporters to take action',
          'Coordinate media outreach',
          'Schedule meetings with decision-makers'
        ]
      },
      {
        name: 'Action',
        tasks: [
          'Execute lobby days/meetings',
          'Mobilize constituent contacts',
          'Track and respond to developments',
          'Celebrate wins and adjust strategy'
        ]
      }
    ],
    tags: ['advocacy', 'policy', 'awareness']
  }
];

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  fundraising: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300 dark:border-green-700' },
  community: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300 dark:border-blue-700' },
  operations: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300 dark:border-purple-700' },
  advocacy: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-300 dark:border-orange-700' },
  custom: { bg: 'bg-slate-100 dark:bg-slate-800/30', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-300 dark:border-slate-700' }
};


interface TemplateCardProps {
  template: ProjectTemplate;
  onSelect: (template: ProjectTemplate) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const colors = categoryColors[template.category];
  const totalTasks = template.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);

  return (
    <div 
      className={`p-4 rounded-xl border-2 ${colors.border} ${colors.bg} hover:scale-[1.02] transition-all duration-200 cursor-pointer group`}
      onClick={() => onSelect(template)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} capitalize`}>
          {template.category}
        </span>
      </div>
      
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {template.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span>{template.phases.length} phases</span>
        <span>{totalTasks} tasks</span>
        <span>{template.defaultDuration} days</span>
      </div>

      <div className="flex flex-wrap gap-1">
        {template.tags.map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 bg-white/50 dark:bg-slate-800/50 rounded-full text-slate-600 dark:text-slate-400">
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors">
          <PlusIcon size="sm" />
          Use Template
        </button>
      </div>
    </div>
  );
};

interface TemplateDetailModalProps {
  template: ProjectTemplate;
  onClose: () => void;
  onCreateProject: (template: ProjectTemplate, customizations: {
    name: string;
    clientId: string;
    startDate: string;
  }) => void;
  clients: { id: string; name: string }[];
}

const TemplateDetailModal: React.FC<TemplateDetailModalProps> = ({
  template,
  onClose,
  onCreateProject,
  clients
}) => {
  const [projectName, setProjectName] = useState(template.name);
  const [clientId, setClientId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreate = () => {
    if (!projectName || !clientId) return;
    onCreateProject(template, {
      name: projectName,
      clientId,
      startDate
    });
    onClose();
  };

  const totalTasks = template.phases.reduce((sum, phase) => sum + phase.tasks.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{template.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{template.description}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Customization Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <p><strong>{template.phases.length}</strong> phases</p>
                <p><strong>{totalTasks}</strong> pre-defined tasks</p>
              </div>
            </div>
          </div>

          {/* Phase Preview */}
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Template Phases</h3>
          <div className="space-y-3">
            {template.phases.map((phase, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{phase.name}</h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({phase.tasks.length} tasks)
                  </span>
                </div>
                <ul className="ml-8 space-y-1">
                  {phase.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <CheckCircleIcon />
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!projectName || !clientId}
            className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

interface ProjectTemplatesProps {
  onCreateFromTemplate: (project: Partial<Project>) => void;
  clients: { id: string; name: string }[];
}

export const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  onCreateFromTemplate,
  clients
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates = filterCategory === 'all' 
    ? DEFAULT_TEMPLATES 
    : DEFAULT_TEMPLATES.filter(t => t.category === filterCategory);

  const handleCreateProject = (
    template: ProjectTemplate, 
    customizations: { name: string; clientId: string; startDate: string }
  ) => {
    const startDate = new Date(customizations.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + template.defaultDuration);

    // Generate tasks from template
    const tasks: Task[] = template.phases.flatMap((phase, phaseIndex) =>
      phase.tasks.map((taskDesc, taskIndex) => ({
        id: `task-${Date.now()}-${phaseIndex}-${taskIndex}`,
        description: taskDesc,
        teamMemberId: '',
        dueDate: '',
        status: TaskStatus.ToDo,
        phase: phase.name
      }))
    );

    const newProject: Partial<Project> = {
      id: `project-${Date.now()}`,
      name: customizations.name,
      description: template.description,
      clientId: customizations.clientId,
      status: ProjectStatus.Planning,
      startDate: customizations.startDate,
      endDate: endDate.toISOString().split('T')[0],
      tasks,
      tags: template.tags,
      teamMemberIds: []
    };

    onCreateFromTemplate(newProject);
    setSelectedTemplate(null);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
      >
        <TemplateIcon />
        Templates
      </button>
    );
  }

  return (
    <>
      <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center">
              <TemplateIcon />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Templates</h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="fundraising">Fundraising</option>
              <option value="community">Community</option>
              <option value="operations">Operations</option>
              <option value="advocacy">Advocacy</option>
            </select>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={setSelectedTemplate}
            />
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onCreateProject={handleCreateProject}
          clients={clients}
        />
      )}
    </>
  );
};

export default ProjectTemplates;
