/**
 * AI Insights Panel Component
 * Tabbed interface displaying AI metadata and analysis results
 */

import React, { useState } from 'react';
import {
  Brain,
  Tag,
  Users,
  Info,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';
import type { DocumentAIMetadata, DetectedEntity } from '../../../types/documents';

interface AIInsightsPanelProps {
  aiMetadata: DocumentAIMetadata;
  className?: string;
}

type TabType = 'overview' | 'tags' | 'entities' | 'details';

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  aiMetadata,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const handleCopy = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getConfidenceColor = (confidence?: number): string => {
    if (!confidence) return 'bg-slate-500';
    if (confidence >= 0.9) return 'bg-emerald-500';
    if (confidence >= 0.7) return 'bg-blue-500';
    if (confidence >= 0.5) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  const getConfidenceLabel = (confidence?: number): string => {
    if (!confidence) return 'Unknown';
    if (confidence >= 0.9) return 'Very High';
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Brain },
    { id: 'tags' as TabType, label: 'Tags', icon: Tag },
    { id: 'entities' as TabType, label: 'Entities', icon: Users },
    { id: 'details' as TabType, label: 'Details', icon: Info },
  ];

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-slate-800 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">AI Insights</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Powered by AI analysis
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                         transition-colors relative ${
                           isActive
                             ? 'text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-800'
                             : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                         }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Classification */}
            {aiMetadata.classification_category && (
              <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20
                              border border-cyan-100 dark:border-cyan-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Classification
                    </h4>
                    <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 capitalize">
                      {aiMetadata.classification_category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 shadow-sm">
                    <div className={`w-2 h-2 rounded-full ${getConfidenceColor(aiMetadata.classification_confidence)}`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {getConfidenceLabel(aiMetadata.classification_confidence)}
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                {aiMetadata.classification_confidence && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>Confidence Score</span>
                      <span className="font-medium">
                        {Math.round(aiMetadata.classification_confidence * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getConfidenceColor(aiMetadata.classification_confidence)} transition-all duration-500`}
                        style={{ width: `${aiMetadata.classification_confidence * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {aiMetadata.classification_reasoning && (
                  <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 italic">
                    "{aiMetadata.classification_reasoning}"
                  </p>
                )}
              </div>
            )}

            {/* AI Summary */}
            {aiMetadata.ai_summary && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-500" />
                  Summary
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {aiMetadata.ai_summary}
                </p>
              </div>
            )}

            {/* Key Points */}
            {aiMetadata.key_points && aiMetadata.key_points.length > 0 && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Key Points
                </h4>
                <ul className="space-y-2">
                  {aiMetadata.key_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500
                                     text-white text-xs font-medium flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Language */}
            {aiMetadata.language_detected && (
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <span className="font-medium">Detected Language:</span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md font-medium text-slate-900 dark:text-white">
                  {aiMetadata.language_detected}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-4">
            {/* Auto Tags */}
            {aiMetadata.auto_tags && aiMetadata.auto_tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-500" />
                  Auto-Generated Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiMetadata.auto_tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="group relative inline-flex items-center gap-2 px-3 py-1.5
                                 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20
                                 border border-cyan-200 dark:border-cyan-800 rounded-lg
                                 text-sm font-medium text-cyan-700 dark:text-cyan-300
                                 hover:shadow-md transition-all"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleCopy(tag, `tag-${idx}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy tag"
                      >
                        {copiedItem === `tag-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Tags */}
            {aiMetadata.suggested_tags && aiMetadata.suggested_tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  Suggested Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {aiMetadata.suggested_tags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="group relative inline-flex items-center gap-2 px-3 py-1.5
                                 bg-slate-100 dark:bg-slate-700 rounded-lg
                                 text-sm text-slate-700 dark:text-slate-300
                                 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                      title="Click to add tag"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleCopy(tag, `suggested-${idx}`)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedItem === `suggested-${idx}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!aiMetadata.auto_tags || aiMetadata.auto_tags.length === 0) &&
              (!aiMetadata.suggested_tags || aiMetadata.suggested_tags.length === 0) && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tags available</p>
                </div>
              )}
          </div>
        )}

        {/* Entities Tab */}
        {activeTab === 'entities' && (
          <div className="space-y-4">
            {aiMetadata.detected_entities && Object.keys(aiMetadata.detected_entities).length > 0 ? (
              Object.entries(aiMetadata.detected_entities).map(([entityType, entities]) => (
                <div key={entityType} className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-500" />
                    {entityType}s
                    <span className="ml-auto text-xs font-normal text-slate-500 dark:text-slate-400">
                      {entities.length} found
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {entities.map((entity: DetectedEntity, idx: number) => (
                      <div
                        key={idx}
                        className="group p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
                                   border border-slate-200 dark:border-slate-700
                                   hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {entity.value}
                            </p>
                            {entity.context && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {entity.context}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {entity.confidence && (
                              <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${getConfidenceColor(entity.confidence)}`} />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {Math.round(entity.confidence * 100)}%
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() => handleCopy(entity.value, `entity-${entityType}-${idx}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                              title="Copy entity"
                            >
                              {copiedItem === `entity-${entityType}-${idx}` ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No entities detected</p>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Processing Time */}
              {aiMetadata.processing_time_ms && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
                                border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Processing Time</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {aiMetadata.processing_time_ms}ms
                  </span>
                </div>
              )}

              {/* AI Model */}
              {aiMetadata.ai_model_used && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
                                border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">AI Model</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {aiMetadata.ai_model_used}
                  </span>
                </div>
              )}

              {/* Extraction Confidence */}
              {aiMetadata.extraction_confidence && (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
                                border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Text Extraction Quality</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {Math.round(aiMetadata.extraction_confidence * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getConfidenceColor(aiMetadata.extraction_confidence)} transition-all duration-500`}
                      style={{ width: `${aiMetadata.extraction_confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Processed Date */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50
                              border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Processed At</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {new Date(aiMetadata.processed_at).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Extracted Text Preview */}
            {aiMetadata.extracted_text && (
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Extracted Text Preview</h4>
                  <button
                    onClick={() => handleCopy(aiMetadata.extracted_text || '', 'extracted-text')}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-cyan-600 dark:text-cyan-400
                               hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded transition-colors"
                  >
                    {copiedItem === 'extracted-text' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy All</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-mono">
                    {aiMetadata.extracted_text.slice(0, 500)}
                    {aiMetadata.extracted_text.length > 500 && '...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
