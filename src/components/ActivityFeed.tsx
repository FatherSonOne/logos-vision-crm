import React, { useState, useMemo } from 'react';
import type { Activity, Client, Project, TeamMember } from '../types';
import { ActivityType, ActivityStatus } from '../types';
import { ExportButton, type ExportField } from './export/ExportButton';
import { PlusIcon, PhoneIcon, MailIcon, UsersIcon, DocumentTextIcon, PencilIcon, TrashIcon, SparklesIcon } from './icons';

interface ActivityFeedProps {
    activities: Activity[];
    projects: Project[];
    clients: Client[];
    teamMembers: TeamMember[];
    onLogActivity: () => void;
    onEdit: (activity: Activity) => void;
    onDelete: (activityId: string) => void;
    onProcessMeeting?: (activity: Activity) => void;
}

const ActivityTypeIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const icons: Record<ActivityType, React.ReactNode> = {
        [ActivityType.Call]: <PhoneIcon />,
        [ActivityType.Email]: <MailIcon />,
        [ActivityType.Meeting]: <UsersIcon />,
        [ActivityType.Note]: <DocumentTextIcon />
    }
    
    const gradients: Record<ActivityType, string> = {
        [ActivityType.Call]: 'from-blue-500 to-cyan-600',
        [ActivityType.Email]: 'from-purple-500 to-pink-600',
        [ActivityType.Meeting]: 'from-green-500 to-emerald-600',
        [ActivityType.Note]: 'from-orange-500 to-red-600'
    }
    
    return (
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${gradients[type]} flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
            {icons[type] || <DocumentTextIcon />}
        </div>
    );
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, projects, clients, teamMembers, onLogActivity, onEdit, onDelete, onProcessMeeting }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');
    
    const findName = (id: string | undefined | null, type: 'client' | 'project' | 'teamMember') => {
        if (!id) return '';
        switch(type) {
            case 'client': return clients.find(c => c.id === id)?.name;
            case 'project': return projects.find(p => p.id === id)?.name;
            case 'teamMember': return teamMembers.find(m => m.id === id)?.name;
            default: return '';
        }
    }

    const filteredActivities = useMemo(() => {
        return activities.filter(activity => {
            const typeMatch = typeFilter === 'all' || activity.type === typeFilter;
            const memberMatch = memberFilter === 'all' || activity.createdById === memberFilter;
            return typeMatch && memberMatch;
        });
    }, [activities, typeFilter, memberFilter]);

    const exportFields: ExportField[] = [
      { key: 'title', label: 'Activity' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { 
        key: 'activityDate', 
        label: 'Date',
        format: (date) => new Date(date).toLocaleDateString()
      },
      {
        key: 'clientId',
        label: 'Client',
        format: (id) => clients.find(c => c.id === id)?.name || ''
      },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Feed</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">A chronological log of all team and client interactions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButton
                      data={filteredActivities}
                      fields={exportFields}
                      filename="activities"
                      label="Export Activities"
                    />
                    <button 
                        onClick={onLogActivity}
                        className="flex items-center bg-rose-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors shadow-md"
                    >
                        <PlusIcon />
                        Log Activity
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                    <option value="all">All Types</option>
                    {Object.values(ActivityType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                >
                    <option value="all">All Team Members</option>
                    {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                </select>
            </div>

            <div className="space-y-6">
                {filteredActivities.map((activity, index) => (
                    <div key={activity.id} className="flex space-x-4 animate-in fade-in slide-in-from-left" style={{ animationDelay: `${index * 50}ms` }}>
                        <ActivityTypeIcon type={activity.type} />
                        <div 
                            onClick={() => onEdit(activity)}
                            className="flex-1 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 p-4 group relative cursor-pointer hover:shadow-xl hover:border-rose-300 dark:hover:border-rose-600 transition-all"
                        >
                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {activity.type === ActivityType.Meeting && activity.status === ActivityStatus.Completed && onProcessMeeting && (
                                     <button onClick={(e) => { e.stopPropagation(); onProcessMeeting(activity); }} title="AI Meeting Assistant" className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                                        <SparklesIcon />
                                    </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); onEdit(activity); }} title="Edit Activity" className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors">
                                    <PencilIcon />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} title="Delete Activity" className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                                    <TrashIcon />
                                </button>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Logged by {findName(activity.createdById, 'teamMember')} on {new Date(activity.activityDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                    {activity.status}
                                </span>
                            </div>

                            {activity.notes && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 border-l-2 border-gray-200 dark:border-slate-600 pl-3 whitespace-pre-wrap">{activity.notes}</p>
                            )}

                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex flex-wrap gap-x-4 gap-y-1">
                                {activity.clientId && <span>Client: <span className="font-medium text-rose-600 dark:text-rose-400">{findName(activity.clientId, 'client')}</span></span>}
                                {activity.projectId && <span>Project: <span className="font-medium text-rose-600 dark:text-rose-400">{findName(activity.projectId, 'project')}</span></span>}
                            </div>
                        </div>
                    </div>
                ))}
                 {filteredActivities.length === 0 && (
                    <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400">
                        <p className="font-semibold">No activities found</p>
                        <p className="text-sm">Try adjusting your filters or logging a new activity.</p>
                    </div>
                )}
            </div>
        </div>
    );
};