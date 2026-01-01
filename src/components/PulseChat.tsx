// src/components/PulseChat.tsx
// Enhanced Team Chat with Pulse Integration
// Provides embedded chat experience with Pulse platform connectivity
// Phase 9: Full bi-directional sync with real-time presence and notifications

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatRoom, ChatMessage, TeamMember, Activity, Client, Project } from '../types';
import { ActivityType } from '../types';
import {
  PlusIcon, SendIcon, SparklesIcon, PhoneIcon, MailIcon, UsersIcon,
  DocumentTextIcon, ClipboardListIcon, ChatIcon, VideoIcon,
  RefreshIcon, ExternalLinkIcon, SettingsIcon, CheckIcon, AlertIcon,
  BellIcon, CalendarIcon, LinkIcon
} from './icons';
import { Modal } from './Modal';
import { summarizeChatHistory, generateSmartReplies } from '../services/geminiService';
import {
  pulseIntegrationService,
  type PulseChannel,
  type PulseMessage,
  type SyncStatus
} from '../services/pulseIntegrationService';
import { pulsePresenceService, type UserPresence, type UserStatus } from '../services/pulsePresenceService';
import { pulseMeetingService, type PulseMeeting } from '../services/pulseMeetingService';

// Extended message type with Pulse source information
interface ExtendedMessage extends ChatMessage {
  source?: 'logos' | 'pulse' | 'slack' | 'email';
  isPulseMessage?: boolean;
  pulseChannelId?: string;
  attachments?: { name: string; url: string; type: string }[];
  reactions?: { emoji: string; count: number; users: string[] }[];
  threadCount?: number;
  isEdited?: boolean;
}

// Presence indicator component props
interface PresenceIndicatorProps {
  status: UserStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

interface PulseChatProps {
  rooms: ChatRoom[];
  messages: ChatMessage[];
  teamMembers: TeamMember[];
  currentUserId: string;
  onSendMessage: (roomId: string, text: string) => void;
  onCreateRoom: () => void;
  activities?: Activity[];
  clients?: Client[];
  projects?: Project[];
  onLogActivity?: () => void;
  onOpenPulseSettings?: () => void;
  onScheduleMeeting?: (meeting: Partial<PulseMeeting>) => void;
}

// Sync Status Badge Component
const SyncStatusBadge: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const getStatusColor = () => {
    if (status.isSyncing) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
    if (status.isConnected) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300';
    return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300';
  };

  const getStatusText = () => {
    if (status.isSyncing) return 'Syncing...';
    if (status.isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getIcon = () => {
    if (status.isSyncing) return <RefreshIcon />;
    if (status.isConnected) return <CheckIcon />;
    return <AlertIcon />;
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      <span className={status.isSyncing ? 'animate-spin' : ''}>{getIcon()}</span>
      <span>{getStatusText()}</span>
    </div>
  );
};

// Activity Type Icon
const ActivityTypeIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
  const icons: Record<ActivityType, React.ReactNode> = {
    [ActivityType.Call]: <PhoneIcon />,
    [ActivityType.Email]: <MailIcon />,
    [ActivityType.Meeting]: <UsersIcon />,
    [ActivityType.Note]: <DocumentTextIcon />
  };
  return (
    <div className="h-8 w-8 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0">
      {icons[type] || <DocumentTextIcon />}
    </div>
  );
};

// Format time ago helper
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  return `${diffInDays}d ago`;
};

// Presence Indicator Component - shows user online status
const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({ status, size = 'md', showLabel = false }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    busy: 'bg-red-500',
    offline: 'bg-slate-400'
  };

  const statusLabels = {
    online: 'Online',
    away: 'Away',
    busy: 'Busy',
    offline: 'Offline'
  };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${sizeClasses[size]} ${statusColors[status]} rounded-full ring-2 ring-white dark:ring-slate-800`}
        title={statusLabels[status]}
      />
      {showLabel && (
        <span className="text-xs text-slate-500 dark:text-slate-400">{statusLabels[status]}</span>
      )}
    </div>
  );
};

// Message Source Badge - shows where message originated
const MessageSourceBadge: React.FC<{ source: 'logos' | 'pulse' | 'slack' | 'email' }> = ({ source }) => {
  const sourceConfig = {
    logos: { label: 'Logos', className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' },
    pulse: { label: 'Pulse', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' },
    slack: { label: 'Slack', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' },
    email: { label: 'Email', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' }
  };

  const config = sourceConfig[source];
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${config.className}`}>
      {config.label}
    </span>
  );
};

