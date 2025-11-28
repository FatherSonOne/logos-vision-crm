import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, CheckCheck, Trash2, Settings, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useStore, selectUnreadNotifications } from '../store/useStore';
import { format, formatDistanceToNow } from 'date-fns';

export const NotificationCenter: React.FC = () => {
  const {
    ui,
    toggleNotificationCenter,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
  } = useStore();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        if (ui.notificationCenterOpen) {
          toggleNotificationCenter();
        }
      }
    };

    if (ui.notificationCenterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [ui.notificationCenterOpen, toggleNotificationCenter]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type: string, isDark: boolean) => {
    if (isDark) {
      switch (type) {
        case 'success':
          return 'bg-green-500/10 border-green-500/20';
        case 'warning':
          return 'bg-yellow-500/10 border-yellow-500/20';
        case 'error':
          return 'bg-red-500/10 border-red-500/20';
        default:
          return 'bg-blue-500/10 border-blue-500/20';
      }
    } else {
      switch (type) {
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        default:
          return 'bg-blue-50 border-blue-200';
      }
    }
  };

  if (!ui.notificationCenterOpen) return null;

  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <AnimatePresence>
      <motion.div
        ref={panelRef}
        initial={{ opacity: 0, x: 320 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed top-0 right-0 h-full w-96 z-50 shadow-2xl ${
          isDark ? 'bg-gray-900/95' : 'bg-white/95'
        } backdrop-blur-xl border-l ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </motion.span>
                )}
              </div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notifications
              </h2>
            </div>
            <button
              onClick={toggleNotificationCenter}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                unreadCount === 0
                  ? isDark
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <CheckCheck className="w-4 h-4 inline mr-1" />
              Mark All Read
            </button>
            <button
              onClick={clearNotifications}
              disabled={notifications.length === 0}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                notifications.length === 0
                  ? isDark
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isDark
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Clear All
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100vh-160px)] p-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bell className={`w-16 h-16 mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
              <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No notifications
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence>
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className={`relative p-4 rounded-lg border transition-all ${
                      getBackgroundColor(notification.type, isDark)
                    } ${
                      !notification.read
                        ? 'ring-2 ring-blue-500/20'
                        : ''
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className={`p-1 rounded transition-colors ${
                              isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>

                        <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                          </span>

                          <div className="flex gap-2">
                            {notification.actionUrl && notification.actionLabel && (
                              <button
                                onClick={() => {
                                  if (notification.actionUrl) {
                                    window.location.href = notification.actionUrl;
                                  }
                                }}
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  isDark
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                              >
                                {notification.actionLabel}
                              </button>
                            )}
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  isDark
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
