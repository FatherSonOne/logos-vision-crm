import React, { useMemo } from 'react';
import type { Project, Client, TeamMember } from '../types';
import { UsersIcon, DollarSignIcon, TrendingUpIcon, AlertCircleIcon, ClockIcon } from './icons';
import { ProjectStatus } from '../types';

interface ProjectResourcesProps {
  projects: Project[];
  clients: Client[];
  teamMembers: TeamMember[];
  onSelectProject: (id: string) => void;
}

export const ProjectResources: React.FC<ProjectResourcesProps> = ({
  projects,
  clients,
  teamMembers,
  onSelectProject
}) => {
  const resourceData = useMemo(() => {
    // Team allocation
    const teamAllocation: Record<string, { member: TeamMember; projectCount: number; projects: Project[] }> = {};
    
    projects.forEach(project => {
      project.teamMemberIds.forEach(memberId => {
        if (!teamAllocation[memberId]) {
          const member = teamMembers.find(tm => tm.id === memberId);
          if (member) {
            teamAllocation[memberId] = { member, projectCount: 0, projects: [] };
          }
        }
        if (teamAllocation[memberId]) {
          teamAllocation[memberId].projectCount++;
          teamAllocation[memberId].projects.push(project);
        }
      });
    });

    // Budget calculations (using mock data since budget isn't in the Project type)
    const totalBudget = projects.length * 50000; // Mock: $50k per project
    const spentBudget = projects.length * 35000; // Mock: $35k spent per project
    const budgetUtilization = Math.round((spentBudget / totalBudget) * 100);

    // Project resource intensity
    const highResource = projects.filter(p => p.teamMemberIds.length > 4).length;
    const mediumResource = projects.filter(p => p.teamMemberIds.length >= 2 && p.teamMemberIds.length <= 4).length;
    const lowResource = projects.filter(p => p.teamMemberIds.length < 2).length;

    return {
      teamAllocation: Object.values(teamAllocation).sort((a, b) => b.projectCount - a.projectCount),
      totalBudget,
      spentBudget,
      budgetUtilization,
      highResource,
      mediumResource,
      lowResource
    };
  }, [projects, teamMembers]);

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }> = ({ icon, label, value, subtitle, color }) => (
    <div className={`${color} p-6 rounded-xl border border-white/20 shadow-lg`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 rounded-lg bg-white/20">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{label}</div>
      {subtitle && (
        <div className="text-xs text-slate-600 dark:text-slate-400">{subtitle}</div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Resources & Budget</h1>
        <p className="text-slate-600 dark:text-slate-400">Team allocation and budget tracking</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<UsersIcon />}
          label="Team Members"
          value={resourceData.teamAllocation.length}
          subtitle="Active members"
          color="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20"
        />
        <StatCard
          icon={<DollarSignIcon />}
          label="Total Budget"
          value={`$${(resourceData.totalBudget / 1000).toFixed(0)}k`}
          subtitle={`$${(resourceData.spentBudget / 1000).toFixed(0)}k spent`}
          color="bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20"
        />
        <StatCard
          icon={<TrendingUpIcon />}
          label="Budget Utilization"
          value={`${resourceData.budgetUtilization}%`}
          subtitle={resourceData.budgetUtilization > 85 ? 'High usage' : 'Within limits'}
          color="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20"
        />
        <StatCard
          icon={<AlertCircleIcon className="h-6 w-6" />}
          label="High Resource"
          value={resourceData.highResource}
          subtitle={`${resourceData.mediumResource} medium, ${resourceData.lowResource} low`}
          color="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Allocation */}
        <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <UsersIcon />
            Team Allocation
          </h2>
          <div className="space-y-3">
            {resourceData.teamAllocation.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                No team members assigned to projects
              </p>
            ) : (
              resourceData.teamAllocation.map(({ member, projectCount, projects }) => {
                const activeProjects = projects.filter(p => p.status === ProjectStatus.InProgress).length;
                const workload = projectCount >= 5 ? 'high' : projectCount >= 3 ? 'medium' : 'low';
                
                return (
                  <div
                    key={member.id}
                    className="bg-white/30 dark:bg-slate-800/30 p-4 rounded-lg border border-white/20"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                          {member.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{member.role}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        workload === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                        workload === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' :
                        'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                      }`}>
                        {workload} load
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <span>{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
                      <span>{activeProjects} active</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Project Resource Breakdown */}
        <div className="bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-xl border border-white/20">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Project Resources</h2>
          <div className="space-y-4">
            {projects.slice(0, 10).map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const intensity = project.teamMemberIds.length > 4 ? 'high' : 
                               project.teamMemberIds.length >= 2 ? 'medium' : 'low';
              
              return (
                <div
                  key={project.id}
                  className="bg-white/30 dark:bg-slate-800/30 p-4 rounded-lg border border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                  onClick={() => onSelectProject(project.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {project.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0 ${
                      intensity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' :
                      intensity === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' :
                      'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {intensity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    {client?.name || 'Unknown Client'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <UsersIcon />
                      <span>{project.teamMemberIds.length} member{project.teamMemberIds.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClockIcon />
                      <span>{new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
