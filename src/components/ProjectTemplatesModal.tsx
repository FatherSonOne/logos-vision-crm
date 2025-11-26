import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Project, Client } from '../types';
import { FileTextIcon, CheckCircleIcon, ClockIcon, TargetIcon, UsersIcon } from './icons';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'consulting' | 'nonprofit' | 'event' | 'fundraising' | 'advocacy';
  duration: number; // days
  taskCount: number;
  teamSize: number;
  tags: string[];
  tasks: Array<{
    title: string;
    description: string;
    dueInDays: number; // days from project start
  }>;
}

const TEMPLATES: ProjectTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Nonprofit Strategic Plan',
    description: 'Comprehensive strategic planning for nonprofit organizations',
    category: 'consulting',
    duration: 90,
    taskCount: 15,
    teamSize: 4,
    tags: ['Strategy', 'Planning', 'Nonprofit'],
    tasks: [
      { title: 'Initial Discovery Meeting', description: 'Meet with stakeholders', dueInDays: 3 },
      { title: 'SWOT Analysis', description: 'Analyze strengths, weaknesses, opportunities, threats', dueInDays: 10 },
      { title: 'Vision & Mission Review', description: 'Review and refine organizational mission', dueInDays: 15 },
      { title: 'Goal Setting Workshop', description: 'Facilitate goal-setting sessions', dueInDays: 25 },
      { title: 'Draft Strategic Plan', description: 'Create first draft of strategic plan', dueInDays: 45 },
      { title: 'Stakeholder Review', description: 'Present plan to stakeholders', dueInDays: 60 },
      { title: 'Finalize Strategic Plan', description: 'Complete final version', dueInDays: 75 },
      { title: 'Implementation Roadmap', description: 'Create detailed implementation plan', dueInDays: 85 },
      { title: 'Board Presentation', description: 'Present to board of directors', dueInDays: 90 }
    ]
  },
  {
    id: 'tpl-2',
    name: 'Fundraising Campaign',
    description: 'Launch and execute a successful fundraising campaign',
    category: 'fundraising',
    duration: 60,
    taskCount: 12,
    teamSize: 3,
    tags: ['Fundraising', 'Campaign', 'Development'],
    tasks: [
      { title: 'Campaign Planning', description: 'Define goals and strategies', dueInDays: 5 },
      { title: 'Donor Research', description: 'Identify potential major donors', dueInDays: 10 },
      { title: 'Case for Support', description: 'Create compelling case statement', dueInDays: 15 },
      { title: 'Marketing Materials', description: 'Design campaign collateral', dueInDays: 20 },
      { title: 'Soft Launch', description: 'Begin with major gift solicitations', dueInDays: 25 },
      { title: 'Public Launch', description: 'Launch campaign publicly', dueInDays: 30 },
      { title: 'Mid-Campaign Review', description: 'Assess progress and adjust', dueInDays: 40 },
      { title: 'Final Push', description: 'Intensify outreach efforts', dueInDays: 50 },
      { title: 'Campaign Close', description: 'Celebrate and thank donors', dueInDays: 60 }
    ]
  },
  {
    id: 'tpl-3',
    name: 'Community Event Planning',
    description: 'Organize a successful community or fundraising event',
    category: 'event',
    duration: 45,
    taskCount: 18,
    teamSize: 5,
    tags: ['Event', 'Community', 'Engagement'],
    tasks: [
      { title: 'Event Concept', description: 'Define event purpose and format', dueInDays: 2 },
      { title: 'Venue Selection', description: 'Research and book venue', dueInDays: 7 },
      { title: 'Budget Planning', description: 'Create detailed budget', dueInDays: 10 },
      { title: 'Vendor Coordination', description: 'Contract caterers, AV, etc.', dueInDays: 15 },
      { title: 'Marketing Launch', description: 'Begin promotional activities', dueInDays: 20 },
      { title: 'Registration System', description: 'Set up ticketing/registration', dueInDays: 22 },
      { title: 'Speaker Confirmation', description: 'Confirm all speakers/performers', dueInDays: 25 },
      { title: 'Volunteer Recruitment', description: 'Recruit and train volunteers', dueInDays: 30 },
      { title: 'Final Logistics', description: 'Finalize all event details', dueInDays: 40 },
      { title: 'Event Day', description: 'Execute event', dueInDays: 45 }
    ]
  },
  {
    id: 'tpl-4',
    name: 'Advocacy Campaign',
    description: 'Launch a policy advocacy or awareness campaign',
    category: 'advocacy',
    duration: 75,
    taskCount: 14,
    teamSize: 4,
    tags: ['Advocacy', 'Policy', 'Awareness'],
    tasks: [
      { title: 'Issue Research', description: 'Deep dive into policy issue', dueInDays: 7 },
      { title: 'Coalition Building', description: 'Build partnerships with allies', dueInDays: 14 },
      { title: 'Message Development', description: 'Craft key messages', dueInDays: 20 },
      { title: 'Media Strategy', description: 'Plan media outreach', dueInDays: 25 },
      { title: 'Grassroots Mobilization', description: 'Engage supporters', dueInDays: 35 },
      { title: 'Lobby Day Preparation', description: 'Prepare for legislative meetings', dueInDays: 45 },
      { title: 'Campaign Launch', description: 'Public campaign launch', dueInDays: 50 },
      { title: 'Ongoing Advocacy', description: 'Sustained advocacy efforts', dueInDays: 65 },
      { title: 'Impact Evaluation', description: 'Assess campaign results', dueInDays: 75 }
    ]
  },
  {
    id: 'tpl-5',
    name: 'Board Development',
    description: 'Strengthen nonprofit board governance and effectiveness',
    category: 'consulting',
    duration: 60,
    taskCount: 11,
    teamSize: 3,
    tags: ['Governance', 'Board', 'Leadership'],
    tasks: [
      { title: 'Board Assessment', description: 'Evaluate current board effectiveness', dueInDays: 7 },
      { title: 'Skills Gap Analysis', description: 'Identify needed expertise', dueInDays: 14 },
      { title: 'Recruitment Strategy', description: 'Develop board recruitment plan', dueInDays: 20 },
      { title: 'Governance Training', description: 'Conduct board training sessions', dueInDays: 30 },
      { title: 'Policy Review', description: 'Update board policies', dueInDays: 40 },
      { title: 'Committee Restructure', description: 'Optimize committee structure', dueInDays: 50 },
      { title: 'Evaluation System', description: 'Implement board self-evaluation', dueInDays: 60 }
    ]
  }
];

