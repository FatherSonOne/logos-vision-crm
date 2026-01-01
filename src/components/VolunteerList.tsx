import React, { useState, useMemo } from 'react';
import type { Volunteer, Client, Project } from '../types';
import { VolunteersMap } from './VolunteersMap';
import { MailIcon, LocationMarkerIcon, ClockIcon, PlusIcon, FolderIcon, BuildingIcon } from './icons';
import { ExportButton, type ExportField } from './export/ExportButton';

interface VolunteerListProps {
  volunteers: Volunteer[];
  clients: Client[];
  projects: Project[];
  onAddVolunteer: () => void;
}

const VolunteerCard: React.FC<{ 
    volunteer: Volunteer; 
    getProjectName: (id: string) => string;
    getClientName: (id: string) => string;
}> = ({ volunteer, getProjectName, getClientName }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-600 transition-all transform hover:scale-[1.02] flex flex-col group">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate w-full group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">{volunteer.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{volunteer.skills.join(', ')}</p>
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 flex-grow mb-4">
            <div className="flex items-center gap-2">
                <MailIcon />
                <a href={`mailto:${volunteer.email}`} className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 truncate transition-colors">{volunteer.email}</a>
            </div>
            <div className="flex items-center gap-2">
                <LocationMarkerIcon />
                <span className="text-gray-600 dark:text-gray-400">{volunteer.location}</span>
            </div>
             <div className="flex items-center gap-2">
                <ClockIcon />
                <span className="text-gray-600 dark:text-gray-400">{volunteer.availability}</span>
            </div>
        </div>
        <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">Assignments</h4>
            <div className="space-y-1 text-xs">
                {volunteer.assignedProjectIds.map(id => (
                    <div key={`proj-${id}`} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 p-1.5 rounded">
                        <FolderIcon />
                        <span className="text-gray-700 dark:text-gray-300">{getProjectName(id)}</span>
                    </div>
                ))}
                {volunteer.assignedClientIds.map(id => (
                     <div key={`client-${id}`} className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 p-1.5 rounded">
                        <BuildingIcon />
                        <span className="text-rose-700 dark:text-rose-400">{getClientName(id)}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const AddVolunteerCard: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-gray-300 dark:border-slate-600 p-6 hover:border-rose-500 dark:hover:border-rose-400 hover:shadow-xl transition-all transform hover:scale-[1.02] text-center flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 group"
    >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PlusIcon className="text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400">Add Volunteer</h3>
    </button>
);


export const VolunteerList: React.FC<VolunteerListProps> = ({ volunteers, clients, projects, onAddVolunteer }) => {
    const [clientFilter, setClientFilter] = useState<string>('all');
    const [projectFilter, setProjectFilter] = useState<string>('all');
    
    const filteredVolunteers = useMemo(() => {
        return volunteers.filter(volunteer => {
            const clientMatch = clientFilter === 'all' || volunteer.assignedClientIds.includes(clientFilter);
            const projectMatch = projectFilter === 'all' || volunteer.assignedProjectIds.includes(projectFilter);
            return clientMatch && projectMatch;
        });
    }, [volunteers, clientFilter, projectFilter]);
    
    const getProjectName = (id: string) => projects.find(p => p.id === id)?.name || 'Unknown Project';
    const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';

    const exportFields: ExportField[] = [
      { key: 'name', label: 'Volunteer Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'location', label: 'Location' },
      {
        key: 'skills',
        label: 'Skills',
        format: (skills) => skills.join(' | ')
      },
      { key: 'availability', label: 'Availability' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 relative aspect-[4/1] overflow-hidden">
                <VolunteersMap 
                    volunteers={filteredVolunteers}
                    clients={clients}
                    selectedClientId={clientFilter !== 'all' ? clientFilter : null}
                />
            </div>
            
            <div>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Volunteers</h2>
                    <div className="flex items-center gap-4">
                        <ExportButton
                            data={filteredVolunteers}
                            fields={exportFields}
                            filename="volunteers"
                        />
                        <select
                            value={clientFilter}
                            onChange={(e) => setClientFilter(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                        >
                            <option value="all">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                         <select
                            value={projectFilter}
                            onChange={(e) => setProjectFilter(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-colors"
                        >
                            <option value="all">All Projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredVolunteers.map((volunteer, index) => (
                        <div key={volunteer.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 50}ms` }}>
                            <VolunteerCard 
                                volunteer={volunteer}
                                getProjectName={getProjectName}
                                getClientName={getClientName}
                            />
                        </div>
                    ))}
                    <div className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${filteredVolunteers.length * 50}ms` }}>
                        <AddVolunteerCard onClick={onAddVolunteer} />
                    </div>
                 </div>
            </div>
        </div>
    );
};
