import React, { useState, useEffect } from 'react';
import {
  Zap,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Pause,
  Plus,
  Edit2,
  Trash2,
  FileText,
  Settings,
  RefreshCw,
  Send,
  Heart,
  Gift,
  Calendar,
  TrendingDown,
  ChevronRight,
} from 'lucide-react';
import { automationService } from '../services/automationService';
import type {
  AutomationRule,
  AutomationExecution,
  AutomationStats,
  EmailTemplate,
  TriggerType,
  ActionType,
} from '../types';

// Trigger type display info
const triggerInfo: Record<TriggerType, { label: string; icon: React.ReactNode; color: string }> = {
  donation_created: { label: 'Donation Created', icon: <Gift className="w-4 h-4" />, color: 'text-green-600' },
  pledge_created: { label: 'Pledge Created', icon: <Heart className="w-4 h-4" />, color: 'text-blue-600' },
  pledge_payment_due: { label: 'Pledge Payment Due', icon: <Clock className="w-4 h-4" />, color: 'text-orange-600' },
  large_donation: { label: 'Large Donation', icon: <Gift className="w-4 h-4" />, color: 'text-purple-600' },
  engagement_dropped: { label: 'Engagement Dropped', icon: <TrendingDown className="w-4 h-4" />, color: 'text-red-600' },
  birthday: { label: 'Birthday', icon: <Calendar className="w-4 h-4" />, color: 'text-pink-600' },
  anniversary: { label: 'Anniversary', icon: <Calendar className="w-4 h-4" />, color: 'text-cyan-600' },
  manual: { label: 'Manual Trigger', icon: <Play className="w-4 h-4" />, color: 'text-gray-600' },
};

// Action type display info
const actionInfo: Record<ActionType, { label: string; icon: React.ReactNode }> = {
  send_email: { label: 'Send Email', icon: <Mail className="w-4 h-4" /> },
  create_task: { label: 'Create Task', icon: <CheckCircle className="w-4 h-4" /> },
  send_sms: { label: 'Send SMS', icon: <Send className="w-4 h-4" /> },
  log_communication: { label: 'Log Communication', icon: <FileText className="w-4 h-4" /> },
  update_engagement: { label: 'Update Engagement', icon: <RefreshCw className="w-4 h-4" /> },
};

// Format delay time
const formatDelay = (minutes: number): string => {
  if (minutes === 0) return 'Immediate';
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
  return `${Math.round(minutes / 1440)} days`;
};

export const Stewardship: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'templates'>('rules');
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rulesData, executionsData, templatesData, statsData] = await Promise.all([
        automationService.getRules(),
        automationService.getExecutions({ limit: 50 }),
        automationService.getTemplates(),
        automationService.getStats(),
      ]);
      setRules(rulesData);
      setExecutions(executionsData);
      setTemplates(templatesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching automation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      await automationService.toggleRule(rule.id, !rule.isActive);
      setRules(rules.map((r) => (r.id === rule.id ? { ...r, isActive: !r.isActive } : r)));
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this automation rule?')) return;
    try {
      await automationService.deleteRule(ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this email template?')) return;
    try {
      await automationService.deleteTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-500" />
            Stewardship Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Automate donor communications and follow-up tasks
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Rules</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeRules}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">of {stats.totalRules} total</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingExecutions}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">awaiting execution</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed Today</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedToday}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">automations run</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed Today</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failedToday}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">need attention</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'rules', label: 'Automation Rules', icon: <Zap className="w-4 h-4" /> },
            { id: 'executions', label: 'Execution History', icon: <Clock className="w-4 h-4" /> },
            { id: 'templates', label: 'Email Templates', icon: <Mail className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Automation Rules</h2>
              <button
                onClick={() => {
                  setSelectedRule(null);
                  setShowRuleModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Rule
              </button>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {rules.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No automation rules configured yet.</p>
                  <p className="text-sm mt-1">Create your first rule to get started.</p>
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                          {!rule.isActive && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                              Disabled
                            </span>
                          )}
                        </div>
                        {rule.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{rule.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <span className={`flex items-center gap-1 ${triggerInfo[rule.triggerType]?.color}`}>
                            {triggerInfo[rule.triggerType]?.icon}
                            {triggerInfo[rule.triggerType]?.label}
                          </span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                          <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            {actionInfo[rule.actionType]?.icon}
                            {actionInfo[rule.actionType]?.label}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500 dark:text-gray-400">
                            Delay: {formatDelay(rule.delayMinutes)}
                          </span>
                          {rule.templateName && (
                            <>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                Template: {rule.templateName}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span>Executed {rule.executionCount} times</span>
                          {rule.lastExecutedAt && (
                            <span>Last: {new Date(rule.lastExecutedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`p-2 rounded-lg transition-colors ${
                            rule.isActive
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                          title={rule.isActive ? 'Disable rule' : 'Enable rule'}
                        >
                          {rule.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowRuleModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit rule"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete rule"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Execution History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rule
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Trigger
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Scheduled
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {executions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No execution history yet.
                      </td>
                    </tr>
                  ) : (
                    executions.map((execution) => (
                      <tr key={execution.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {execution.ruleName || 'Unknown Rule'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-gray-900 dark:text-white">{execution.clientName || 'N/A'}</span>
                            {execution.clientEmail && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{execution.clientEmail}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-sm ${triggerInfo[execution.triggerType]?.color}`}>
                            {triggerInfo[execution.triggerType]?.icon}
                            {triggerInfo[execution.triggerType]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(execution.scheduledFor).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(execution.status)}
                          {execution.errorMessage && (
                            <p className="text-xs text-red-500 mt-1 truncate max-w-[200px]" title={execution.errorMessage}>
                              {execution.errorMessage}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Email Templates</h2>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowTemplateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Template
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {templates.length === 0 ? (
                <div className="col-span-2 p-8 text-center text-gray-500 dark:text-gray-400">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No email templates yet.</p>
                  <p className="text-sm mt-1">Create templates for your automated emails.</p>
                </div>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{template.name}</h3>
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded mt-1">
                          {template.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplateModal(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{template.description}</p>
                    )}
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-3 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Subject:</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{template.subject}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded p-3 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Preview:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-wrap">
                        {template.body.substring(0, 150)}...
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