interface ProjectTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFromTemplate: (template: ProjectTemplate, clientId: string) => void;
  clients: Client[];
}

export const ProjectTemplatesModal: React.FC<ProjectTemplatesModalProps> = ({
  isOpen,
  onClose,
  onCreateFromTemplate,
  clients
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates = filterCategory === 'all' 
    ? TEMPLATES 
    : TEMPLATES.filter(t => t.category === filterCategory);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectName(template.name);
  };

  const handleCreate = () => {
    if (selectedTemplate && selectedClient && projectName) {
      onCreateFromTemplate(selectedTemplate, selectedClient);
      // Reset and close
      setSelectedTemplate(null);
      setSelectedClient('');
      setProjectName('');
      onClose();
    }
  };

  const categoryColors: Record<string, string> = {
    consulting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    nonprofit: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    fundraising: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    advocacy: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Templates"
      size="xl"
    >
      <div className="space-y-6">
        {!selectedTemplate ? (
          <>
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Templates
              </button>
              {['consulting', 'fundraising', 'event', 'advocacy'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filterCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileTextIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${categoryColors[template.category]}`}>
                      {template.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {template.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-4 w-4" />
                      {template.duration} days
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircleIcon className="h-4 w-4" />
                      {template.taskCount} tasks
                    </div>
                    <div className="flex items-center gap-1">
                      <UsersIcon className="h-4 w-4" />
                      {template.teamSize} members
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.map(tag => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Template Configuration */}
            <div className="space-y-4">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                ← Back to templates
              </button>

              <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {selectedTemplate.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {selectedTemplate.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span>{selectedTemplate.duration} days</span>
                  <span>•</span>
                  <span>{selectedTemplate.taskCount} tasks</span>
                  <span>•</span>
                  <span>{selectedTemplate.teamSize} team members</span>
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Select Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Choose a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Preview */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Included Tasks ({selectedTemplate.tasks.length})
                </h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {selectedTemplate.tasks.map((task, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {task.title}
                          </h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {task.description}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-500 ml-3">
                          Day {task.dueInDays}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!selectedClient || !projectName}
                  className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Create Project
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};