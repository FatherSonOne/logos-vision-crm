import React, { useState } from 'react';
import { SplitView, MasterDetailView } from './SplitView';
import { SplitViewTutorial, useSplitViewTutorial } from './SplitViewTutorial';
import {
  BuildingIcon,
  FolderIcon,
  MailIcon,
  UserIcon,
  ClipboardListIcon
} from './icons';

/**
 * SPLIT VIEW EXAMPLES
 * 
 * Shows all the different ways to use split views:
 * 1. Client List + Client Detail
 * 2. Project List + Project Detail  
 * 3. Inbox + Message Detail
 * 4. Document List + Document Preview
 * 5. Vertical Split (Timeline)
 */

export const SplitViewExamples: React.FC = () => {
  const [activeExample, setActiveExample] = useState<number>(1);
  const { showTutorial, handleComplete, handleSkip, resetTutorial } = useSplitViewTutorial();

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <SplitViewTutorial onComplete={handleComplete} onSkip={handleSkip} />
      )}

      {/* Header with example selector */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Split View Examples 🔄</h1>
          <button
            onClick={resetTutorial}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span>ℹ️</span>
            <span>Show Tutorial</span>
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 1, label: 'Client List + Detail' },
            { id: 2, label: 'Project List + Detail' },
            { id: 3, label: 'Inbox + Message' },
            { id: 4, label: 'Documents + Preview' },
            { id: 5, label: 'Vertical Split' }
          ].map(example => (
            <button
              key={example.id}
              onClick={() => setActiveExample(example.id)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${activeExample === example.id
                  ? 'bg-cyan-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Example content */}
      <div className="flex-1 overflow-hidden">
        {activeExample === 1 && <ClientListExample />}
        {activeExample === 2 && <ProjectListExample />}
        {activeExample === 3 && <InboxExample />}
        {activeExample === 4 && <DocumentExample />}
        {activeExample === 5 && <VerticalSplitExample />}
      </div>
    </div>
  );
};

// Example 1: Client List + Detail
const ClientListExample: React.FC = () => {
  const clients = [
    { 
      id: '1', 
      name: 'Acme Corporation', 
      type: 'For-Profit', 
      location: 'New York, NY',
      email: 'contact@acme.com',
      phone: '555-0123',
      projects: 5,
      revenue: '$125,000'
    },
    { 
      id: '2', 
      name: 'TechStart Foundation', 
      type: 'Non-Profit', 
      location: 'San Francisco, CA',
      email: 'hello@techstart.org',
      phone: '555-0456',
      projects: 3,
      revenue: '$75,000'
    },
    { 
      id: '3', 
      name: 'Green Earth Initiative', 
      type: 'Non-Profit', 
      location: 'Seattle, WA',
      email: 'info@greenearth.org',
      phone: '555-0789',
      projects: 8,
      revenue: '$200,000'
    }
  ];

  const [selectedClient, setSelectedClient] = useState(clients[0]);

  return (
    <MasterDetailView
      items={clients}
      selectedItem={selectedClient}
      onSelectItem={setSelectedClient}
      storageKey="client-list"
      renderItem={(client, isSelected) => (
        <div className={`
          p-4 transition-colors
          ${isSelected 
            ? 'bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-cyan-500' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <BuildingIcon className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{client.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {client.type} • {client.location}
              </div>
            </div>
          </div>
        </div>
      )}
      renderDetail={(client) => (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{client.name}</h2>
            <p className="text-slate-600 dark:text-slate-400">{client.type}</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Contact
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MailIcon className="w-4 h-4 text-slate-400" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📞</span>
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span>{client.location}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Active Projects:</span>
                  <span className="font-semibold">{client.projects}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Revenue:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">{client.revenue}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Recent Projects
            </h3>
            <div className="space-y-2">
              {['Website Redesign', 'Brand Strategy', 'Social Media Campaign'].map((project, i) => (
                <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FolderIcon className="w-5 h-5 text-cyan-500" />
                    <span>{project}</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Active</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
};

// Example 2: Project List + Detail
const ProjectListExample: React.FC = () => {
  const projects = [
    { 
      id: '1', 
      name: 'Website Redesign', 
      client: 'Acme Corp',
      status: 'Active',
      progress: 65,
      team: 4,
      deadline: '2024-12-15'
    },
    { 
      id: '2', 
      name: 'Mobile App Development', 
      client: 'TechStart',
      status: 'Planning',
      progress: 15,
      team: 6,
      deadline: '2025-02-01'
    },
    { 
      id: '3', 
      name: 'Brand Strategy', 
      client: 'Green Earth',
      status: 'Active',
      progress: 90,
      team: 3,
      deadline: '2024-11-30'
    }
  ];

  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <MasterDetailView
      items={projects}
      selectedItem={selectedProject}
      onSelectItem={setSelectedProject}
      storageKey="project-list"
      renderItem={(project, isSelected) => (
        <div className={`
          p-4 transition-colors
          ${isSelected 
            ? 'bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-cyan-500' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <FolderIcon className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{project.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {project.client} • {project.status}
              </div>
              <div className="mt-2">
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      renderDetail={(project) => (
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{project.name}</h2>
                <p className="text-slate-600 dark:text-slate-400">{project.client}</p>
              </div>
              <span className={`
                px-4 py-2 rounded-full font-semibold
                ${project.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }
              `}>
                {project.status}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">Progress</span>
              <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{project.progress}%</span>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Team Size</div>
              <div className="text-2xl font-bold">{project.team}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Tasks</div>
              <div className="text-2xl font-bold">24</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Deadline</div>
              <div className="text-sm font-bold">{project.deadline}</div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Recent Activity</h3>
            <div className="space-y-3">
              {['Updated design mockups', 'Completed user research', 'Scheduled client review'].map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="w-8 h-8 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">2 hours ago</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
};

// Example 3: Inbox + Message
const InboxExample: React.FC = () => {
  const messages = [
    { 
      id: '1', 
      from: 'John Smith', 
      subject: 'Project Update - Website Redesign',
      preview: 'Hey team, wanted to share the latest progress...',
      time: '10:30 AM',
      unread: true,
      body: 'Hey team,\n\nWanted to share the latest progress on the website redesign. We\'ve completed the homepage mockups and they\'re ready for review.\n\nKey highlights:\n- New hero section with dynamic content\n- Improved navigation structure\n- Mobile-responsive design\n\nLet me know your thoughts!\n\nBest,\nJohn'
    },
    { 
      id: '2', 
      from: 'Sarah Johnson', 
      subject: 'Meeting Notes - Client Review',
      preview: 'Thanks for joining the call today. Here are...',
      time: 'Yesterday',
      unread: false,
      body: 'Hi everyone,\n\nThanks for joining the client review call today. Here are the key takeaways:\n\n1. Client loved the new direction\n2. Minor tweaks needed on color scheme\n3. Next review scheduled for next Tuesday\n\nI\'ve attached the meeting recording and notes.\n\nThanks,\nSarah'
    }
  ];

  const [selectedMessage, setSelectedMessage] = useState(messages[0]);

  return (
    <SplitView
      defaultLeftWidth={35}
      storageKey="inbox"
      leftPane={
        <div className="h-full bg-slate-50 dark:bg-slate-900/50">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-semibold text-lg">Inbox</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">2 messages</p>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {messages.map(message => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`
                  p-4 cursor-pointer transition-colors
                  ${selectedMessage.id === message.id
                    ? 'bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-cyan-500'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.unread 
                      ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }
                  `}>
                    {message.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className={`font-semibold truncate ${message.unread ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                        {message.from}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                        {message.time}
                      </span>
                    </div>
                    <div className={`text-sm truncate ${message.unread ? 'font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                      {message.subject}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                      {message.preview}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      rightPane={
        <div className="h-full p-6">
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-medium">{selectedMessage.from}</span>
                  <span>•</span>
                  <span>{selectedMessage.time}</span>
                </div>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedMessage.body}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

// Example 4: Document List + Preview
const DocumentExample: React.FC = () => {
  const documents = [
    { id: '1', name: 'Project Brief.pdf', type: 'PDF', size: '2.4 MB', date: '2024-11-20' },
    { id: '2', name: 'Design Mockups.fig', type: 'Figma', size: '15.2 MB', date: '2024-11-19' },
    { id: '3', name: 'Budget.xlsx', type: 'Excel', size: '89 KB', date: '2024-11-18' }
  ];

  const [selectedDoc, setSelectedDoc] = useState(documents[0]);

  return (
    <MasterDetailView
      items={documents}
      selectedItem={selectedDoc}
      onSelectItem={setSelectedDoc}
      storageKey="documents"
      renderItem={(doc, isSelected) => (
        <div className={`
          p-4 transition-colors
          ${isSelected 
            ? 'bg-cyan-50 dark:bg-cyan-900/30 border-l-4 border-cyan-500' 
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-l-4 border-transparent'
          }
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <ClipboardListIcon className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{doc.name}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {doc.size} • {doc.date}
              </div>
            </div>
          </div>
        </div>
      )}
      renderDetail={(doc) => (
        <div className="h-full flex flex-col">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">{doc.name}</h2>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span>{doc.type}</span>
              <span>•</span>
              <span>{doc.size}</span>
              <span>•</span>
              <span>{doc.date}</span>
            </div>
          </div>
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <ClipboardListIcon className="w-24 h-24 mx-auto mb-4 text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400">Document Preview</p>
            </div>
          </div>
        </div>
      )}
    />
  );
};

// Example 5: Vertical Split
const VerticalSplitExample: React.FC = () => {
  return (
    <SplitView
      direction="vertical"
      defaultLeftWidth={40}
      storageKey="vertical-split"
      leftPane={
        <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
          <h2 className="text-2xl font-bold mb-4">Top Pane</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            This is a vertical split view. Drag the divider up or down to resize!
          </p>
          <div className="space-y-3">
            {['Timeline Event 1', 'Timeline Event 2', 'Timeline Event 3'].map((event, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="font-semibold mb-1">{event}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Details about this event...</div>
              </div>
            ))}
          </div>
        </div>
      }
      rightPane={
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="text-2xl font-bold mb-4">Bottom Pane</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Vertical splits are great for timelines, logs, or any content that benefits from top-to-bottom organization.
          </p>
          <div className="space-y-3">
            {['Detail 1', 'Detail 2', 'Detail 3'].map((detail, i) => (
              <div key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                <div className="font-semibold mb-1">{detail}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">More information here...</div>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
};
