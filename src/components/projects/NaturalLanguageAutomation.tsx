import React, { useState, useMemo, useCallback } from 'react';
import { Project, ProjectAutomation, AutomationTrigger, AutomationAction } from '../../types';
import {
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  LightningBoltIcon,
  CheckCircleIcon,
  ExclamationIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '../icons';

interface NaturalLanguageAutomationProps {
  project: Project;
  onUpdateAutomations: (automations: ProjectAutomation[]) => void;
}

// Pattern matching for natural language parsing - using PascalCase enum values
const triggerPatterns: { pattern: RegExp; trigger: AutomationTrigger; extractors?: (match: RegExpMatchArray) => Record<string, any> }[] = [
  { pattern: /when\s+(a\s+)?task\s+(is\s+)?completed?/i, trigger: AutomationTrigger.TaskCompleted },
  { pattern: /when\s+(the\s+)?project\s+(is\s+)?completed?/i, trigger: AutomationTrigger.ProjectCompleted },
  { pattern: /when\s+(the\s+)?project\s+(is\s+)?created/i, trigger: AutomationTrigger.ProjectCreated },
  { pattern: /when\s+(a\s+)?milestone\s+(is\s+)?completed/i, trigger: AutomationTrigger.MilestoneCompleted },
  { pattern: /when\s+(the\s+)?deadline\s+(is\s+)?approaching/i, trigger: AutomationTrigger.DeadlineApproaching },
  { pattern: /when\s+(the\s+)?due\s+date\s+(is\s+)?approaching/i, trigger: AutomationTrigger.DeadlineApproaching },
  { pattern: /when\s+(the\s+)?budget\s+exceeds?\s+(\d+)%/i, trigger: AutomationTrigger.BudgetThreshold, extractors: (m) => ({ threshold: parseInt(m[2]) }) },
  { pattern: /when\s+(the\s+)?budget\s+(is\s+)?over\s+(\d+)%/i, trigger: AutomationTrigger.BudgetThreshold, extractors: (m) => ({ threshold: parseInt(m[3]) }) },
  { pattern: /when\s+(a\s+)?donation\s+(is\s+)?received/i, trigger: AutomationTrigger.DonationReceived },
  { pattern: /when\s+volunteer\s+hours\s+(are\s+)?logged/i, trigger: AutomationTrigger.VolunteerHoursLogged },
];

const actionPatterns: { pattern: RegExp; action: AutomationAction; extractors?: (match: RegExpMatchArray) => Record<string, any> }[] = [
  { pattern: /send\s+(an?\s+)?email\s+to\s+(\w+)/i, action: AutomationAction.SendEmail, extractors: (m) => ({ recipient: m[2] }) },
  { pattern: /send\s+(an?\s+)?email/i, action: AutomationAction.SendEmail },
  { pattern: /notify\s+(the\s+)?team/i, action: AutomationAction.NotifyTeam },
  { pattern: /alert\s+(the\s+)?team/i, action: AutomationAction.NotifyTeam },
  { pattern: /update\s+(the\s+)?status\s+to\s+(\w+)/i, action: AutomationAction.UpdateStatus, extractors: (m) => ({ newStatus: m[2] }) },
  { pattern: /create\s+(a\s+)?task/i, action: AutomationAction.CreateTask },
  { pattern: /add\s+(a\s+)?task/i, action: AutomationAction.CreateTask },
  { pattern: /generate\s+(a\s+)?report/i, action: AutomationAction.GenerateReport },
  { pattern: /create\s+(a\s+)?report/i, action: AutomationAction.GenerateReport },
  { pattern: /send\s+(a\s+)?thank\s*you/i, action: AutomationAction.SendThankYou },
  { pattern: /thank\s+(the\s+)?(donor|donors)/i, action: AutomationAction.SendThankYou },
  { pattern: /celebrate/i, action: AutomationAction.NotifyTeam, extractors: () => ({ celebration: true }) },
  { pattern: /remind/i, action: AutomationAction.SendEmail },
];

// Suggestion templates
const suggestionTemplates = [
  "When a task is completed, notify the team",
  "When the project is completed, send a thank you",
  "When the budget exceeds 80%, alert the team",
  "When a milestone is completed, send an email",
  "When deadline is approaching, notify the team",
  "When a donation is received, send thank you",
  "When volunteer hours are logged, generate a report",
];

const triggerLabels: Record<AutomationTrigger, string> = {
  [AutomationTrigger.ProjectCreated]: 'Project Created',
  [AutomationTrigger.ProjectCompleted]: 'Project Completed',
  [AutomationTrigger.MilestoneCompleted]: 'Milestone Completed',
  [AutomationTrigger.TaskCompleted]: 'Task Completed',
  [AutomationTrigger.DeadlineApproaching]: 'Deadline Approaching',
  [AutomationTrigger.BudgetThreshold]: 'Budget Threshold',
  [AutomationTrigger.DonationReceived]: 'Donation Received',
  [AutomationTrigger.VolunteerHoursLogged]: 'Volunteer Hours Logged',
};

const actionLabels: Record<AutomationAction, string> = {
  [AutomationAction.SendEmail]: 'Send Email',
  [AutomationAction.CreateTask]: 'Create Task',
  [AutomationAction.UpdateStatus]: 'Update Status',
  [AutomationAction.NotifyTeam]: 'Notify Team',
  [AutomationAction.GenerateReport]: 'Generate Report',
  [AutomationAction.SendThankYou]: 'Send Thank You',
};

export const NaturalLanguageAutomation: React.FC<NaturalLanguageAutomationProps> = ({
  project,
  onUpdateAutomations,
}) => {
  const [inputText, setInputText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{ trigger: AutomationTrigger | null; action: AutomationAction | null; triggerConfig: Record<string, any>; actionConfig: Record<string, any>; confidence: number } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [expandedAutomation, setExpandedAutomation] = useState<string | null>(null);

  const automations = project.automations || [];

  // Parse natural language input
  const parseInput = useCallback((text: string) => {
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }

    let foundTrigger: AutomationTrigger | null = null;
    let foundAction: AutomationAction | null = null;
    let triggerConfig: Record<string, any> = {};
    let actionConfig: Record<string, any> = {};
    let confidence = 0;

    // Find trigger
    for (const { pattern, trigger, extractors } of triggerPatterns) {
      const match = text.match(pattern);
      if (match) {
        foundTrigger = trigger;
        if (extractors) {
          triggerConfig = extractors(match);
        }
        confidence += 50;
        break;
      }
    }

    // Find action
    for (const { pattern, action, extractors } of actionPatterns) {
      const match = text.match(pattern);
      if (match) {
        foundAction = action;
        if (extractors) {
          actionConfig = extractors(match);
        }
        confidence += 50;
        break;
      }
    }

    setParsedPreview({
      trigger: foundTrigger,
      action: foundAction,
      triggerConfig,
      actionConfig,
      confidence,
    });
  }, []);

  // Debounced parsing
  React.useEffect(() => {
    const timer = setTimeout(() => parseInput(inputText), 300);
    return () => clearTimeout(timer);
  }, [inputText, parseInput]);

  const handleAddAutomation = () => {
    if (!parsedPreview?.trigger || !parsedPreview?.action) return;

    const newAutomation: ProjectAutomation = {
      id: `auto-${Date.now()}`,
      projectId: project.id,
      name: inputText,
      trigger: parsedPreview.trigger,
      action: parsedPreview.action,
      triggerConditions: parsedPreview.triggerConfig,
      actionConfig: parsedPreview.actionConfig,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    onUpdateAutomations([...automations, newAutomation]);
    setInputText('');
    setParsedPreview(null);
  };

  const handleToggleAutomation = (id: string) => {
    const updated = automations.map(a =>
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    onUpdateAutomations(updated);
  };

  const handleDeleteAutomation = (id: string) => {
    onUpdateAutomations(automations.filter(a => a.id !== id));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    setShowSuggestions(false);
  };

  // Calculate stats
  const stats = useMemo(() => ({
    total: automations.length,
    active: automations.filter(a => a.enabled).length,
    triggered: automations.filter(a => a.lastTriggered).length,
  }), [automations]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 50) return 'Partial Match';
    return 'Low Confidence';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-500" />
            Natural Language Automations
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Describe automations in plain English and let AI do the rest
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-gray-600">{stats.active} active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <span className="text-gray-600">{stats.total - stats.active} paused</span>
          </div>
        </div>
      </div>

      {/* Natural Language Input */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your automation
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g., When a task is completed, notify the team"
                className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-white"
                rows={2}
              />
              {inputText && (
                <button
                  onClick={() => setInputText('')}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Suggestions Toggle */}
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="mt-2 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              {showSuggestions ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
              {showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
            </button>

            {/* Suggestions */}
            {showSuggestions && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestionTemplates.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-xs bg-white border border-purple-200 rounded-full text-purple-700 hover:bg-purple-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Parsed Preview */}
            {parsedPreview && (parsedPreview.trigger || parsedPreview.action) && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">AI Understanding</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(parsedPreview.confidence)}`}>
                    {getConfidenceLabel(parsedPreview.confidence)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Trigger */}
                  <div className={`flex-1 p-3 rounded-lg ${parsedPreview.trigger ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="text-xs text-gray-500 mb-1">WHEN</div>
                    {parsedPreview.trigger ? (
                      <div className="text-sm font-medium text-blue-700">
                        {triggerLabels[parsedPreview.trigger]}
                        {parsedPreview.triggerConfig.threshold && (
                          <span className="text-blue-500 ml-1">({parsedPreview.triggerConfig.threshold}%)</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Not detected</div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>

                  {/* Action */}
                  <div className={`flex-1 p-3 rounded-lg ${parsedPreview.action ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="text-xs text-gray-500 mb-1">THEN</div>
                    {parsedPreview.action ? (
                      <div className="text-sm font-medium text-green-700">
                        {actionLabels[parsedPreview.action]}
                        {parsedPreview.actionConfig.recipient && (
                          <span className="text-green-500 ml-1">to {parsedPreview.actionConfig.recipient}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Not detected</div>
                    )}
                  </div>
                </div>

                {/* Add Button */}
                {parsedPreview.trigger && parsedPreview.action && (
                  <button
                    onClick={handleAddAutomation}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create Automation
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Automations */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Active Automations ({automations.length})
        </h4>

        {automations.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <LightningBoltIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No automations yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Describe an automation above to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className={`border rounded-lg transition-all ${
                  automation.enabled
                    ? 'border-purple-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setExpandedAutomation(
                            expandedAutomation === automation.id ? null : automation.id
                          )}
                          className="p-0.5 hover:bg-gray-100 rounded"
                        >
                          {expandedAutomation === automation.id ? (
                            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                        <span className={`font-medium ${automation.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                          {automation.name}
                        </span>
                        {automation.enabled && (
                          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          Created {new Date(automation.createdAt).toLocaleDateString()}
                        </span>
                        {automation.lastTriggered && (
                          <span className="flex items-center gap-1">
                            <LightningBoltIcon className="h-3.5 w-3.5" />
                            Last triggered {new Date(automation.lastTriggered).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleAutomation(automation.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          automation.enabled
                            ? 'text-yellow-600 hover:bg-yellow-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={automation.enabled ? 'Pause automation' : 'Activate automation'}
                      >
                        {automation.enabled ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteAutomation(automation.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete automation"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedAutomation === automation.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium mb-1">TRIGGER</div>
                          <div className="text-sm text-blue-800 font-medium">
                            {triggerLabels[automation.trigger]}
                          </div>
                          {Object.keys(automation.triggerConditions || {}).length > 0 && (
                            <div className="mt-2 text-xs text-blue-600">
                              {JSON.stringify(automation.triggerConditions)}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-xs text-green-600 font-medium mb-1">ACTION</div>
                          <div className="text-sm text-green-800 font-medium">
                            {actionLabels[automation.action]}
                          </div>
                          {Object.keys(automation.actionConfig || {}).length > 0 && (
                            <div className="mt-2 text-xs text-green-600">
                              {JSON.stringify(automation.actionConfig)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
        <div className="flex items-start gap-3">
          <ExclamationIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Quick Tips</h4>
            <ul className="mt-2 text-sm text-amber-700 space-y-1">
              <li>• Start with "When" to describe the trigger condition</li>
              <li>• Use action words like "send", "notify", "create", "update"</li>
              <li>• Set thresholds with percentages like "budget exceeds 80%"</li>
              <li>• Available triggers: tasks, milestones, deadlines, donations, volunteer hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageAutomation;
