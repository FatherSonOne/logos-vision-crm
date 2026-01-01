import React, { useState } from 'react';
import { AIInsight, reportService } from '../../services/reportService';
import { generateReportSummary } from '../../services/geminiService';

// ============================================
// ICONS
// ============================================

const LightbulbIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const TrendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const RecommendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ForecastIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const PinIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={`w-4 h-4 ${filled ? 'fill-current' : ''}`} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ============================================
// TYPES
// ============================================

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onDismiss: (id: string) => void;
  onRefresh: () => void;
}

type FilterType = 'all' | 'trend' | 'anomaly' | 'correlation' | 'summary' | 'recommendation' | 'forecast';

// ============================================
// INSIGHT CARD COMPONENT
// ============================================

interface InsightCardProps {
  insight: AIInsight;
  onDismiss: () => void;
  onPin: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onDismiss, onPin }) => {
  const getTypeIcon = () => {
    switch (insight.insightType) {
      case 'trend': return <TrendIcon />;
      case 'anomaly': return <AlertIcon />;
      case 'correlation': return <ChartIcon />;
      case 'recommendation': return <RecommendIcon />;
      case 'forecast': return <ForecastIcon />;
      case 'summary': return <LightbulbIcon />;
      default: return <SparklesIcon />;
    }
  };

  const getTypeColor = () => {
    switch (insight.insightType) {
      case 'trend': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'anomaly': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'correlation': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'recommendation': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'forecast': return 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'summary': return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getImportanceStyle = () => {
    switch (insight.importance) {
      case 'critical': return 'border-l-4 border-l-red-500';
      case 'high': return 'border-l-4 border-l-yellow-500';
      case 'medium': return 'border-l-4 border-l-blue-500';
      case 'low': return 'border-l-4 border-l-gray-300';
      default: return '';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 ${getImportanceStyle()} hover:shadow-lg transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getTypeColor()}`}>
            {getTypeIcon()}
          </div>
          <div>
            <span className={`text-xs font-medium uppercase tracking-wide ${getTypeColor().replace('bg-', 'text-').split(' ')[0]}-700`}>
              {insight.insightType}
            </span>
            {insight.insightTitle && (
              <h3 className="font-semibold text-gray-900 dark:text-white">{insight.insightTitle}</h3>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onPin}
            className={`p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${insight.isPinned ? 'text-indigo-600' : 'text-gray-400'}`}
            title={insight.isPinned ? 'Unpin' : 'Pin'}
          >
            <PinIcon filled={insight.isPinned} />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            title="Dismiss"
          >
            <XIcon />
          </button>
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{insight.insightText}</p>

      {insight.suggestedAction && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">
            Suggested Action:
          </p>
          <p className="text-sm text-green-600 dark:text-green-300 mt-1">{insight.suggestedAction}</p>
        </div>
      )}

      {insight.relatedMetrics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {insight.relatedMetrics.map((metric, i) => (
            <span key={i} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              {metric}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-4">
          {insight.confidenceScore && (
            <span>{(insight.confidenceScore * 100).toFixed(0)}% confidence</span>
          )}
          <span className={`capitalize ${
            insight.importance === 'critical' ? 'text-red-600' :
            insight.importance === 'high' ? 'text-yellow-600' :
            'text-gray-500'
          }`}>
            {insight.importance} importance
          </span>
        </div>
        <span>{new Date(insight.generatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

// ============================================
// AI QUESTION BOX
// ============================================

interface AIQuestionBoxProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
}

const AIQuestionBox: React.FC<AIQuestionBoxProps> = ({ onAsk, isLoading }) => {
  const [question, setQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAsk(question);
      setQuestion('');
    }
  };

  const suggestions = [
    "What are our donation trends?",
    "Which donors are at risk of lapsing?",
    "What's our retention rate?",
    "Summarize this month's performance",
  ];

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          <SparklesIcon />
        </div>
        <div>
          <h3 className="font-semibold">Ask AI</h3>
          <p className="text-sm text-indigo-200">Get insights about your data in natural language</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setQuestion(suggestion)}
            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  insights,
  onDismiss,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Insights' },
    { value: 'trend', label: 'Trends' },
    { value: 'anomaly', label: 'Anomalies' },
    { value: 'correlation', label: 'Correlations' },
    { value: 'recommendation', label: 'Recommendations' },
    { value: 'forecast', label: 'Forecasts' },
    { value: 'summary', label: 'Summaries' },
  ];

  const filteredInsights = filter === 'all'
    ? insights
    : insights.filter(i => i.insightType === filter);

  // Separate pinned and regular insights
  const pinnedInsights = filteredInsights.filter(i => i.isPinned);
  const regularInsights = filteredInsights.filter(i => !i.isPinned);

  const handleAskAI = async (question: string) => {
    setIsGenerating(true);
    setAiResponse(null);
    try {
      // Use the generateReportSummary function from geminiService
      const response = await generateReportSummary(
        [], // We could pass actual data here
        question,
        'general'
      );
      setAiResponse(response);
    } catch (err) {
      console.error('Failed to get AI response:', err);
      setAiResponse('Sorry, I was unable to generate an insight. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePin = async (id: string) => {
    try {
      await reportService.toggleInsightPin(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to pin insight:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Question Box */}
      <AIQuestionBox onAsk={handleAskAI} isLoading={isGenerating} />

      {/* AI Response */}
      {aiResponse && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
              <SparklesIcon />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Response</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aiResponse}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">AI Insights</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automatically generated insights from your data
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <RefreshIcon />
          Generate New Insights
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === option.value
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
            {option.value !== 'all' && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 rounded">
                {insights.filter(i => i.insightType === option.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Insights Display */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <LightbulbIcon />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No insights yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            AI insights will appear here as your data grows. Try asking a question above!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Insights */}
          {pinnedInsights.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                <PinIcon filled /> Pinned
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pinnedInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onDismiss={() => onDismiss(insight.id)}
                    onPin={() => handlePin(insight.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Insights */}
          {regularInsights.length > 0 && (
            <div>
              {pinnedInsights.length > 0 && (
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
                  Recent Insights
                </h3>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {regularInsights.map((insight) => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onDismiss={() => onDismiss(insight.id)}
                    onPin={() => handlePin(insight.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Insights (when no real insights exist) */}
      {insights.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 opacity-60">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <TrendIcon />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-blue-700">Sample Trend</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              "Donations have increased by 15% over the last quarter, with recurring donations showing the strongest growth at 22%."
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                <AlertIcon />
              </div>
              <span className="text-xs font-medium uppercase tracking-wide text-yellow-700">Sample Anomaly</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              "Unusual spike detected in volunteer sign-ups last week. This is 3x the normal rate and may require attention."
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIInsightsPanel;
