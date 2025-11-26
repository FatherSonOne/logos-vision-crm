import React, { useState } from 'react';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import {
  EditIcon,
  TrashIcon,
  CopyIcon,
  DownloadIcon,
  MailIcon,
  PhoneIcon,
  FolderIcon,
  ShareIcon,
  ArchiveIcon,
  StarIcon,
  EyeIcon,
  SparklesIcon
} from './icons';

/**
 * CONTEXT MENU EXAMPLES
 * 
 * This shows how to add right-click menus to different elements:
 * - Project cards
 * - Client rows
 * - Document items
 * - Task items
 * 
 * HOW TO TEST:
 * 1. Add to your App.tsx temporarily
 * 2. Right-click on any card/item
 * 3. See the context menu appear!
 * 4. Try keyboard navigation (arrow keys, Enter, Esc)
 */

export const ContextMenuExamples: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  // Mock data
  const projects = [
    { id: '1', name: 'Website Redesign', status: 'Active', client: 'Acme Corp' },
    { id: '2', name: 'Mobile App', status: 'Planning', client: 'TechStart' },
    { id: '3', name: 'Brand Strategy', status: 'Completed', client: 'Creative Co' }
  ];

  const clients = [
    { id: '1', name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-0123' },
    { id: '2', name: 'TechStart Inc', email: 'hello@techstart.com', phone: '555-0456' },
    { id: '3', name: 'Creative Co', email: 'info@creative.co', phone: '555-0789' }
  ];

  const documents = [
    { id: '1', name: 'Project Brief.pdf', size: '2.4 MB', date: '2024-11-20' },
    { id: '2', name: 'Contract.docx', size: '156 KB', date: '2024-11-19' },
    { id: '3', name: 'Budget.xlsx', size: '89 KB', date: '2024-11-18' }
  ];

  // Context menu items for projects
  const getProjectContextMenu = (project: any): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Details',
      icon: <EyeIcon />,
      shortcut: 'Enter',
      onClick: () => alert(`Viewing ${project.name}`)
    },
    {
      id: 'edit',
      label: 'Edit Project',
      icon: <EditIcon />,
      shortcut: '⌘E',
      onClick: () => alert(`Editing ${project.name}`)
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <CopyIcon />,
      onClick: () => alert(`Duplicating ${project.name}`),
      divider: true
    },
    {
      id: 'share',
      label: 'Share',
      icon: <ShareIcon />,
      onClick: () => alert(`Sharing ${project.name}`)
    },
    {
      id: 'export',
      label: 'Export',
      icon: <DownloadIcon />,
      onClick: () => alert(`Exporting ${project.name}`),
      divider: true
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <ArchiveIcon />,
      onClick: () => alert(`Archiving ${project.name}`)
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <TrashIcon />,
      onClick: () => {
        if (confirm(`Delete ${project.name}?`)) {
          alert('Deleted!');
        }
      },
      danger: true
    }
  ];

  // Context menu items for clients
  const getClientContextMenu = (client: any): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View Profile',
      icon: <EyeIcon />,
      onClick: () => alert(`Viewing ${client.name}`)
    },
    {
      id: 'edit',
      label: 'Edit Details',
      icon: <EditIcon />,
      onClick: () => alert(`Editing ${client.name}`),
      divider: true
    },
    {
      id: 'email',
      label: 'Send Email',
      icon: <MailIcon />,
      shortcut: '⌘M',
      onClick: () => alert(`Emailing ${client.email}`)
    },
    {
      id: 'call',
      label: 'Call',
      icon: <PhoneIcon />,
      onClick: () => alert(`Calling ${client.phone}`),
      divider: true
    },
    {
      id: 'add-project',
      label: 'Add Project',
      icon: <FolderIcon />,
      onClick: () => alert(`Adding project for ${client.name}`)
    },
    {
      id: 'add-activity',
      label: 'Log Activity',
      icon: <SparklesIcon />,
      onClick: () => alert(`Logging activity for ${client.name}`),
      divider: true
    },
    {
      id: 'favorite',
      label: 'Add to Favorites',
      icon: <StarIcon />,
      onClick: () => alert(`Added ${client.name} to favorites`)
    }
  ];

  // Context menu items for documents
  const getDocumentContextMenu = (doc: any): ContextMenuItem[] => [
    {
      id: 'open',
      label: 'Open',
      icon: <EyeIcon />,
      shortcut: 'Enter',
      onClick: () => alert(`Opening ${doc.name}`)
    },
    {
      id: 'download',
      label: 'Download',
      icon: <DownloadIcon />,
      shortcut: '⌘D',
      onClick: () => alert(`Downloading ${doc.name}`),
      divider: true
    },
    {
      id: 'rename',
      label: 'Rename',
      icon: <EditIcon />,
      onClick: () => alert(`Renaming ${doc.name}`)
    },
    {
      id: 'share',
      label: 'Share',
      icon: <ShareIcon />,
      onClick: () => alert(`Sharing ${doc.name}`),
      divider: true
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <TrashIcon />,
      onClick: () => {
        if (confirm(`Delete ${doc.name}?`)) {
          alert('Deleted!');
        }
      },
      danger: true
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Context Menu Examples 🖱️</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Right-click on any card or item below to see context menus in action!
        </p>
      </div>

      {/* Example 1: Project Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 1: Project Cards</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Right-click any project card to see actions like Edit, Duplicate, Delete, etc.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map(project => (
            <ContextMenu
              key={project.id}
              items={getProjectContextMenu(project)}
            >
              <div 
                className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-cyan-500"
                onClick={() => setSelectedItem(project.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900 rounded-lg flex items-center justify-center">
                    <FolderIcon className="text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === 'Active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : project.status === 'Planning'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{project.client}</p>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    💡 Right-click me!
                  </p>
                </div>
              </div>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Example 2: Client Table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 2: Client Table</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Right-click any row to see actions like Email, Call, Add Project, etc.
        </p>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {clients.map(client => (
                <ContextMenu
                  key={client.id}
                  items={getClientContextMenu(client)}
                >
                  <tr 
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedItem(client.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg">🏢</span>
                        </div>
                        <div className="font-medium">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {client.phone}
                    </td>
                  </tr>
                </ContextMenu>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Example 3: Document List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Example 3: Document List</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Right-click any document to see actions like Download, Share, Delete, etc.
        </p>
        
        <div className="space-y-2">
          {documents.map(doc => (
            <ContextMenu
              key={doc.id}
              items={getDocumentContextMenu(doc)}
            >
              <div 
                className="bg-white dark:bg-slate-800 p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center justify-between group"
                onClick={() => setSelectedItem(doc.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📄</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Right-click for options
                </span>
              </div>
            </ContextMenu>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 p-6 rounded-xl">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          How to Use Context Menus
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span><strong>Right-click</strong> any item to open the context menu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Use <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs">↑</kbd> <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs">↓</kbd> arrow keys to navigate</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Press <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs">Enter</kbd> to select an action</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Press <kbd className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs">Esc</kbd> to close the menu</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Click outside the menu to close it</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
