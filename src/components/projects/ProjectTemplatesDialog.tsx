import React, { useState } from 'react';
import { Modal } from '../Modal';
import { XIcon, FolderIcon, FileTextIcon, TargetIcon, UsersIcon } from '../icons';
import { ProjectStatus, Task, TaskStatus } from '../../types';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  duration: string;
  phases: string[];
  tasks: Omit<Task, 'id' | 'projectId'>[];
  color: string;
}

const templates: ProjectTemplate[] = [
  {
    id: 'nonprofit-grant',
    name: 'Non-Profit Grant Application',
    description: 'Complete grant application process from research to submission',
    category: 'Fundraising',
    icon: <FileTextIcon className="h-6 w-6" />,
    duration: '8-12 weeks',
    color: 'from-blue-500 to-cyan-500',
    phases: ['Research', 'Proposal Writing', 'Budget Development', 'Review', 'Submission'],
    tasks: [
      { title: 'Research grant opportunities', description: 'Identify potential grants', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Review eligibility requirements', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Draft project narrative', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Create detailed budget', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Gather supporting documents', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Internal review and edits', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Submit application', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' }
    ]
  },
  {
    id: 'community-event',
    name: 'Community Event Planning',
    description: 'Organize and execute a successful community event',
    category: 'Events',
    icon: <UsersIcon />,
    duration: '6-8 weeks',
    color: 'from-purple-500 to-pink-500',
    phases: ['Planning', 'Outreach', 'Setup', 'Execution', 'Follow-up'],
    tasks: [
      { title: 'Define event goals and objectives', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Secure venue and permits', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Create event budget', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Recruit volunteers', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Marketing and promotion', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Day-of coordination', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Post-event survey and report', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' }
    ]
  },
  {
    id: 'program-launch',
    name: 'Program Launch',
    description: 'Launch a new program or service offering',
    category: 'Programs',
    icon: <TargetIcon className="h-6 w-6" />,
    duration: '12-16 weeks',
    color: 'from-green-500 to-emerald-500',
    phases: ['Research', 'Design', 'Testing', 'Launch', 'Evaluation'],
    tasks: [
      { title: 'Conduct needs assessment', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Define program objectives', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Develop program curriculum', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Create marketing materials', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Pilot program with small group', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Gather feedback and refine', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Full program launch', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Monitor and evaluate outcomes', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' }
    ]
  },
  {
    id: 'volunteer-campaign',
    name: 'Volunteer Recruitment Campaign',
    description: 'Build and engage a volunteer base',
    category: 'Volunteers',
    icon: <UsersIcon />,
    duration: '4-6 weeks',
    color: 'from-orange-500 to-red-500',
    phases: ['Planning', 'Outreach', 'Onboarding', 'Engagement'],
    tasks: [
      { title: 'Define volunteer roles and needs', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Create volunteer job descriptions', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Set up application process', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Promote opportunities', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Screen and interview candidates', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Conduct orientation training', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Assign first activities', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' }
    ]
  },
  {
    id: 'donor-cultivation',
    name: 'Donor Cultivation Program',
    description: 'Develop relationships with potential major donors',
    category: 'Fundraising',
    icon: <FileTextIcon className="h-6 w-6" />,
    duration: '12+ weeks',
    color: 'from-teal-500 to-blue-500',
    phases: ['Research', 'Introduction', 'Cultivation', 'Solicitation', 'Stewardship'],
    tasks: [
      { title: 'Identify prospect donors', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Research donor interests', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Schedule introductory meetings', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Provide organizational updates', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Invite to events/site visits', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Prepare solicitation strategy', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Make ask', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' },
      { title: 'Thank and recognize donor', description: '', status: TaskStatus.ToDo, dueDate: '', teamMemberId: '', assignedTo: '' }
    ]
  },
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with no pre-defined tasks',
    category: 'Custom',
    icon: <FolderIcon />,
    duration: 'Flexible',
    color: 'from-slate-500 to-gray-500',
    phases: [],
    tasks: []
  }
];

interface ProjectTemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ProjectTemplate, customData: { name: string; clientId: string }) => void;
  clients: { id: string; name: string }[];
}

export const ProjectTemplatesDialog: React.FC<ProjectTemplatesDialogProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  clients
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    setProjectName(template.name);
  };

  const handleCreate = () => {
    if (selectedTemplate && projectName && selectedClientId) {
      onSelectTemplate(selectedTemplate, {
        name: projectName,
        clientId: selectedClientId
      });
      // Reset state
      setSelectedTemplate(null);
      setProjectName('');
      setSelectedClientId('');
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setProjectName('');
    setSelectedClientId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedTemplate ? 'Configure Project' : 'Choose a Template'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {selectedTemplate ? 'Customize your project details' : 'Start with a pre-built template or create from scratch'}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <XIcon />
            </button>
          </div>

          {/* Content */}
          {!selectedTemplate ? (
            <>
              {/* Category Filter */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                        selectedCategory === category
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="text-left p-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all hover:shadow-lg group"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-white mb-4`}>
                        {template.icon}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        {template.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{template.duration}</span>
                        <span>{template.tasks.length} tasks</span>
                      </div>
                      {template.phases.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Phases:</p>
                          <div className="flex flex-wrap gap-1">
                            {template.phases.slice(0, 3).map((phase, idx) => (
                              <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                                {phase}
                              </span>
                            ))}
                            {template.phases.length > 3 && (
                              <span className="px-2 py-1 text-xs text-slate-500">
                                +{template.phases.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Configuration Form */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-2xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter project name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Client/Organization *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-4">Template Overview</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Duration:</span>
                      <span className="text-sm text-slate-900 dark:text-white ml-2">{selectedTemplate.duration}</span>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tasks:</span>
                      <span className="text-sm text-slate-900 dark:text-white ml-2">{selectedTemplate.tasks.length} pre-configured</span>
                    </div>
                    {selectedTemplate.phases.length > 0 && (
                      <div>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 block mb-2">Phases:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplate.phases.map((phase, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg text-sm font-medium">
                              {phase}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  All tasks from the template will be added to your project. You can customize them after creation.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => selectedTemplate ? setSelectedTemplate(null) : handleCancel()}
              className="px-6 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
              {selectedTemplate ? '← Back to Templates' : 'Cancel'}
            </button>
            {selectedTemplate && (
              <button
                onClick={handleCreate}
                disabled={!projectName || !selectedClientId}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  projectName && selectedClientId
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Create Project
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};