import React, { useMemo } from 'react';
import { Card, CardTitle, CardContent } from '../ui';
import { TeamMember, Project, TaskStatus } from '../../types';
import { Users, AlertCircle, ArrowRight } from 'lucide-react';

interface ResourceAllocatorWidgetProps {
    teamMembers: TeamMember[];
    projects: Project[];
}

export const ResourceAllocatorWidget: React.FC<ResourceAllocatorWidgetProps> = ({ teamMembers, projects }) => {
    
    const teamStats = useMemo(() => {
        const stats = teamMembers.map(member => {
            const memberTasks = projects.flatMap(p => p.tasks).filter(t => t.teamMemberId === member.id && t.status !== TaskStatus.Done);
            const highPriority = memberTasks.filter(t => (t as any).priority === 'High').length; // Assuming priority exists on task or we infer
            return {
                member,
                taskCount: memberTasks.length,
                highPriorityCount: highPriority,
                load: memberTasks.length // Simplified load metric
            };
        });
        
        const avgLoad = stats.reduce((sum, s) => sum + s.load, 0) / (stats.length || 1);
        return { members: stats, avgLoad };
    }, [teamMembers, projects]);

    const overloadedMembers = teamStats.members.filter(m => m.load > teamStats.avgLoad * 1.5 && m.load > 3);
    const underloadedMembers = teamStats.members.filter(m => m.load < teamStats.avgLoad * 0.5);

    const getLoadColor = (load: number, avg: number) => {
        if (load > avg * 1.5) return 'bg-rose-500';
        if (load > avg * 1.2) return 'bg-amber-500';
        if (load < avg * 0.5) return 'bg-emerald-400';
        return 'bg-indigo-500';
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="p-6 pb-2">
                <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Resource Allocator
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                    {teamStats.members.filter(m => m.load > 0).length} active team members. Avg load: {Math.round(teamStats.avgLoad)} tasks.
                </p>
            </div>
            
            <CardContent className="flex-1 overflow-auto pt-2 space-y-6">
                {/* Visual Load Bars */}
                <div className="space-y-3">
                    {teamStats.members.sort((a,b) => b.load - a.load).slice(0, 5).map(stat => (
                        <div key={stat.member.id}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{stat.member.name}</span>
                                <span className="text-slate-500">{stat.taskCount} tasks</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${getLoadColor(stat.load, teamStats.avgLoad)}`}
                                    style={{ width: `${Math.min((stat.load / (teamStats.avgLoad * 2)) * 100, 100)}%` }} 
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Suggestions */}
                {(overloadedMembers.length > 0 && underloadedMembers.length > 0) && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800">
                         <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-semibold text-xs uppercase tracking-wider">
                            <AlertCircle size={14} /> 
                            Optimization Suggestion
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <img src={overloadedMembers[0].member.profilePicture || `https://ui-avatars.com/api/?name=${overloadedMembers[0].member.name}`} alt="" className="w-6 h-6 rounded-full" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{overloadedMembers[0].member.name.split(' ')[0]}</span>
                            </div>
                            <ArrowRight size={14} className="text-slate-400" />
                            <div className="flex items-center gap-2">
                                <img src={underloadedMembers[0].member.profilePicture || `https://ui-avatars.com/api/?name=${underloadedMembers[0].member.name}`} alt="" className="w-6 h-6 rounded-full" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">{underloadedMembers[0].member.name.split(' ')[0]}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            Consider reassigning {Math.round(overloadedMembers[0].load - teamStats.avgLoad)} tasks to balance workload.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
