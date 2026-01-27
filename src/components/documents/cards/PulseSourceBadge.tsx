/**
 * Pulse Source Badge
 * Visual indicator showing document originated from Pulse
 */

import React from 'react';
import { Cloud, Calendar, MessageSquare, Mic, FolderOpen } from 'lucide-react';
import type { PulseDocumentSource } from '../../../types/documents';

interface PulseSourceBadgeProps {
  source: PulseDocumentSource;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const PulseSourceBadge: React.FC<PulseSourceBadgeProps> = ({
  source,
  size = 'md',
  showLabel = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getIcon = () => {
    switch (source.type) {
      case 'meeting':
        return <Calendar className={iconSizes[size]} />;
      case 'chat_archive':
      case 'conversation':
        return <MessageSquare className={iconSizes[size]} />;
      case 'vox':
        return <Mic className={iconSizes[size]} />;
      default:
        return <Cloud className={iconSizes[size]} />;
    }
  };

  const getTypeLabel = () => {
    switch (source.type) {
      case 'meeting':
        return 'Pulse Meeting';
      case 'chat_archive':
      case 'conversation':
        return 'Pulse Chat';
      case 'vox':
        return 'Pulse Vox';
      default:
        return 'Pulse';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium ${sizeClasses[size]}`}
      title={`From ${getTypeLabel()}: ${source.title}`}
    >
      {getIcon()}
      {showLabel && <span>{getTypeLabel()}</span>}
    </div>
  );
};
