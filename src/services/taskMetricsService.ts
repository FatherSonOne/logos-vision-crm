// Task Metrics Service - Analytics and metrics calculation for tasks
// Provides aggregated metrics, team workload analysis, and performance statistics

import { taskManagementService, ExtendedTask, TaskStatus, Department } from './taskManagementService';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TaskMetrics {
  total: number;
  completed: number;
  overdue: number;
  inProgress: number;
  dueToday: number;
  critical: number;
  completionRate: number; // percentage
}

export interface TeamWorkloadMetrics {
  teamMemberId: string;
  teamMemberName: string;
  department: Department;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalEstimatedHours: number;
  totalSpentHours: number;
  capacityUtilization: number; // percentage
  averageTimePerTask: number; // hours
}

export interface DepartmentMetrics {
  department: Department;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskDuration: number; // hours
}

export interface ProjectMetrics {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  totalEstimatedHours: number;
  totalSpentHours: number;
  estimateAccuracy: number; // percentage (spent vs estimated)
}

export interface TaskCompletionTrend {
  date: string; // YYYY-MM-DD
  completed: number;
  created: number;
  netChange: number;
}

// ============================================
// MAIN SERVICE OBJECT
// ============================================

export const taskMetricsService = {
  /**
   * Calculate overall task metrics
   * @param tasks - Optional array of tasks (if not provided, fetches all)
   */
  async getOverallMetrics(tasks?: ExtendedTask[]): Promise<TaskMetrics> {
    try {
      const allTasks = tasks || await taskManagementService.getAllEnriched();

      const total = allTasks.length;
      const completed = allTasks.filter(t => t.status === 'completed').length;
      const overdue = allTasks.filter(t => t.status === 'overdue').length;
      const inProgress = allTasks.filter(t => t.status === 'in_progress').length;

      // Calculate due today
      const today = new Date().toISOString().split('T')[0];
      const dueToday = allTasks.filter(t => {
        const taskDate = t.dueDate.split('T')[0];
        return taskDate === today && t.status !== 'completed';
      }).length;

      // Calculate critical tasks (high or critical priority, not completed)
      const critical = allTasks.filter(
        t => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'completed'
      ).length;

      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        total,
        completed,
        overdue,
        inProgress,
        dueToday,
        critical,
        completionRate,
      };
    } catch (error) {
      console.error('getOverallMetrics error:', error);
      return {
        total: 0,
        completed: 0,
        overdue: 0,
        inProgress: 0,
        dueToday: 0,
        critical: 0,
        completionRate: 0,
      };
    }
  },

  /**
   * Calculate metrics by status
   * @param tasks - Optional array of tasks
   */
  async getMetricsByStatus(tasks?: ExtendedTask[]): Promise<Record<TaskStatus, number>> {
    try {
      const allTasks = tasks || await taskManagementService.getAllEnriched();

      const metrics: Record<TaskStatus, number> = {
        new: 0,
        assigned: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
      };

      allTasks.forEach(task => {
        metrics[task.status]++;
      });

      return metrics;
    } catch (error) {
      console.error('getMetricsByStatus error:', error);
      return {
        new: 0,
        assigned: 0,
        in_progress: 0,
        completed: 0,
        overdue: 0,
      };
    }
  },

  /**
   * Calculate team workload metrics
   * Groups tasks by assignee and calculates their workload
   */
  async getTeamWorkloadMetrics(tasks?: ExtendedTask[]): Promise<TeamWorkloadMetrics[]> {
    try {
      const allTasks = tasks || await taskManagementService.getAllEnriched();

      // Group tasks by team member
      const tasksByMember = new Map<string, ExtendedTask[]>();

      allTasks.forEach(task => {
        if (task.assignedToId) {
          const existing = tasksByMember.get(task.assignedToId) || [];
          tasksByMember.set(task.assignedToId, [...existing, task]);
        }
      });

      // Calculate metrics for each team member
      const metrics: TeamWorkloadMetrics[] = [];

      tasksByMember.forEach((memberTasks, memberId) => {
        const totalTasks = memberTasks.length;
        const completedTasks = memberTasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = memberTasks.filter(t => t.status === 'in_progress').length;
        const overdueTasks = memberTasks.filter(t => t.status === 'overdue').length;

        const totalEstimatedHours = memberTasks.reduce((sum, t) => sum + t.timeEstimate, 0);
        const totalSpentHours = memberTasks.reduce((sum, t) => sum + t.timeSpent, 0);

        // Assume 40 hours per week as capacity (this could be configurable)
        const weeklyCapacity = 40;
        const capacityUtilization = (totalEstimatedHours / weeklyCapacity) * 100;

        const averageTimePerTask = completedTasks > 0
          ? memberTasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.timeSpent, 0) / completedTasks
          : 0;

        metrics.push({
          teamMemberId: memberId,
          teamMemberName: memberTasks[0]?.assignedToName || 'Unknown',
          department: memberTasks[0]?.department || 'Unassigned',
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          totalEstimatedHours,
          totalSpentHours,
          capacityUtilization,
          averageTimePerTask,
        });
      });

      // Sort by total tasks descending
      return metrics.sort((a, b) => b.totalTasks - a.totalTasks);
    } catch (error) {
      console.error('getTeamWorkloadMetrics error:', error);
      return [];
    }
  },

  /**
   * Calculate department metrics
   * Groups tasks by department and calculates performance
   */
  async getDepartmentMetrics(tasks?: ExtendedTask[]): Promise<DepartmentMetrics[]> {
    try {
      const allTasks = tasks || await taskManagementService.getAllEnriched();

      // Group tasks by department
      const tasksByDept = new Map<Department, ExtendedTask[]>();

      allTasks.forEach(task => {
        const dept = task.department || 'Unassigned';
        const existing = tasksByDept.get(dept) || [];
        tasksByDept.set(dept, [...existing, task]);
      });

      // Calculate metrics for each department
      const metrics: DepartmentMetrics[] = [];

      tasksByDept.forEach((deptTasks, department) => {
        const totalTasks = deptTasks.length;
        const completedTasks = deptTasks.filter(t => t.status === 'completed').length;
        const overdueTasks = deptTasks.filter(t => t.status === 'overdue').length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const completedTasksWithTime = deptTasks.filter(t => t.status === 'completed' && t.timeSpent > 0);
        const averageTaskDuration = completedTasksWithTime.length > 0
          ? completedTasksWithTime.reduce((sum, t) => sum + t.timeSpent, 0) / completedTasksWithTime.length
          : 0;

        metrics.push({
          department,
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate,
          averageTaskDuration,
        });
      });

      // Sort by total tasks descending
      return metrics.sort((a, b) => b.totalTasks - a.totalTasks);
    } catch (error) {
      console.error('getDepartmentMetrics error:', error);
      return [];
    }
  },

  /**
   * Calculate project metrics
   * Groups tasks by project and calculates progress
   */
  async getProjectMetrics(tasks?: ExtendedTask[]): Promise<ProjectMetrics[]> {
    try {
      const allTasks = tasks || await taskManagementService.getAllEnriched();

      // Filter tasks that have a project
      const projectTasks = allTasks.filter(t => t.projectId);

      // Group tasks by project
      const tasksByProject = new Map<string, ExtendedTask[]>();

      projectTasks.forEach(task => {
        if (task.projectId) {
          const existing = tasksByProject.get(task.projectId) || [];
          tasksByProject.set(task.projectId, [...existing, task]);
        }
      });

      // Calculate metrics for each project
      const metrics: ProjectMetrics[] = [];

      tasksByProject.forEach((projTasks, projectId) => {
        const totalTasks = projTasks.length;
        const completedTasks = projTasks.filter(t => t.status === 'completed').length;
        const inProgressTasks = projTasks.filter(t => t.status === 'in_progress').length;
        const overdueTasks = projTasks.filter(t => t.status === 'overdue').length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        const totalEstimatedHours = projTasks.reduce((sum, t) => sum + t.timeEstimate, 0);
        const totalSpentHours = projTasks.reduce((sum, t) => sum + t.timeSpent, 0);

        // Calculate estimate accuracy (how close spent time is to estimated time)
        const estimateAccuracy = totalEstimatedHours > 0
          ? Math.min(100, (totalSpentHours / totalEstimatedHours) * 100)
          : 0;

        metrics.push({
          projectId,
          projectName: projTasks[0]?.projectName || 'Unknown Project',
          totalTasks,
          completedTasks,
          inProgressTasks,
          overdueTasks,
          completionRate,
          totalEstimatedHours,
          totalSpentHours,
          estimateAccuracy,
        });
      });

      // Sort by total tasks descending
      return metrics.sort((a, b) => b.totalTasks - a.totalTasks);
    } catch (error) {
      console.error('getProjectMetrics error:', error);
      return [];
    }
  },

  /**
   * Calculate completion rate for a specific time period
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   */
  async getCompletionRateForPeriod(startDate: string, endDate: string): Promise<number> {
    try {
      const allTasks = await taskManagementService.getAllEnriched();

      // Filter tasks within the period
      const tasksInPeriod = allTasks.filter(task => {
        const createdDate = task.createdAt.split('T')[0];
        return createdDate >= startDate && createdDate <= endDate;
      });

      const total = tasksInPeriod.length;
      const completed = tasksInPeriod.filter(t => t.status === 'completed').length;

      return total > 0 ? (completed / total) * 100 : 0;
    } catch (error) {
      console.error('getCompletionRateForPeriod error:', error);
      return 0;
    }
  },

  /**
   * Get overdue count
   */
  async getOverdueCount(): Promise<number> {
    try {
      const overdueTasks = await taskManagementService.getOverdue();
      return overdueTasks.length;
    } catch (error) {
      console.error('getOverdueCount error:', error);
      return 0;
    }
  },

  /**
   * Calculate average completion time
   * For completed tasks, calculate average time from creation to completion
   */
  async getAverageCompletionTime(): Promise<number> {
    try {
      const allTasks = await taskManagementService.getAllEnriched();
      const completedTasks = allTasks.filter(t => t.status === 'completed' && t.completedAt);

      if (completedTasks.length === 0) return 0;

      const totalDays = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt);
        const completed = new Date(task.completedAt!);
        const days = Math.floor((completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);

      return totalDays / completedTasks.length;
    } catch (error) {
      console.error('getAverageCompletionTime error:', error);
      return 0;
    }
  },

  /**
   * Get top performers (team members with highest completion rates)
   * @param limit - Number of top performers to return
   */
  async getTopPerformers(limit: number = 5): Promise<TeamWorkloadMetrics[]> {
    try {
      const workloadMetrics = await this.getTeamWorkloadMetrics();

      // Sort by completion rate (completed / total)
      return workloadMetrics
        .filter(m => m.totalTasks > 0)
        .sort((a, b) => {
          const aRate = a.completedTasks / a.totalTasks;
          const bRate = b.completedTasks / b.totalTasks;
          return bRate - aRate;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('getTopPerformers error:', error);
      return [];
    }
  },

  /**
   * Get task velocity (tasks completed per week)
   * @param weeks - Number of weeks to analyze
   */
  async getTaskVelocity(weeks: number = 4): Promise<number> {
    try {
      const allTasks = await taskManagementService.getAllEnriched();

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeks * 7));

      // Filter completed tasks in this period
      const completedInPeriod = allTasks.filter(task => {
        if (!task.completedAt) return false;
        const completedDate = new Date(task.completedAt);
        return completedDate >= startDate && completedDate <= endDate;
      });

      return completedInPeriod.length / weeks;
    } catch (error) {
      console.error('getTaskVelocity error:', error);
      return 0;
    }
  },

  /**
   * Get estimate accuracy percentage
   * Compares estimated vs actual time spent
   */
  async getEstimateAccuracy(): Promise<number> {
    try {
      const allTasks = await taskManagementService.getAllEnriched();

      // Filter completed tasks with estimates
      const tasksWithEstimates = allTasks.filter(
        t => t.status === 'completed' && t.timeEstimate > 0 && t.timeSpent > 0
      );

      if (tasksWithEstimates.length === 0) return 0;

      const totalEstimated = tasksWithEstimates.reduce((sum, t) => sum + t.timeEstimate, 0);
      const totalSpent = tasksWithEstimates.reduce((sum, t) => sum + t.timeSpent, 0);

      // Calculate accuracy (closer to 100% means better estimates)
      return totalEstimated > 0 ? Math.min(100, (totalSpent / totalEstimated) * 100) : 0;
    } catch (error) {
      console.error('getEstimateAccuracy error:', error);
      return 0;
    }
  },
};

export default taskMetricsService;
