import React from 'react';
import type { Client } from '../types';
import { MailIcon, PhoneIcon, LocationMarkerIcon, PlusIcon } from './icons';
import { ExportButton, type ExportField } from './export/ExportButton';

interface ClientListProps {
  clients: Client[];
  onAddOrganization: () => void;
  onSelectOrganization: (id: string) => void;
}

const OrganizationCard: React.FC<{ client: Client, onSelectOrganization: (id: string) => void }> = ({ client, onSelectOrganization }) => (
    <button 
        onClick={() => onSelectOrganization(client.id)}
        className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-xl border border-white/30 dark:border-slate-700/50 shadow-lg flex flex-col hover:border-primary-400/50 dark:hover:border-primary-500/50 text-left w-full h-full text-shadow-strong card-interactive"
    >
        <h3 className="text-lg font-bold text-slate-900 truncate w-full dark:text-white">{client.name}</h3>
        <p className="text-sm text-secondary-600 font-semibold mb-3 dark:text-secondary-400">{client.contactPerson}</p>
        <div className="space-y-2 text-sm text-slate-700 flex-grow dark:text-slate-300">
            <div className="flex items-center gap-2">
                <MailIcon />
                <a href={`mailto:${client.email}`} onClick={e => e.stopPropagation()} className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 truncate transition-colors duration-200">{client.email}</a>
            </div>
            <div className="flex items-center gap-2">
                <PhoneIcon />
                <span>{client.phone}</span>
            </div>
             <div className="flex items-center gap-2">
                <LocationMarkerIcon />
                <span>{client.location}</span>
            </div>
        </div>
        <p className="text-xs text-slate-500 mt-4 dark:text-slate-500">Added: {new Date(client.createdAt).toLocaleDateString()}</p>
    </button>
);

const AddOrganizationCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl p-6 rounded-xl border-2 border-dashed border-white/40 dark:border-slate-700/60 text-center flex flex-col items-center justify-center hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 text-slate-600 dark:text-slate-400 h-full text-shadow-strong card-lift-subtle transition-all duration-200"
    >
        <div className="w-20 h-20 rounded-full bg-white/40 dark:bg-slate-800/50 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
            <PlusIcon />
        </div>
        <h3 className="text-lg font-bold">Add Organization</h3>
    </button>
);

export const ClientList: React.FC<ClientListProps> = ({ clients, onAddOrganization, onSelectOrganization }) => {
  const exportFields: ExportField[] = [
    { key: 'name', label: 'Client Name' },
    { key: 'type', label: 'Type' },
    { key: 'email', label: 'Email' },
    { 
      key: 'createdAt', 
      label: 'Created',
      format: (date) => new Date(date).toLocaleDateString()
    },
  ];

  return (
    <div className="text-shadow-strong page-transition">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Organizations</h2>
        <ExportButton
          data={clients}
          fields={exportFields}
          filename="clients"
          label="Export Clients"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {clients.map((client, index) => (
          <div key={client.id} className="stagger-item h-full" style={{ animationDelay: `${index * 60}ms` }}>
            <OrganizationCard client={client} onSelectOrganization={onSelectOrganization} />
          </div>
        ))}
        <div className="stagger-item h-full" style={{ animationDelay: `${clients.length * 60}ms` }}>
            <AddOrganizationCard onClick={onAddOrganization} />
        </div>
      </div>
    </div>
  );
};
