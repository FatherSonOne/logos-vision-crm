import React, { useState, useEffect, useMemo } from 'react';
import type {
  Touchpoint,
  TouchpointType,
  TouchpointDirection,
  TouchpointSentiment,
  TouchpointEngagementLevel,
  Client,
  DonorMove,
} from '../types';
import {
  TOUCHPOINT_TYPE_LABELS,
  DONOR_STAGE_LABELS,
  DONOR_STAGE_COLORS,
} from '../types';
import * as movesService from '../services/movesManagementService';

interface TouchpointTrackerProps {
  clients: Client[];
  selectedClientId?: string;
}

export const TouchpointTracker: React.FC<TouchpointTrackerProps> = ({
  clients,
  selectedClientId,
}) => {
  const [touchpoints, setTouchpoints] = useState<Touchpoint[]>([]);
  const [donorMoves, setDonorMoves] = useState<DonorMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filterType, setFilterType] = useState<TouchpointType | 'all'>('all');
  const [filterClient, setFilterClient] = useState<string>(selectedClientId || 'all');
  const [filterDays, setFilterDays] = useState<number>(30);
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  useEffect(() => {
    loadData();
  }, [filterDays]);

  useEffect(() => {
    if (selectedClientId) {
      setFilterClient(selectedClientId);
    }
  }, [selectedClientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [touchpointsData, movesData] = await Promise.all([
        movesService.getRecentTouchpoints(filterDays),
        movesService.getDonorMoves(),
      ]);
      setTouchpoints(touchpointsData);
      setDonorMoves(movesData);
    } catch (error) {
      console.error('Failed to load touchpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTouchpoint = async (data: Omit<Touchpoint, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTouchpoint = await movesService.createTouchpoint(data);
      setTouchpoints([newTouchpoint, ...touchpoints]);
      setShowNewModal(false);
    } catch (error) {
      console.error('Failed to create touchpoint:', error);
    }
  };

  // Filter touchpoints
  const filteredTouchpoints = useMemo(() => {
    return touchpoints
      .filter(tp => filterType === 'all' || tp.touchpointType === filterType)
      .filter(tp => filterClient === 'all' || tp.clientId === filterClient);
  }, [touchpoints, filterType, filterClient]);

  // Group touchpoints by date for timeline view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Touchpoint[]> = {};
    filteredTouchpoints.forEach(tp => {
      const date = new Date(tp.touchpointDate).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(tp);
    });
    return groups;
  }, [filteredTouchpoints]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredTouchpoints.length;
    const positive = filteredTouchpoints.filter(tp => tp.sentiment === 'positive').length;
    const followUps = filteredTouchpoints.filter(tp => tp.followUpRequired).length;
    const byType: Record<string, number> = {};
    filteredTouchpoints.forEach(tp => {
      byType[tp.touchpointType] = (byType[tp.touchpointType] || 0) + 1;
    });
    return { total, positive, followUps, byType };
  }, [filteredTouchpoints]);

  const getClientInfo = (clientId: string) => clients.find(c => c.id === clientId);
  const getDonorMove = (clientId: string) => donorMoves.find(d => d.clientId === clientId);

  const getTouchpointIcon = (type: TouchpointType) => {
    const icons: Record<TouchpointType, string> = {
      call: '📞',
      email: '✉️',
      meeting: '🤝',
      event: '🎉',
      tour: '🏛️',
      'gift-sent': '🎁',
      letter: '📨',
      'social-media': '📱',
      visit: '🏠',
      'thank-you': '💝',
      proposal: '📋',
      other: '📝',
    };
    return icons[type] || '📝';
  };

  const getSentimentColor = (sentiment?: TouchpointSentiment | null) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-500/20 text-green-400';
      case 'neutral': return 'bg-gray-500/20 text-gray-400';
      case 'negative': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getEngagementColor = (level?: TouchpointEngagementLevel | null) => {
    switch (level) {
      case 'high': return 'bg-cyan-500/20 text-cyan-400';
      case 'medium': return 'bg-blue-500/20 text-blue-400';
      case 'low': return 'bg-yellow-500/20 text-yellow-400';
      case 'none': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Touchpoint Tracker</h1>
          <p className="text-gray-400 mt-1">
            Record and track all donor interactions and engagement
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Touchpoint
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Total Touchpoints</div>
          <div className="text-2xl font-bold text-white mt-1">{stats.total}</div>
          <div className="text-xs text-gray-500">Last {filterDays} days</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Positive Sentiment</div>
          <div className="text-2xl font-bold text-green-400 mt-1">{stats.positive}</div>
          <div className="text-xs text-gray-500">
            {stats.total > 0 ? Math.round((stats.positive / stats.total) * 100) : 0}% of total
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Follow-ups Needed</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{stats.followUps}</div>
          <div className="text-xs text-gray-500">Pending action</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
          <div className="text-gray-400 text-sm">Most Common</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">
            {Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {Object.entries(stats.byType).sort((a, b) => b[1] - a[1])[0]?.[1] || 0} interactions
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as TouchpointType | 'all')}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Types</option>
          {Object.entries(TOUCHPOINT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Contacts</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>

        <select
          value={filterDays}
          onChange={(e) => setFilterDays(parseInt(e.target.value))}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>

        <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-2 text-sm ${viewMode === 'timeline' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-400'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {Object.entries(groupedByDate).map(([date, dayTouchpoints]) => (
            <div key={date}>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-sm font-medium text-gray-400">{date}</div>
                <div className="flex-1 h-px bg-gray-700"></div>
                <div className="text-xs text-gray-500">{dayTouchpoints.length} touchpoints</div>
              </div>

              <div className="relative pl-8 space-y-4">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-700"></div>

                {dayTouchpoints.map((tp) => {
                  const client = getClientInfo(tp.clientId);
                  const donorMove = getDonorMove(tp.clientId);

                  return (
                    <div key={tp.id} className="relative">
                      {/* Timeline dot */}
                      <div className="absolute left-[-21px] w-6 h-6 bg-gray-900 border-2 border-cyan-500 rounded-full flex items-center justify-center text-xs">
                        {getTouchpointIcon(tp.touchpointType)}
                      </div>

                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 ml-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">{client?.name || 'Unknown'}</span>
                              {donorMove && (
                                <span
                                  className="px-2 py-0.5 rounded text-xs"
                                  style={{
                                    backgroundColor: `${DONOR_STAGE_COLORS[donorMove.currentStage]}20`,
                                    color: DONOR_STAGE_COLORS[donorMove.currentStage],
                                  }}
                                >
                                  {DONOR_STAGE_LABELS[donorMove.currentStage]}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                              {TOUCHPOINT_TYPE_LABELS[tp.touchpointType]}
                              {tp.direction === 'inbound' && ' (Inbound)'}
                              <span className="text-gray-500 ml-2">
                                {new Date(tp.touchpointDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {tp.sentiment && (
                              <span className={`px-2 py-0.5 rounded text-xs ${getSentimentColor(tp.sentiment)}`}>
                                {tp.sentiment}
                              </span>
                            )}
                            {tp.engagementLevel && (
                              <span className={`px-2 py-0.5 rounded text-xs ${getEngagementColor(tp.engagementLevel)}`}>
                                {tp.engagementLevel}
                              </span>
                            )}
                          </div>
                        </div>

                        {tp.subject && (
                          <div className="text-white font-medium mb-1">{tp.subject}</div>
                        )}

                        {tp.description && (
                          <p className="text-gray-400 text-sm mb-2">{tp.description}</p>
                        )}

                        {tp.outcome && (
                          <div className="text-sm bg-gray-900/50 rounded p-2 mb-2">
                            <span className="text-gray-500">Outcome: </span>
                            <span className="text-gray-300">{tp.outcome}</span>
                          </div>
                        )}

                        {tp.followUpRequired && (
                          <div className="flex items-center gap-2 text-amber-400 text-sm">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Follow-up needed
                            {tp.followUpDate && ` by ${new Date(tp.followUpDate).toLocaleDateString()}`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(groupedByDate).length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No touchpoints found for the selected filters.
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Sentiment</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {filteredTouchpoints.map((tp) => {
                const client = getClientInfo(tp.clientId);
                return (
                  <tr key={tp.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(tp.touchpointDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{client?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span>{getTouchpointIcon(tp.touchpointType)}</span>
                        <span className="text-gray-300">{TOUCHPOINT_TYPE_LABELS[tp.touchpointType]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{tp.subject || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {tp.sentiment && (
                        <span className={`px-2 py-0.5 rounded text-xs ${getSentimentColor(tp.sentiment)}`}>
                          {tp.sentiment}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {tp.followUpRequired && (
                        <span className="text-amber-400">
                          {tp.followUpDate ? new Date(tp.followUpDate).toLocaleDateString() : 'Yes'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTouchpoints.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              No touchpoints found for the selected filters.
            </div>
          )}
        </div>
      )}

      {/* New Touchpoint Modal */}
      {showNewModal && (
        <NewTouchpointModal
          clients={clients}
          donorMoves={donorMoves}
          preselectedClientId={filterClient !== 'all' ? filterClient : undefined}
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateTouchpoint}
        />
      )}
    </div>
  );
};

// New Touchpoint Modal
interface NewTouchpointModalProps {
  clients: Client[];
  donorMoves: DonorMove[];
  preselectedClientId?: string;
  onClose: () => void;
  onCreate: (data: Omit<Touchpoint, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const NewTouchpointModal: React.FC<NewTouchpointModalProps> = ({
  clients,
  donorMoves,
  preselectedClientId,
  onClose,
  onCreate,
}) => {
  const [clientId, setClientId] = useState(preselectedClientId || '');
  const [touchpointType, setTouchpointType] = useState<TouchpointType>('call');
  const [direction, setDirection] = useState<TouchpointDirection>('outbound');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const [sentiment, setSentiment] = useState<TouchpointSentiment>('neutral');
  const [engagementLevel, setEngagementLevel] = useState<TouchpointEngagementLevel>('medium');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDate, setFollowUpDate] = useState('');
  const [touchpointDate, setTouchpointDate] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return;

    const donorMove = donorMoves.find(d => d.clientId === clientId);

    onCreate({
      clientId,
      donorMoveId: donorMove?.id || null,
      cultivationPlanId: null,
      cultivationTaskId: null,
      touchpointType,
      touchpointDate,
      direction,
      subject: subject || null,
      description: description || null,
      outcome: outcome || null,
      sentiment,
      engagementLevel,
      followUpRequired,
      followUpDate: followUpDate || null,
      followUpNotes: null,
      recordedBy: null,
      relatedDonationId: null,
      relatedActivityId: null,
      attachments: [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Log Touchpoint</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contact</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              required
            >
              <option value="">Select contact...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Type and Direction */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
              <select
                value={touchpointType}
                onChange={(e) => setTouchpointType(e.target.value as TouchpointType)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {Object.entries(TOUCHPOINT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Direction</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as TouchpointDirection)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="outbound">Outbound (We initiated)</option>
                <option value="inbound">Inbound (They initiated)</option>
              </select>
            </div>
          </div>

          {/* Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={touchpointDate}
              onChange={(e) => setTouchpointDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief subject or title"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details of the interaction..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Outcome</label>
            <input
              type="text"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Result or next steps from this interaction"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Sentiment and Engagement */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Sentiment</label>
              <select
                value={sentiment}
                onChange={(e) => setSentiment(e.target.value as TouchpointSentiment)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Engagement Level</label>
              <select
                value={engagementLevel}
                onChange={(e) => setEngagementLevel(e.target.value as TouchpointEngagementLevel)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* Follow-up */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">Follow-up required</span>
            </label>

            {followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!clientId}
              className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Log Touchpoint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TouchpointTracker;
