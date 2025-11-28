import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Circle } from 'lucide-react';
import { useStore, selectOnlineUsers } from '../store/useStore';

export const UserPresence: React.FC = () => {
  const { presenceUsers, updatePresence, ui } = useStore();
  const onlineUsers = selectOnlineUsers(useStore.getState());
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [showPanel, setShowPanel] = React.useState(false);

  // Simulate presence updates (in real app, this would come from WebSocket or Supabase realtime)
  useEffect(() => {
    const interval = setInterval(() => {
      presenceUsers.forEach((user) => {
        updatePresence(user.userId, {
          lastSeen: new Date(),
        });
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [presenceUsers, updatePresence]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDark
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        } relative`}
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">{onlineUsers.length}</span>

        {/* Online Indicator */}
        {onlineUsers.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"
          />
        )}
      </motion.button>

      {/* Presence Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full mt-2 right-0 w-80 rounded-xl shadow-2xl border z-50 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } overflow-hidden`}
          >
            {/* Header */}
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Team Members
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {onlineUsers.length} online • {presenceUsers.length} total
              </p>
            </div>

            {/* User List */}
            <div className="max-h-80 overflow-y-auto">
              {presenceUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No team members
                  </p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {presenceUsers.map((user, index) => (
                    <motion.div
                      key={user.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.userName}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-gray-700' : 'bg-gray-200'
                            }`}
                          >
                            <span className={`text-sm font-medium ${
                              isDark ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              {user.userName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Status Indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 ${
                              isDark ? 'border-gray-800' : 'border-white'
                            } ${getStatusColor(user.status)}`}
                          />
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.userName}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs ${
                              user.status === 'online'
                                ? 'text-green-500'
                                : user.status === 'away'
                                ? 'text-yellow-500'
                                : user.status === 'busy'
                                ? 'text-red-500'
                                : isDark
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            }`}
                          >
                            {getStatusLabel(user.status)}
                          </span>
                          {user.currentPage && (
                            <>
                              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                •
                              </span>
                              <span className={`text-xs truncate ${
                                isDark ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {user.currentPage}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Pulse Animation for Online Users */}
                      {user.status === 'online' && (
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Floating Avatars Component for showing online users in a compact way
export const FloatingAvatars: React.FC<{ maxVisible?: number }> = ({ maxVisible = 5 }) => {
  const { presenceUsers } = useStore();
  const onlineUsers = presenceUsers.filter((u) => u.status === 'online');
  const visibleUsers = onlineUsers.slice(0, maxVisible);
  const remainingCount = onlineUsers.length - maxVisible;

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center -space-x-2">
      {visibleUsers.map((user, index) => (
        <motion.div
          key={user.userId}
          initial={{ scale: 0, x: -20 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
          title={user.userName}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.userName}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </span>
            </div>
          )}

          {/* Online Indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
        </motion.div>
      ))}

      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};
