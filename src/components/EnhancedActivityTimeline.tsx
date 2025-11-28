import React from 'react';
import { motion } from 'framer-motion';
import {
  Phone,
  Mail,
  Video,
  MessageSquare,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';

interface TimelineActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'milestone' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface EnhancedActivityTimelineProps {
  activities: TimelineActivity[];
  showFilters?: boolean;
  maxHeight?: string;
}

export const EnhancedActivityTimeline: React.FC<EnhancedActivityTimelineProps> = ({
  activities,
  showFilters = true,
  maxHeight = '600px',
}) => {
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const { ui } = useStore();
  const isDark = ui.theme === 'dark' || (ui.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const getIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'meeting':
        return <Video className="w-4 h-4" />;
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      case 'task':
        return <CheckCircle className="w-4 h-4" />;
      case 'milestone':
        return <FileText className="w-4 h-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getColor = (type: string, status?: string) => {
    if (status) {
      switch (status) {
        case 'success':
          return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' };
        case 'warning':
          return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
        case 'error':
          return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
        default:
          return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' };
      }
    }

    switch (type) {
      case 'call':
        return { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' };
      case 'email':
        return { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500' };
      case 'meeting':
        return { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' };
      case 'note':
        return { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' };
      case 'task':
        return { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' };
      case 'milestone':
        return { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' };
      case 'alert':
        return { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' };
      default:
        return { bg: 'bg-gray-500', text: 'text-gray-500', border: 'border-gray-500' };
    }
  };

  const filteredActivities =
    selectedTypes.length > 0
      ? activities.filter((a) => selectedTypes.includes(a.type))
      : activities;

  const activityTypes = Array.from(new Set(activities.map((a) => a.type)));

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && activityTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {activityTypes.map((type) => {
            const colors = getColor(type);
            const isSelected = selectedTypes.includes(type);

            return (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleType(type)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? `${colors.bg} text-white`
                    : isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {getIcon(type)}
                <span className="capitalize">{type}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="relative" style={{ maxHeight, overflowY: 'auto' }}>
        {/* Timeline Line */}
        <div
          className={`absolute left-6 top-0 bottom-0 w-0.5 ${
            isDark ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />

        {/* Activities */}
        <div className="space-y-6">
          {filteredActivities.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No activities to display
              </p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => {
              const colors = getColor(activity.type, activity.status);

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-14"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-4 top-2 w-5 h-5 rounded-full ${colors.bg} border-4 ${
                    isDark ? 'border-gray-900' : 'border-white'
                  } shadow-lg z-10`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white scale-75">{getIcon(activity.type)}</div>
                    </div>
                  </div>

                  {/* Content Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className={`rounded-xl p-4 transition-all ${
                      isDark
                        ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
                        : 'bg-white hover:bg-gray-50 border border-gray-200'
                    } shadow-lg`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        {activity.user && (
                          <div className="flex items-center gap-2">
                            {activity.user.avatar ? (
                              <img
                                src={activity.user.avatar}
                                alt={activity.user.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div
                                className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center`}
                              >
                                <User className="w-4 h-4 text-white" />
                              </div>
                            )}
                            <span
                              className={`text-sm font-medium ${
                                isDark ? 'text-gray-300' : 'text-gray-700'
                              }`}
                            >
                              {activity.user.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} whitespace-nowrap ml-4`}
                      >
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      className={`font-semibold mb-1 ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {activity.title}
                    </h4>

                    {/* Description */}
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.description}
                    </p>

                    {/* Metadata */}
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className={`mt-3 pt-3 border-t ${
                        isDark ? 'border-gray-700' : 'border-gray-200'
                      } flex flex-wrap gap-2`}>
                        {Object.entries(activity.metadata).map(([key, value]) => (
                          <span
                            key={key}
                            className={`text-xs px-2 py-1 rounded ${
                              isDark
                                ? 'bg-gray-700 text-gray-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