// Typing Indicator Component
const TypingIndicator: React.FC<{ users: string[] }> = ({ users }) => {
  if (users.length === 0) return null;

  const text = users.length === 1
    ? `${users[0]} is typing...`
    : users.length === 2
      ? `${users[0]} and ${users[1]} are typing...`
      : `${users[0]} and ${users.length - 1} others are typing...`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  );
};

// Meeting Card Component - displays upcoming/active meetings
const MeetingCard: React.FC<{
  meeting: PulseMeeting;
  onJoin: (meeting: PulseMeeting) => void;
  onViewDetails?: (meeting: PulseMeeting) => void;
}> = ({ meeting, onJoin, onViewDetails }) => {
  const startTime = new Date(meeting.startTime);
  const isActive = meeting.status === 'in_progress';
  const isUpcoming = meeting.status === 'scheduled' && startTime <= new Date(Date.now() + 15 * 60 * 1000);

  return (
    <div className={`p-3 rounded-lg border ${
      isActive
        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700'
        : isUpcoming
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'
          : 'bg-white/30 dark:bg-black/20 border-white/20 dark:border-white/10'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{meeting.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {meeting.attendees && ` · ${meeting.attendees.length} attendees`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {isActive && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              Live
            </span>
          )}
          <button
            onClick={() => onJoin(meeting)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-violet-600 hover:bg-violet-700 text-white'
            }`}
          >
            {isActive ? 'Join Now' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Unified Message View Component - renders messages from any source
const UnifiedMessageView: React.FC<{
  message: ExtendedMessage;
  sender?: TeamMember;
  isCurrentUser: boolean;
  presenceStatus?: UserStatus;
}> = ({ message, sender, isCurrentUser, presenceStatus }) => {
  return (
    <div className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center font-bold text-sm text-slate-600 dark:bg-black/20 dark:text-slate-300">
          {sender?.name.charAt(0) || '?'}
        </div>
        {presenceStatus && (
          <div className="absolute -bottom-0.5 -right-0.5">
            <PresenceIndicator status={presenceStatus} size="sm" />
          </div>
        )}
      </div>
      <div className={`flex flex-col gap-1 max-w-lg ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{sender?.name || 'Unknown'}</span>
            {message.source && message.source !== 'logos' && (
              <MessageSourceBadge source={message.source} />
            )}
          </div>
        )}
        <div className={`p-3 rounded-lg ${
          isCurrentUser
            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white'
            : message.source === 'pulse'
              ? 'bg-violet-100/50 dark:bg-violet-900/30 text-slate-800 dark:text-slate-200 border border-violet-200 dark:border-violet-700'
              : 'bg-white/30 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((att, idx) => (
                <a
                  key={idx}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-2 py-1 bg-white/20 dark:bg-black/20 rounded text-xs hover:bg-white/30 dark:hover:bg-black/30"
                >
                  <DocumentTextIcon />
                  <span className="truncate">{att.name}</span>
                </a>
              ))}
            </div>
          )}

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-white/30 dark:bg-black/20 rounded text-xs"
                  title={reaction.users.join(', ')}
                >
                  {reaction.emoji} {reaction.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          <span className={`text-xs opacity-70 ${isCurrentUser ? 'text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {message.isEdited && (
            <span className="text-xs text-slate-400 dark:text-slate-500">(edited)</span>
          )}
          {message.threadCount && message.threadCount > 0 && (
            <button className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
              {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const PulseChat: React.FC<PulseChatProps> = ({
  rooms,
  messages,
  teamMembers,
  currentUserId,
  onSendMessage,
  onCreateRoom,
  activities = [],
  clients = [],
  projects = [],
  onLogActivity,
  onOpenPulseSettings,
  onScheduleMeeting
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'activities' | 'pulse' | 'meetings'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Pulse integration state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(pulseIntegrationService.getSyncStatus());
  const [pulseChannels, setPulseChannels] = useState<PulseChannel[]>([]);
  const [pulseMessages, setPulseMessages] = useState<PulseMessage[]>([]);
  const [isLoadingPulse, setIsLoadingPulse] = useState(false);

  // Enhanced state for Phase 9
  const [userPresence, setUserPresence] = useState<Map<string, UserPresence>>(new Map());
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<PulseMeeting[]>([]);
  const [unifiedMessages, setUnifiedMessages] = useState<ExtendedMessage[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [showEmbeddedPulse, setShowEmbeddedPulse] = useState(false);
  const [selectedPulseChannel, setSelectedPulseChannel] = useState<string | null>(null);

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  // Merge local messages with Pulse messages for unified view
  const filteredMessages = messages
    .filter(m => m.roomId === activeRoomId)
    .map(m => ({ ...m, source: 'logos' as const } as ExtendedMessage))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Get recent activities (last 20)
  const recentActivities = activities.slice(0, 20);

  const getSender = (senderId: string) => teamMembers.find(m => m.id === senderId);
  const getClientName = (clientId: string | null | undefined) => clientId ? clients.find(c => c.id === clientId)?.name : null;
  const getProjectName = (projectId: string | null | undefined) => projectId ? projects.find(p => p.id === projectId)?.name : null;
  const getTeamMemberName = (memberId: string | null | undefined) => memberId ? teamMembers.find(m => m.id === memberId)?.name : null;
  const getUserPresenceStatus = (userId: string): UserStatus => userPresence.get(userId)?.status || 'offline';

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = pulseIntegrationService.onStatusChange(setSyncStatus);
    return unsubscribe;
  }, []);

  // Initialize presence tracking for current user
  useEffect(() => {
    // Initialize the presence service with current user
    pulsePresenceService.initialize(currentUserId);

    // Subscribe to all presence events
    const unsubscribe = pulsePresenceService.on((event, data) => {
      if (event === 'presence:changed' || event === 'presence:updated') {
        const presence = data as UserPresence;
        setUserPresence(prev => {
          const newMap = new Map(prev);
          newMap.set(presence.userId, presence);
          return newMap;
        });
      }
      if (event === 'notification:received') {
        setUnreadNotifications(prev => prev + 1);
        // Could show toast notification here
      }
    });

    // Note: visibility change is already handled by pulsePresenceService internally

    return () => {
      unsubscribe();
      // Cleanup the presence service
      pulsePresenceService.cleanup();
    };
  }, [currentUserId]);

  // Load meetings on mount
  useEffect(() => {
    loadUpcomingMeetings();
  }, []);

  // Load Pulse data when tab changes to 'pulse' or 'meetings'
  useEffect(() => {
    if (activeTab === 'pulse') {
      loadPulseData();
    } else if (activeTab === 'meetings') {
      loadUpcomingMeetings();
    }
  }, [activeTab]);

  // Load upcoming meetings
  const loadUpcomingMeetings = useCallback(async () => {
    try {
      const meetings = await pulseMeetingService.getUpcomingMeetings();
      setUpcomingMeetings(meetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    }
  }, []);

  // Load channels and messages from Pulse
  const loadPulseData = async () => {
    setIsLoadingPulse(true);
    try {
      const [channels, msgs] = await Promise.all([
        pulseIntegrationService.getChannels(),
        pulseIntegrationService.getRecentMessages(50),
      ]);
      setPulseChannels(channels);
      setPulseMessages(msgs);
    } catch (error) {
      console.error('Failed to load Pulse data:', error);
    } finally {
      setIsLoadingPulse(false);
    }
  };

  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (suggestedReplies.length > 0) {
      setSuggestedReplies([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && activeRoomId) {
      onSendMessage(activeRoomId, newMessage.trim());
      setNewMessage('');
      setSuggestedReplies([]);
    }
  };

  const handleGenerateReplies = async () => {
    if (isGeneratingReplies || filteredMessages.length === 0) return;

    setIsGeneratingReplies(true);
    setSuggestedReplies([]);
    try {
      const replies = await generateSmartReplies(filteredMessages, teamMembers);
      setSuggestedReplies(replies);
    } catch (error) {
      console.error("Failed to generate smart replies:", error);
    } finally {
      setIsGeneratingReplies(false);
    }
  };

  const handleSuggestionClick = (reply: string) => {
    setNewMessage(reply);
    setSuggestedReplies([]);
  };

  const handleSummarize = async () => {
    if (isSummarizing || filteredMessages.length < 3) return;

    setIsSummaryModalOpen(true);
    setIsSummarizing(true);
    setSummaryContent('');

    try {
      const summary = await summarizeChatHistory(filteredMessages, teamMembers);
      setSummaryContent(summary);
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setSummaryContent("Sorry, an error occurred while generating the summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleOpenInPulse = () => {
    pulseIntegrationService.openPulseApp();
  };

  const handleStartVideoCall = () => {
    const meetingUrl = pulseIntegrationService.generateMeetingUrl();
    window.open(meetingUrl, '_blank', 'width=1200,height=800');
  };

  // Join a Pulse meeting
  const handleJoinMeeting = useCallback(async (meeting: PulseMeeting) => {
    try {
      // Start or join the meeting
      if (meeting.status === 'scheduled') {
        await pulseMeetingService.startMeeting(meeting.id);
      }
      // Open the meeting room
      if (meeting.roomUrl) {
        window.open(meeting.roomUrl, '_blank', 'width=1200,height=800');
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
    }
  }, []);

  // Schedule a new quick meeting
  const handleQuickMeeting = useCallback(async () => {
    const roomName = activeRoom?.name || 'Quick Meeting';
    const attendeeIds = activeRoom?.memberIds || [];

    try {
      const meeting = await pulseMeetingService.createMeeting({
        title: `${roomName} - Quick Meeting`,
        description: `Quick meeting started from ${roomName} channel`,
        attendees: attendeeIds.map(id => ({
          id,
          name: teamMembers.find(m => m.id === id)?.name || 'Unknown'
        })),
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      });

      if (meeting?.roomUrl) {
        window.open(meeting.roomUrl, '_blank', 'width=1200,height=800');
      }
    } catch (error) {
      console.error('Failed to create quick meeting:', error);
    }
  }, [activeRoom, teamMembers]);

  // Send message to Pulse channel
  const handleSendToPulse = useCallback(async (text: string, channelId: string) => {
    try {
      // This would send the message through Pulse
      console.log('Sending to Pulse channel:', channelId, text);
      // pulseIntegrationService.sendMessage(channelId, text);
    } catch (error) {
      console.error('Failed to send to Pulse:', error);
    }
  }, []);

  // Link current room to a Pulse channel
  const handleLinkChannel = useCallback(async (pulseChannelId: string) => {
    setSelectedPulseChannel(pulseChannelId);
    // This would create a bi-directional link between the Logos room and Pulse channel
    console.log('Linking room', activeRoomId, 'to Pulse channel', pulseChannelId);
  }, [activeRoomId]);

  // Toggle embedded Pulse view
  const toggleEmbeddedPulse = useCallback(() => {
    setShowEmbeddedPulse(prev => !prev);
  }, []);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setUnreadNotifications(0);
  }, []);

  return (
    <div className="flex h-full -m-6 sm:-m-8">
      {/* Sidebar with channels and tabs */}
      <aside className="w-1/4 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm p-4 flex flex-col border-r border-white/20 dark:border-slate-700">
        {/* Pulse Integration Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <ChatIcon />
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">Pulse</span>
          </div>
          <SyncStatusBadge status={syncStatus} />
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 mb-4 bg-white/30 dark:bg-black/20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-white/50 dark:bg-white/10 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ChatIcon />
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'activities'
                ? 'bg-white/50 dark:bg-white/10 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardListIcon />
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`relative flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'meetings'
                ? 'bg-white/50 dark:bg-white/10 text-emerald-700 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <VideoIcon />
            {upcomingMeetings.some(m => m.status === 'in_progress') && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('pulse')}
            className={`relative flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'pulse'
                ? 'bg-white/50 dark:bg-white/10 text-violet-700 dark:text-violet-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ExternalLinkIcon />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Channels</h2>
              <button
                onClick={onCreateRoom}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-md dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-black/20"
                title="Create new channel"
              >
                <PlusIcon />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
              <ul className="space-y-1">
                {rooms.map(room => (
                  <li key={room.id}>
                    <button
                      onClick={() => setActiveRoomId(room.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeRoomId === room.id
                          ? 'bg-teal-100 text-teal-700 font-semibold dark:bg-teal-900/50 dark:text-teal-300'
                          : 'text-slate-600 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-black/20'
                      }`}
                    >
                      {room.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </>
        ) : activeTab === 'activities' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Activity Log</h2>
              {onLogActivity && (
                <button
                  onClick={onLogActivity}
                  className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-md dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-black/20"
                  title="Log new activity"
                >
                  <PlusIcon />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-white/30 dark:bg-black/20 rounded-lg border border-white/20 dark:border-white/10 hover:border-white/40 dark:hover:border-white/20 transition-colors"
                  >
                    <ActivityTypeIcon type={activity.type} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {getTeamMemberName(activity.createdById)} · {formatTimeAgo(activity.activityDate)}
                      </p>
                      {(activity.clientId || activity.projectId) && (
                        <p className="text-xs text-teal-600 dark:text-teal-400 mt-1 truncate">
                          {getClientName(activity.clientId) || getProjectName(activity.projectId)}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                      activity.status === 'Completed'
                        ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <ClipboardListIcon />
                  <p className="mt-2 text-sm">No recent activities</p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'meetings' ? (
          /* Meetings Tab */
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Meetings</h2>
              <button
                onClick={loadUpcomingMeetings}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-md dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-black/20"
                title="Refresh meetings"
              >
                <RefreshIcon />
              </button>
            </div>

            {/* Quick Meeting Button */}
            <button
              onClick={handleQuickMeeting}
              className="w-full flex items-center justify-center gap-2 p-3 mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium"
            >
              <VideoIcon />
              Start Quick Meeting
            </button>

            {/* Active Meetings */}
            {upcomingMeetings.filter(m => m.status === 'in_progress').length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Live Now
                </h3>
                <div className="space-y-2">
                  {upcomingMeetings
                    .filter(m => m.status === 'in_progress')
                    .map(meeting => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onJoin={handleJoinMeeting}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* Upcoming Meetings */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upcoming</h3>
              {upcomingMeetings.filter(m => m.status === 'scheduled').length > 0 ? (
                <div className="space-y-2">
                  {upcomingMeetings
                    .filter(m => m.status === 'scheduled')
                    .slice(0, 5)
                    .map(meeting => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onJoin={handleJoinMeeting}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <CalendarIcon />
                  <p className="mt-2 text-sm">No upcoming meetings</p>
                  <p className="text-xs mt-1">Schedule one or start a quick meeting</p>
                </div>
              )}
            </div>

            {/* Team Presence */}
            <div className="mt-4 pt-4 border-t border-white/20 dark:border-white/10">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Team Available</h3>
              <div className="flex flex-wrap gap-2">
                {teamMembers
                  .filter(m => getUserPresenceStatus(m.id) === 'online')
                  .slice(0, 6)
                  .map(member => (
                    <div
                      key={member.id}
                      className="flex items-center gap-1.5 px-2 py-1 bg-white/30 dark:bg-black/20 rounded-full"
                      title={member.name}
                    >
                      <PresenceIndicator status="online" size="sm" />
                      <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                        {member.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                {teamMembers.filter(m => getUserPresenceStatus(m.id) === 'online').length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">No team members online</p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Pulse Tab */
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pulse Connect</h2>
              <button
                onClick={loadPulseData}
                disabled={isLoadingPulse}
                className="p-1 text-slate-500 hover:text-slate-900 hover:bg-white/50 rounded-md dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-black/20 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshIcon />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleOpenInPulse}
                className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                <ExternalLinkIcon />
                <span className="font-medium">Open Pulse App</span>
              </button>
              <button
                onClick={handleStartVideoCall}
                className="w-full flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-white/70 dark:hover:bg-black/30 transition-all border border-white/30 dark:border-white/10"
              >
                <VideoIcon />
                <span className="font-medium">Start Video Call</span>
              </button>
              {onOpenPulseSettings && (
                <button
                  onClick={onOpenPulseSettings}
                  className="w-full flex items-center gap-3 p-3 bg-white/30 dark:bg-black/10 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-all"
                >
                  <SettingsIcon />
                  <span className="font-medium">Integration Settings</span>
                </button>
              )}
            </div>

            {/* Sync Stats */}
            <div className="p-3 bg-white/30 dark:bg-black/20 rounded-lg border border-white/20 dark:border-white/10">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Sync Statistics</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                  <div className="text-slate-500 dark:text-slate-400">Total Syncs</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{syncStatus.statistics.totalSyncs}</div>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                  <div className="text-slate-500 dark:text-slate-400">Items Synced</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{syncStatus.statistics.itemsSynced}</div>
                </div>
              </div>
              {syncStatus.lastSyncTime && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Last sync: {formatTimeAgo(syncStatus.lastSyncTime)}
                </p>
              )}
            </div>

            {/* Pulse Channels */}
            {isLoadingPulse ? (
              <div className="flex-1 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
              </div>
            ) : pulseChannels.length > 0 ? (
              <div className="flex-1 overflow-y-auto mt-4 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Pulse Channels</h3>
                {pulseChannels.map(channel => (
                  <div key={channel.id} className="p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{channel.name}</div>
                    {channel.unreadCount > 0 && (
                      <span className="text-xs bg-violet-500 text-white px-2 py-0.5 rounded-full">
                        {channel.unreadCount} unread
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-500 dark:text-slate-400">
                <ChatIcon />
                <p className="mt-2 text-sm">No Pulse channels</p>
                <p className="text-xs">Open Pulse to create channels</p>
              </div>
            )}
          </>
        )}
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col bg-white/5 dark:bg-slate-900/20">
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-500 dark:text-slate-400">Select or create a channel to start chatting.</p>
          </div>
        ) : (
          <>
            <header className="p-4 border-b border-white/20 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{activeRoom.name}</h3>
                <SyncStatusBadge status={syncStatus} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartVideoCall}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md border border-white/30 hover:bg-white/50 text-slate-700 dark:bg-black/20 dark:border-white/20 dark:text-slate-200 dark:hover:bg-black/30"
                  title="Start video call"
                >
                  <VideoIcon />
                </button>
                <button
                  onClick={handleSummarize}
                  disabled={filteredMessages.length < 3 || isSummarizing}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md border border-white/30 hover:bg-white/50 text-slate-700 dark:bg-black/20 dark:border-white/20 dark:text-slate-200 dark:hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Summarize this conversation with AI"
                >
                  <SparklesIcon />
                  {isSummarizing ? 'Summarizing...' : 'Summarize Chat'}
                </button>
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {filteredMessages.map(message => {
                const sender = getSender(message.senderId);
                const isCurrentUser = message.senderId === currentUserId;
                const presenceStatus = getUserPresenceStatus(message.senderId);
                return (
                  <UnifiedMessageView
                    key={message.id}
                    message={message}
                    sender={sender}
                    isCurrentUser={isCurrentUser}
                    presenceStatus={presenceStatus}
                  />
                );
              })}

              {/* Typing Indicator */}
              <TypingIndicator users={typingUsers} />

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/20 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm dark:border-slate-700">
              {suggestedReplies.length > 0 && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {suggestedReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(reply)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white/50 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-full text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-black/40"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={`Message ${activeRoom.name}`}
                  className="flex-1 p-2 bg-white/50 border border-white/30 rounded-md focus:ring-teal-500 focus:border-teal-500 text-slate-900 placeholder-slate-400 dark:bg-black/30 dark:border-white/20 dark:text-white dark:placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={handleGenerateReplies}
                  disabled={isGeneratingReplies || filteredMessages.length < 1}
                  className="p-2 bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300 rounded-md hover:bg-white/80 dark:hover:bg-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate Smart Replies"
                >
                  {isGeneratingReplies ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  ) : (
                    <SparklesIcon />
                  )}
                </button>
                <button type="submit" className="p-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-md hover:from-teal-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-600 dark:disabled:to-slate-600" disabled={!newMessage.trim()}>
                  <SendIcon />
                </button>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Summary Modal */}
      <Modal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        title={`Summary for ${activeRoom?.name}`}
      >
        {isSummarizing ? (
          <div className="flex flex-col items-center justify-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Gemini is generating your summary...</p>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
            {summaryContent}
          </div>
        )}
      </Modal>
    </div>
  );
};
