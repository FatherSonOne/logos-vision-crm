import React, { useState, useEffect, useRef } from 'react';
import type { ChatRoom, ChatMessage, TeamMember, Activity, Client, Project } from '../types';
import { ActivityType } from '../types';
import { PlusIcon, SendIcon, SparklesIcon, PhoneIcon, MailIcon, UsersIcon, DocumentTextIcon, ClipboardListIcon, ChatIcon } from './icons';
import { Modal } from './Modal';
import { summarizeChatHistory, generateSmartReplies } from '../services/geminiService';

interface TeamChatProps {
  rooms: ChatRoom[];
  messages: ChatMessage[];
  teamMembers: TeamMember[];
  currentUserId: string;
  onSendMessage: (roomId: string, text: string) => void;
  onCreateRoom: () => void;
  // New props for activities
  activities?: Activity[];
  clients?: Client[];
  projects?: Project[];
  onLogActivity?: () => void;
}

// Compact Activity Icon
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

export const TeamChat: React.FC<TeamChatProps> = ({ 
  rooms, 
  messages, 
  teamMembers, 
  currentUserId, 
  onSendMessage, 
  onCreateRoom,
  activities = [],
  clients = [],
  projects = [],
  onLogActivity
}) => {
  const [activeRoomId, setActiveRoomId] = useState<string>(rooms[0]?.id || '');
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'activities'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [isGeneratingReplies, setIsGeneratingReplies] = useState(false);

  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const activeRoom = rooms.find(r => r.id === activeRoomId);
  const filteredMessages = messages.filter(m => m.roomId === activeRoomId).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Get recent activities (last 20)
  const recentActivities = activities.slice(0, 20);

  const getSender = (senderId: string) => teamMembers.find(m => m.id === senderId);
  const getClientName = (clientId: string | null | undefined) => clientId ? clients.find(c => c.id === clientId)?.name : null;
  const getProjectName = (projectId: string | null | undefined) => projectId ? projects.find(p => p.id === projectId)?.name : null;
  const getTeamMemberName = (memberId: string | null | undefined) => memberId ? teamMembers.find(m => m.id === memberId)?.name : null;

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

  return (
    <div className="flex h-full -m-6 sm:-m-8">
      {/* Sidebar with channels and activity tabs */}
      <aside className="w-1/4 bg-white/20 dark:bg-slate-900/40 backdrop-blur-sm p-4 flex flex-col border-r border-white/20 dark:border-slate-700">
        {/* Tab Switcher */}
        <div className="flex mb-4 bg-white/30 dark:bg-black/20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'chat'
                ? 'bg-white/50 dark:bg-white/10 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ChatIcon />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'activities'
                ? 'bg-white/50 dark:bg-white/10 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ClipboardListIcon />
            Activity
          </button>
        </div>


        {activeTab === 'chat' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Channels</h2>
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
        ) : (
          /* Activity Log Tab */
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Activity Log</h2>
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{activeRoom.name}</h3>
              <button
                onClick={handleSummarize}
                disabled={filteredMessages.length < 3 || isSummarizing}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md border border-white/30 hover:bg-white/50 text-slate-700 dark:bg-black/20 dark:border-white/20 dark:text-slate-200 dark:hover:bg-black/30 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Summarize this conversation with AI"
              >
                <SparklesIcon />
                {isSummarizing ? 'Summarizing...' : 'Summarize Chat'}
              </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {filteredMessages.map(message => {
                const sender = getSender(message.senderId);
                const isCurrentUser = message.senderId === currentUserId;
                return (
                  <div key={message.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center font-bold text-sm text-slate-600 flex-shrink-0 dark:bg-black/20 dark:text-slate-300">
                      {sender?.name.charAt(0)}
                    </div>
                    <div className={`p-3 rounded-lg max-w-lg ${isCurrentUser ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white' : 'bg-white/30 dark:bg-slate-800/30 text-slate-800 dark:text-slate-200'}`}>
                      {!isCurrentUser && (
                          <p className="text-sm font-bold text-teal-600 mb-1 dark:text-teal-400">{sender?.name}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-1 opacity-70 ${isCurrentUser ? 'text-teal-200' : 'text-slate-500 dark:text-slate-400'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
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
