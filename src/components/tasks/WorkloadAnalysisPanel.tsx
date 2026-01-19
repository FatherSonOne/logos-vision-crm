// Workload Analysis Panel Component
// Displays team capacity, overload warnings, and AI-powered reassignment suggestions

import React, { useState } from 'react';
import { Users, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { WorkloadAnalysisResult } from '../../services/taskAiService';

export interface WorkloadAnalysisPanelProps {
  analysis: WorkloadAnalysisResult | null;
  onReassign?: (taskId: string, fromUserId: string, toUserId: string) => Promise<void>;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const WorkloadAnalysisPanel: React.FC<WorkloadAnalysisPanelProps> = ({
  analysis,
  onReassign,
  onRefresh,
  isLoading = false,
  className = '',
}) => {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [reassignmentInProgress, setReassignmentInProgress] = useState<string | null>(null);

  // Handle task reassignment
  const handleReassign = async (taskId: string, fromUserId: string, toUserId: string) => {
    if (!onReassign) return;

    setReassignmentInProgress(taskId);
    try {
      await onReassign(taskId, fromUserId, toUserId);
    } finally {
      setReassignmentInProgress(null);
    }
  };

  // Render empty state
  if (!analysis && !isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Team Workload Analysis</h3>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Analyze with AI
            </button>
          )}
        </div>
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Click "Analyze with AI" to get workload insights</p>
        </div>
      </div>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-600">Analyzing team workload...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  const { overloadedMembers, underutilizedMembers, insights, recommendations } = analysis;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Team Workload Analysis</h3>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
              AI-Powered
            </span>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overloaded Members Section */}
        {overloadedMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-gray-900">Overloaded Team Members</h4>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {overloadedMembers.length}
              </span>
            </div>

            <div className="space-y-3">
              {overloadedMembers.map((member) => (
                <div
                  key={member.userId}
                  className="border border-red-200 bg-red-50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">
                        {member.assignedHours.toFixed(1)}h / {member.capacity}h capacity
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-red-600">
                        {member.overloadPercentage.toFixed(0)}%
                      </div>
                      <div className="text-xs text-red-600">overloaded</div>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-3">
                    <div className="h-2 bg-red-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${Math.min(member.overloadPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Reassignment Suggestions */}
                  {member.suggestedReassignments.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedMember(expandedMember === member.userId ? null : member.userId)}
                        className="flex items-center gap-2 text-sm text-red-700 font-medium mb-2 hover:underline"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {member.suggestedReassignments.length} AI Suggestions
                      </button>

                      {expandedMember === member.userId && (
                        <div className="space-y-2 pl-5">
                          {member.suggestedReassignments.map((reassignment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between bg-white rounded p-2 text-sm"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700">{reassignment.taskTitle}</span>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                                <span className="text-blue-600 font-medium">
                                  {reassignment.suggestedNewAssignee}
                                </span>
                              </div>
                              {onReassign && (
                                <button
                                  onClick={() => handleReassign(reassignment.taskId, member.userId, 'suggested-user-id')}
                                  disabled={reassignmentInProgress === reassignment.taskId}
                                  className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {reassignmentInProgress === reassignment.taskId ? 'Reassigning...' : 'Reassign'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Underutilized Members Section */}
        {underutilizedMembers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-gray-900">Available Capacity</h4>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                {underutilizedMembers.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {underutilizedMembers.map((member) => (
                <div
                  key={member.userId}
                  className="border border-green-200 bg-green-50 rounded-lg p-3"
                >
                  <div className="font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-green-700 mt-1">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    {member.availableHours.toFixed(1)}h available
                  </div>
                  {member.suggestedTasks.length > 0 && (
                    <div className="text-xs text-gray-600 mt-2">
                      Can take {member.suggestedTasks.length} more tasks
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights Section */}
        {insights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h4 className="font-semibold text-gray-900">Key Insights</h4>
            </div>
            <ul className="space-y-2">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <h4 className="font-semibold text-gray-900">Recommendations</h4>
            </div>
            <ul className="space-y-2">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-purple-500 mt-1">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {overloadedMembers.length === 0 && underutilizedMembers.length === 0 && (
          <div className="text-center py-6">
            <Users className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
            <div className="text-gray-700 font-medium">Team Workload is Balanced</div>
            <div className="text-sm text-gray-500 mt-1">
              No overloaded or underutilized team members detected
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkloadAnalysisPanel;
