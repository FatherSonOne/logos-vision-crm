import React, { useState, useMemo, useEffect } from 'react';
import type { Activity, Client, Project, TeamMember } from '../types';
import { ActivityType, ActivityStatus } from '../types';
import { ExportButton, type ExportField } from './export/ExportButton';
import { PlusIcon, PhoneIcon, MailIcon, UsersIcon, DocumentTextIcon, PencilIcon, TrashIcon, SparklesIcon } from './icons';
import { Skeleton } from '../src/components/ui/Skeleton';

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

const ActivityItemSkeleton: React.FC = () => (
    <div className="flex space-x-4">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 bg-white/20 dark:bg-slate-900/40 p-4 rounded-lg border border-white/20">
            <div className="flex justify-between items-start">
                <div className="w-3/4 space-y-2">
                    <Skeleton className="h-5 w-3/5" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </div>
    </div>
);

const ActivityTypeIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const icons: Record<ActivityType, React.ReactNode> = {
        [ActivityType.Call]: <PhoneIcon />,
        [ActivityType.Email]: <MailIcon />,
        [ActivityType.Meeting]: <UsersIcon />,
        [ActivityType.Note]: <DocumentTextIcon />
    }
    
    const colors: Record<ActivityType, string> = {
        [ActivityType.Call]: 'bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300',
        [ActivityType.Email]: 'bg-info-100 text-info-700 dark:bg-info-900/50 dark:text-info-300',
        [ActivityType.Meeting]: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/50 dark:text-secondary-300',
        [ActivityType.Note]: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
    }
    
    return <div className={`h-10 w-10 rounded-full flex items-center justify-center text-slate-500 flex-shrink-0 shadow-sm ${colors[type]}`}>{icons[type] || <DocumentTextIcon />}</div>
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, projects, clients, teamMembers, onLogActivity, onEdit, onDelete, onProcessMeeting }) => {
    const [typeFilter, setTypeFilter] = useState('all');
    const [memberFilter, setMemberFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    
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

    const renderHeader = () => (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Activity Feed</h2>
                  <p className="text-slate-600 mt-1 dark:text-slate-300">A chronological log of all team and client interactions.</p>
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
                        className="flex items-center bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md"
                    >
                        <PlusIcon />
                        Log Activity
                    </button>
                </div>
            </div>
            
            <div className="flex items-center gap-4 mb-6 p-4 bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl rounded-lg border border-white/20 shadow-lg">
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-white/50 dark:bg-black/30 border-white/30 dark:border-white/10 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                    <option value="all">All Types</option>
                    {Object.values(ActivityType).map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="bg-white/50 dark:bg-black/30 border-white/30 dark:border-white/10 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
                >
                    <option value="all">All Team Members</option>
                    {teamMembers.map(tm => <option key={tm.id} value={tm.id}>{tm.name}</option>)}
                </select>
            </div>
        </>
    );

    return (
        <div className="text-shadow-strong">
            {renderHeader()}

            {isLoading ? (
                <div className="space-y-6">
                    {Array.from({ length: 5 }).map((_, i) => <ActivityItemSkeleton key={i} />)}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredActivities.map(activity => (
                        <div key={activity.id} className="flex space-x-4">
                            <ActivityTypeIcon type={activity.type} />
                            <div 
                                onClick={() => onEdit(activity)}
                                className="flex-1 bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl p-5 rounded-xl border border-white/30 dark:border-slate-700/50 group relative cursor-pointer hover:border-primary-400/50 dark:hover:border-primary-500/50 card-lift-subtle"
                            >
                                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {activity.type === ActivityType.Meeting && activity.status === ActivityStatus.Completed && onProcessMeeting && (
                                        <button onClick={(e) => { e.stopPropagation(); onProcessMeeting(activity); }} title="AI Meeting Assistant" className="p-1.5 text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md dark:text-slate-400 transition-colors duration-200">
                                            <SparklesIcon />
                                        </button>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); onEdit(activity); }} title="Edit Activity" className="p-1.5 text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md dark:text-slate-400 transition-colors duration-200">
                                        <PencilIcon />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} title="Delete Activity" className="p-1.5 text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-md dark:text-slate-400 transition-colors duration-200">
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{activity.title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Logged by {findName(activity.createdById, 'teamMember')} on {new Date(activity.activityDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${activity.status === 'Completed' ? 'bg-success-100 text-success-800 dark:bg-success-900/50 dark:text-success-300' : 'bg-warning-100 text-warning-800 dark:bg-warning-900/50 dark:text-warning-300'}`}>
                                        {activity.status}
                                    </span>
                                </div>

                                {activity.notes && (
                                    <p className="text-sm text-slate-700 mt-3 border-l-2 border-primary-300 dark:border-primary-700 pl-3 whitespace-pre-wrap dark:text-slate-300">{activity.notes}</p>
                                )}

                                <div className="text-xs text-slate-600 mt-3 flex flex-wrap gap-x-4 gap-y-1 dark:text-slate-400">
                                    {activity.clientId && <span>Client: <span className="font-medium text-primary-600 dark:text-primary-400">{findName(activity.clientId, 'client')}</span></span>}
                                    {activity.projectId && <span>Project: <span className="font-medium text-primary-600 dark:text-primary-400">{findName(activity.projectId, 'project')}</span></span>}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredActivities.length === 0 && (
                        <div className="text-center p-12 bg-white/25 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl border border-dashed border-white/30 dark:border-slate-700/50 text-slate-600 dark:text-slate-400">
                            <p className="font-semibold">No activities found</p>
                            <p className="text-sm">Try adjusting your filters or logging a new activity.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
