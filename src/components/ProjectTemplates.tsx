import React, { useState } from 'react';
import { Project, ProjectStatus, Task, TaskStatus } from '../types';
import { TemplateIcon, PlusIcon, FolderIcon, CheckCircleIcon, ClockIcon, UsersIcon, XMarkIcon } from './icons';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'nonprofit' | 'fundraising' | 'community' | 'custom';
  tasks: Omit<Task, 'id' | 'projectId'>[];
  estimatedDuration: string; // e.g., "2 weeks", "1 month"
  teamSize: number;
  budget?: number;
  tags: string[];
}

interface ProjectTemplatesProps {
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate) => void;
  existingProjects?: Project[];
}

// Pre-defined templates for non-profit organizations
const PREDEFINED_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'grant-proposal',
    name: 'Grant Proposal',
    description: 'Complete grant application process from research to submission',
    icon: '📝',
    category: 'nonprofit',
    estimatedDuration: '6-8 weeks',
    teamSize: 3,
    budget: 5000,
    tags: ['grants', 'funding', 'proposal'],
    tasks: [
      {
        description: 'Research potential grant opportunities',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Identify grants that align with our mission'
      },
      {
        description: 'Review grant guidelines and requirements',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Create checklist of required documents'
      },
      {
        description: 'Draft project narrative and budget',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Use organization template'
      },
      {
        description: 'Gather supporting documents',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Letters of support, financial statements, etc.'
      },
      {
        description: 'Internal review and revisions',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Get feedback from leadership'
      },
      {
        description: 'Submit grant application',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Confirm submission and save confirmation'
      }
    ]
  },
  {
    id: 'fundraising-campaign',
    name: 'Fundraising Campaign',
    description: 'Launch and manage a successful fundraising campaign',
    icon: '💰',
    category: 'fundraising',
    estimatedDuration: '3-4 months',
    teamSize: 5,
    budget: 15000,
    tags: ['fundraising', 'campaign', 'donations'],
    tasks: [
      {
        description: 'Set fundraising goal and campaign timeline',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Define target amount and key dates'
      },
      {
        description: 'Develop campaign messaging and materials',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Create compelling story and visuals'
      },
      {
        description: 'Set up online donation platform',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Configure payment processing and donation forms'
      },
      {
        description: 'Create social media content calendar',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Schedule posts across all platforms'
      },
      {
        description: 'Launch campaign kickoff event',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Virtual or in-person launch event'
      },
      {
        description: 'Donor outreach and stewardship',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Personal thank you messages and updates'
      },
      {
        description: 'Campaign wrap-up and thank you',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Final results announcement and appreciation'
      }
    ]
  },
  {
    id: 'community-event',
    name: 'Community Event',
    description: 'Plan and execute a community engagement event',
    icon: '🎉',
    category: 'community',
    estimatedDuration: '6-8 weeks',
    teamSize: 4,
    budget: 8000,
    tags: ['event', 'community', 'outreach'],
    tasks: [
      {
        description: 'Define event goals and target audience',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Clarify purpose and expected outcomes'
      },
      {
        description: 'Secure venue and obtain permits',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Book space and handle paperwork'
      },
      {
        description: 'Create event budget and timeline',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Detailed breakdown of costs and schedule'
      },
      {
        description: 'Recruit and train volunteers',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Assign roles and responsibilities'
      },
      {
        description: 'Promote event through multiple channels',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Social media, flyers, email, local media'
      },
      {
        description: 'Coordinate logistics and supplies',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Equipment, food, materials, signage'
      },
      {
        description: 'Execute event day operations',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Setup, activities, breakdown'
      },
      {
        description: 'Post-event follow-up and evaluation',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Thank volunteers, gather feedback, assess impact'
      }
    ]
  },
  {
    id: 'volunteer-program',
    name: 'Volunteer Program',
    description: 'Launch a volunteer recruitment and management program',
    icon: '🤝',
    category: 'community',
    estimatedDuration: '2-3 months',
    teamSize: 3,
    budget: 3000,
    tags: ['volunteers', 'recruitment', 'management'],
    tasks: [
      {
        description: 'Define volunteer roles and requirements',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Create detailed role descriptions'
      },
      {
        description: 'Develop volunteer application and screening process',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Forms, interviews, background checks'
      },
      {
        description: 'Create volunteer training program',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Orientation materials and training sessions'
      },
      {
        description: 'Launch volunteer recruitment campaign',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Social media, community partnerships'
      },
      {
        description: 'Set up volunteer tracking system',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Hours, activities, impact metrics'
      },
      {
        description: 'Implement volunteer recognition program',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Certificates, events, thank you gifts'
      }
    ]
  },
  {
    id: 'program-evaluation',
    name: 'Program Evaluation',
    description: 'Assess program effectiveness and impact',
    icon: '📊',
    category: 'nonprofit',
    estimatedDuration: '4-6 weeks',
    teamSize: 2,
    budget: 2000,
    tags: ['evaluation', 'impact', 'assessment'],
    tasks: [
      {
        description: 'Define evaluation questions and objectives',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'What do we want to measure and why'
      },
      {
        description: 'Design data collection methods',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Surveys, interviews, focus groups, observations'
      },
      {
        description: 'Collect and organize evaluation data',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Gather information from all sources'
      },
      {
        description: 'Analyze findings and identify patterns',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Look for trends, successes, challenges'
      },
      {
        description: 'Create evaluation report with recommendations',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Professional report with actionable insights'
      },
      {
        description: 'Present findings to stakeholders',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Board, staff, funders, community'
      }
    ]
  },
  {
    id: 'social-media-campaign',
    name: 'Social Media Campaign',
    description: 'Build and execute a social media strategy',
    icon: '📱',
    category: 'fundraising',
    estimatedDuration: '1-2 months',
    teamSize: 2,
    budget: 1500,
    tags: ['social media', 'marketing', 'awareness'],
    tasks: [
      {
        description: 'Audit current social media presence',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Review all platforms and engagement'
      },
      {
        description: 'Define campaign goals and target audience',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Specific, measurable objectives'
      },
      {
        description: 'Develop content strategy and calendar',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Mix of content types and posting schedule'
      },
      {
        description: 'Create visual assets and graphics',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Brand-consistent imagery and templates'
      },
      {
        description: 'Launch campaign and monitor engagement',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Daily posting and community management'
      },
      {
        description: 'Analyze metrics and adjust strategy',
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'Track reach, engagement, conversions'
      }
    ]
  }
];

