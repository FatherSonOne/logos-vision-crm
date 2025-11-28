// OnlineUsers - Display users currently viewing the same entity
import React from 'react';
import type { PresenceState } from '../services/presenceService';

interface OnlineUsersProps {
  presences: PresenceState[];
  maxAvatars?: number;
  showNames?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({
  presences,
  maxAvatars = 5,
  showNames = false,
  size = 'md',
}) => {
  if (presences.length === 0) return null;

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const displayedPresences = presences.slice(0, maxAvatars);
  const remainingCount = Math.max(0, presences.length - maxAvatars);

  return (
    <div className="flex items-center gap-2">
      {showNames && presences.length === 1 ? (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {presences[0].user_name} is viewing
        </span>
      ) : (
        <>
          <div className="flex -space-x-2">
            {displayedPresences.map((presence) => (
              <UserAvatar
                key={presence.user_id}
                presence={presence}
                size={size}
                className={sizeClasses[size]}
              />
            ))}
            {remainingCount > 0 && (
              <div
                className={`
                  ${sizeClasses[size]}
                  rounded-full bg-slate-200 dark:bg-slate-700
                  border-2 border-white dark:border-slate-800
                  flex items-center justify-center
                  text-slate-600 dark:text-slate-300 font-semibold
                `}
                title={`${remainingCount} more online`}
              >
                +{remainingCount}
              </div>
            )}
          </div>
          {showNames && (
            <span className="text-sm text-slate-600 dark:text-slate-300">
              {presences.length} online
            </span>
          )}
        </>
      )}
    </div>
  );
};

interface UserAvatarProps {
  presence: PresenceState;
  size: 'sm' | 'md' | 'lg';
  className: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ presence, className }) => {
  const initials = presence.user_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  // Generate consistent color based on user_id
  const colorIndex = presence.user_id.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div
      className={`
        ${className}
        rounded-full ${bgColor}
        border-2 border-white dark:border-slate-800
        flex items-center justify-center
        text-white font-semibold
        relative
        hover:z-10 hover:scale-110 transition-transform
        cursor-pointer
      `}
      title={`${presence.user_name} (${presence.user_role || 'User'})`}
    >
      {presence.user_avatar ? (
        <img
          src={presence.user_avatar}
          alt={presence.user_name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
      {/* Online indicator */}
      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
    </div>
  );
};

// Compact variant for headers/toolbars
export const OnlineIndicator: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded-full border border-green-200 dark:border-green-800">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
      <span className="text-xs font-medium text-green-700 dark:text-green-300">
        {count} online
      </span>
    </div>
  );
};

// Real-time activity indicator
export const LiveIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
        LIVE
      </span>
    </div>
  );
};
