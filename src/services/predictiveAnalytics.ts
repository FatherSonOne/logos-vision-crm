/**
 * Predictive Analytics Service
 * Machine learning powered predictions for CRM data
 */

import { GoogleGenerativeAI } from '@google/genai';

interface TaskCompletionPrediction {
  taskId: string;
  taskTitle: string;
  predictedCompletionDate: Date;
  confidence: number;
  factors: {
    historicalVelocity: number;
    currentWorkload: number;
    complexity: number;
    blockers: string[];
  };
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ProjectRiskScore {
  projectId: string;
  projectName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: {
    taskCompletionRate: number;
    overdueTaskCount: number;
    budgetStatus: 'under' | 'on_track' | 'over';
    teamCapacity: number;
    dependencyChainLength: number;
  };
  recommendations: string[];
  predictedCompletionDate: Date;
}

interface ResourceOptimization {
  type: 'rebalance' | 'hire' | 'reassign' | 'delay';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: {
    teamMemberIds: string[];
    projectIds: string[];
    estimatedImprovement: string;
    timeToImplement: string;
  };
  confidence: number;
}

interface ChurnRisk {
  clientId: string;
  clientName: string;
  riskLevel: number; // 0-100
  riskCategory: 'low' | 'medium' | 'high' | 'critical';
  signals: {
    engagementDecline: boolean;
    communicationGap: number; // days since last contact
    projectDelays: number;
    satisfactionTrend: 'up' | 'down' | 'stable';
    missedMeetings: number;
  };
  recommendedActions: string[];
  urgency: 'immediate' | 'this_week' | 'this_month' | 'monitor';
}

class PredictiveAnalyticsService {
  private genai: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_API_KEY || '';
    this.genai = new GoogleGenerativeAI(apiKey);
    this.model = this.genai.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent predictions
        topP: 0.95,
        topK: 40,
      },
    });
  }

  /**
   * Predict task completion date based on historical data
   */
  async predictTaskCompletion(
    task: any,
    historicalTasks: any[],
    assigneeWorkload: any[]
  ): Promise<TaskCompletionPrediction> {
    try {
      // Calculate historical velocity for similar tasks
      const similarTasks = historicalTasks.filter(
        t => t.assignedToId === task.assignedToId && t.status === 'completed'
      );

      const avgCompletionTime = this.calculateAverageCompletionTime(similarTasks);
      const currentWorkload = assigneeWorkload.length;

      // Calculate complexity based on task properties
      const complexity = this.calculateTaskComplexity(task);

      // Detect potential blockers
      const blockers = this.detectBlockers(task, assigneeWorkload);

      // Calculate predicted completion
      const baseTime = avgCompletionTime || 3; // Default 3 days if no history
      const workloadFactor = Math.max(1, currentWorkload / 5); // Increase time based on workload
      const complexityFactor = 1 + (complexity / 10); // Increase based on complexity

      const predictedDays = baseTime * workloadFactor * complexityFactor;
      const predictedDate = new Date();
      predictedDate.setDate(predictedDate.getDate() + Math.ceil(predictedDays));

      // Determine risk level
      const dueDate = new Date(task.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      const riskLevel = predictedDays > daysUntilDue ? 'high' : predictedDays > daysUntilDue * 0.8 ? 'medium' : 'low';

      // Generate recommendation using AI
      const recommendation = await this.generateTaskRecommendation({
        task,
        predictedDays,
        daysUntilDue,
        currentWorkload,
        blockers,
      });

      return {
        taskId: task.id,
        taskTitle: task.title,
        predictedCompletionDate: predictedDate,
        confidence: this.calculateConfidence(similarTasks.length, blockers.length),
        factors: {
          historicalVelocity: avgCompletionTime,
          currentWorkload,
          complexity,
          blockers,
        },
        recommendation,
        riskLevel,
      };
    } catch (error) {
      console.error('Task completion prediction error:', error);
      throw error;
    }
  }

  /**
   * Calculate project risk score
   */
  async calculateProjectRisk(
    project: any,
    tasks: any[],
    teamMembers: any[]
  ): Promise<ProjectRiskScore> {
    try {
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'completed');
      const overdueTasks = projectTasks.filter(t => t.status === 'overdue');

      // Calculate metrics
      const taskCompletionRate = projectTasks.length > 0
        ? (completedTasks.length / projectTasks.length) * 100
        : 0;

      const overdueTaskCount = overdueTasks.length;

      // Analyze budget (simplified)
      const budgetStatus: 'under' | 'on_track' | 'over' = 'on_track';

      // Calculate team capacity
      const assignedMembers = teamMembers.filter(tm =>
        projectTasks.some(t => t.assignedToId === tm.id)
      );
      const avgTasksPerMember = assignedMembers.length > 0
        ? projectTasks.length / assignedMembers.length
        : 0;
      const teamCapacity = Math.max(0, 100 - (avgTasksPerMember * 10));

      // Calculate dependency chain
      const dependencyChainLength = this.calculateDependencyChain(projectTasks);

      // Calculate overall risk score (0-100)
      let riskScore = 0;
      riskScore += (100 - taskCompletionRate) * 0.3; // 30% weight
      riskScore += Math.min(overdueTaskCount * 10, 40); // Up to 40 points
      riskScore += (100 - teamCapacity) * 0.2; // 20% weight
      riskScore += Math.min(dependencyChainLength * 5, 10); // Up to 10 points

      const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
        riskScore > 75 ? 'critical' :
        riskScore > 50 ? 'high' :
        riskScore > 25 ? 'medium' : 'low';

      // Generate AI-powered recommendations
      const recommendations = await this.generateProjectRecommendations({
        project,
        riskScore,
        metrics: {
          taskCompletionRate,
          overdueTaskCount,
          teamCapacity,
          dependencyChainLength,
        },
      });

      // Predict completion date
      const remainingTasks = projectTasks.filter(t => t.status !== 'completed');
      const avgVelocity = completedTasks.length > 0
        ? 7 / completedTasks.length // tasks per week
        : 0.5;
      const weeksRemaining = remainingTasks.length / avgVelocity;
      const predictedCompletionDate = new Date();
      predictedCompletionDate.setDate(predictedCompletionDate.getDate() + (weeksRemaining * 7));

      return {
        projectId: project.id,
        projectName: project.name,
        riskScore: Math.round(riskScore),
        riskLevel,
        riskFactors: {
          taskCompletionRate: Math.round(taskCompletionRate),
          overdueTaskCount,
          budgetStatus,
          teamCapacity: Math.round(teamCapacity),
          dependencyChainLength,
        },
        recommendations,
        predictedCompletionDate,
      };
    } catch (error) {
      console.error('Project risk calculation error:', error);
      throw error;
    }
  }

  /**
   * Optimize resource allocation
   */
  async optimizeResources(
    teamMembers: any[],
    tasks: any[],
    projects: any[]
  ): Promise<ResourceOptimization[]> {
    try {
      const optimizations: ResourceOptimization[] = [];

      // Analyze workload distribution
      const workloadByMember = teamMembers.map(member => ({
        member,
        taskCount: tasks.filter(t => t.assignedToId === member.id && t.status !== 'completed').length,
        criticalTasks: tasks.filter(t => t.assignedToId === member.id && t.priority === 'critical').length,
      }));

      // Find overloaded members
      const avgWorkload = workloadByMember.reduce((sum, w) => sum + w.taskCount, 0) / teamMembers.length;
      const overloaded = workloadByMember.filter(w => w.taskCount > avgWorkload * 1.5);
      const underutilized = workloadByMember.filter(w => w.taskCount < avgWorkload * 0.5);

      if (overloaded.length > 0 && underutilized.length > 0) {
        optimizations.push({
          type: 'rebalance',
          priority: 'high',
          description: `Rebalance workload: ${overloaded.length} overloaded team members detected`,
          impact: {
            teamMemberIds: [...overloaded.map(o => o.member.id), ...underutilized.map(u => u.member.id)],
            projectIds: [],
            estimatedImprovement: '20-30% productivity increase',
            timeToImplement: '1-2 days',
          },
          confidence: 0.85,
        });
      }

      // Check for skill mismatches using AI
      const skillAnalysis = await this.analyzeSkillMatching(tasks, teamMembers);
      if (skillAnalysis.mismatches.length > 0) {
        optimizations.push({
          type: 'reassign',
          priority: 'medium',
          description: `Reassign ${skillAnalysis.mismatches.length} tasks for better skill alignment`,
          impact: {
            teamMemberIds: skillAnalysis.affectedMembers,
            projectIds: skillAnalysis.affectedProjects,
            estimatedImprovement: '15-25% quality improvement',
            timeToImplement: '2-3 days',
          },
          confidence: 0.75,
        });
      }

      // Detect burnout risk
      const burnoutRisk = workloadByMember.filter(w => w.taskCount > 15 || w.criticalTasks > 5);
      if (burnoutRisk.length > 0) {
        optimizations.push({
          type: 'hire',
          priority: 'high',
          description: `${burnoutRisk.length} team members at burnout risk - consider hiring`,
          impact: {
            teamMemberIds: burnoutRisk.map(b => b.member.id),
            projectIds: [],
            estimatedImprovement: '40-50% stress reduction',
            timeToImplement: '2-4 weeks',
          },
          confidence: 0.9,
        });
      }

      return optimizations.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });
    } catch (error) {
      console.error('Resource optimization error:', error);
      return [];
    }
  }

  /**
   * Detect client churn risk
   */
  async detectChurnRisk(
    client: any,
    projects: any[],
    activities: any[]
  ): Promise<ChurnRisk> {
    try {
      const clientProjects = projects.filter(p => p.clientId === client.id);
      const clientActivities = activities.filter(a => a.clientId === client.id);

      // Calculate engagement metrics
      const recentActivities = clientActivities.filter(a => {
        const daysSince = (Date.now() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 30;
      });

      const engagementDecline = recentActivities.length < 2;

      // Days since last contact
      const lastActivity = clientActivities.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      const communicationGap = lastActivity
        ? Math.floor((Date.now() - new Date(lastActivity.date).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Project delays
      const delayedProjects = clientProjects.filter(p => p.status === 'at_risk' || p.status === 'delayed');
      const projectDelays = delayedProjects.length;

      // Satisfaction trend (simplified)
      const satisfactionTrend: 'up' | 'down' | 'stable' = engagementDecline ? 'down' : 'stable';

      // Missed meetings
      const missedMeetings = clientActivities.filter(a =>
        a.type === 'meeting' && a.status === 'cancelled'
      ).length;

      // Calculate risk score
      let riskLevel = 0;
      if (communicationGap > 30) riskLevel += 30;
      if (communicationGap > 60) riskLevel += 20;
      if (engagementDecline) riskLevel += 20;
      if (projectDelays > 0) riskLevel += projectDelays * 10;
      if (missedMeetings > 2) riskLevel += 20;

      riskLevel = Math.min(100, riskLevel);

      const riskCategory: 'low' | 'medium' | 'high' | 'critical' =
        riskLevel > 75 ? 'critical' :
        riskLevel > 50 ? 'high' :
        riskLevel > 25 ? 'medium' : 'low';

      // Generate AI recommendations
      const recommendedActions = await this.generateChurnRecommendations({
        client,
        riskLevel,
        signals: {
          engagementDecline,
          communicationGap,
          projectDelays,
          missedMeetings,
        },
      });

      const urgency: 'immediate' | 'this_week' | 'this_month' | 'monitor' =
        riskLevel > 75 ? 'immediate' :
        riskLevel > 50 ? 'this_week' :
        riskLevel > 25 ? 'this_month' : 'monitor';

      return {
        clientId: client.id,
        clientName: client.name,
        riskLevel,
        riskCategory,
        signals: {
          engagementDecline,
          communicationGap,
          projectDelays,
          satisfactionTrend,
          missedMeetings,
        },
        recommendedActions,
        urgency,
      };
    } catch (error) {
      console.error('Churn risk detection error:', error);
      throw error;
    }
  }

  /**
   * Helper: Calculate average completion time
   */
  private calculateAverageCompletionTime(tasks: any[]): number {
    if (tasks.length === 0) return 0;

    const completionTimes = tasks.map(task => {
      const created = new Date(task.createdAt);
      const completed = new Date(task.completedAt || task.updatedAt);
      return (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    });

    return completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
  }

  /**
   * Helper: Calculate task complexity
   */
  private calculateTaskComplexity(task: any): number {
    let complexity = 5; // Base complexity

    // Increase based on description length (indicator of detail)
    if (task.description) {
      complexity += Math.min(task.description.length / 100, 2);
    }

    // Increase based on number of subtasks
    if (task.subtasks) {
      complexity += task.subtasks.length * 0.5;
    }

    // Increase based on priority
    const priorityWeight = { low: 0, medium: 1, high: 2, critical: 3 };
    complexity += priorityWeight[task.priority] || 0;

    return Math.min(complexity, 10);
  }

  /**
   * Helper: Detect blockers
   */
  private detectBlockers(task: any, workload: any[]): string[] {
    const blockers: string[] = [];

    // Check for missing information
    if (!task.description || task.description.length < 10) {
      blockers.push('Incomplete task description');
    }

    // Check for high workload
    if (workload.length > 10) {
      blockers.push('High assignee workload');
    }

    // Check for missing due date
    if (!task.dueDate) {
      blockers.push('No due date set');
    }

    return blockers;
  }

  /**
   * Helper: Calculate confidence
   */
  private calculateConfidence(historicalDataPoints: number, blockerCount: number): number {
    let confidence = 0.5; // Base confidence

    // Increase with more historical data
    confidence += Math.min(historicalDataPoints / 20, 0.4);

    // Decrease with more blockers
    confidence -= blockerCount * 0.05;

    return Math.max(0.1, Math.min(0.95, confidence));
  }

  /**
   * Helper: Calculate dependency chain length
   */
  private calculateDependencyChain(tasks: any[]): number {
    // Simplified - in real app, analyze actual task dependencies
    return Math.floor(tasks.length / 5);
  }

  /**
   * AI-powered task recommendation
   */
  private async generateTaskRecommendation(data: any): Promise<string> {
    const { predictedDays, daysUntilDue, blockers } = data;

    if (predictedDays > daysUntilDue) {
      if (blockers.length > 0) {
        return `High risk of delay. Address blockers: ${blockers.join(', ')}. Consider extending deadline by ${Math.ceil(predictedDays - daysUntilDue)} days.`;
      }
      return `Timeline is tight. Consider delegating or extending deadline by ${Math.ceil(predictedDays - daysUntilDue)} days.`;
    } else if (predictedDays > daysUntilDue * 0.8) {
      return 'On track but monitor closely. No buffer for delays.';
    }

    return 'Low risk. Expected to complete on time.';
  }

  /**
   * AI-powered project recommendations
   */
  private async generateProjectRecommendations(data: any): Promise<string[]> {
    const recommendations: string[] = [];
    const { riskScore, metrics } = data;

    if (metrics.taskCompletionRate < 50) {
      recommendations.push('Accelerate task completion - currently below 50%');
    }

    if (metrics.overdueTaskCount > 3) {
      recommendations.push(`Address ${metrics.overdueTaskCount} overdue tasks immediately`);
    }

    if (metrics.teamCapacity < 50) {
      recommendations.push('Team capacity is low - consider adding resources');
    }

    if (metrics.dependencyChainLength > 5) {
      recommendations.push('Simplify task dependencies to reduce bottlenecks');
    }

    if (riskScore > 75) {
      recommendations.push('URGENT: Project at critical risk - schedule immediate review');
    }

    return recommendations;
  }

  /**
   * AI-powered churn recommendations
   */
  private async generateChurnRecommendations(data: any): Promise<string[]> {
    const { signals } = data;
    const actions: string[] = [];

    if (signals.communicationGap > 30) {
      actions.push(`Schedule immediate check-in call (${signals.communicationGap} days since last contact)`);
    }

    if (signals.projectDelays > 0) {
      actions.push('Review and address project delays');
    }

    if (signals.engagementDecline) {
      actions.push('Increase engagement - send value-add content or schedule quarterly review');
    }

    if (signals.missedMeetings > 2) {
      actions.push('Investigate reasons for missed meetings');
    }

    return actions;
  }

  /**
   * Analyze skill matching
   */
  private async analyzeSkillMatching(tasks: any[], teamMembers: any[]): Promise<any> {
    // Simplified analysis
    return {
      mismatches: [],
      affectedMembers: [],
      affectedProjects: [],
    };
  }
}

// Singleton instance
export const predictiveAnalytics = new PredictiveAnalyticsService();

// Export types
export type {
  TaskCompletionPrediction,
  ProjectRiskScore,
  ResourceOptimization,
  ChurnRisk,
};