export const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  onClose,
  onSelectTemplate,
  existingProjects = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter templates
  const filteredTemplates = PREDEFINED_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Get custom templates from existing projects marked as templates
  const customTemplates: ProjectTemplate[] = existingProjects
    .filter(p => p.isTemplate)
    .map(p => ({
      id: p.id,
      name: p.templateName || p.name,
      description: p.description || '',
      icon: '📁',
      category: 'custom' as const,
      estimatedDuration: calculateDuration(p.startDate, p.endDate),
      teamSize: p.teamMemberIds.length,
      budget: p.budget,
      tags: p.tags || [],
      tasks: p.tasks.map(t => ({
        description: t.description,
        teamMemberId: '',
        status: TaskStatus.ToDo,
        dueDate: t.dueDate,
        notes: t.notes
      }))
    }));

  function calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    
    if (weeks === 0) return `${days} days`;
    if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    const months = Math.floor(weeks / 4);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  const allTemplates = [...filteredTemplates, ...customTemplates];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TemplateIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                Project Templates
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose a template to quick-start your project
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'nonprofit', 'fundraising', 'community', 'custom'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {allTemplates.length === 0 ? (
            <div className="text-center py-12">
              <TemplateIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Templates Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Icon and Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{template.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <UsersIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{template.teamSize} people</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{template.tasks.length} tasks</span>
                    </div>
                    {template.budget && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">${template.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 Tip: You can save any project as a template for reuse
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};