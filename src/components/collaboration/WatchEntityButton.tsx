import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { isUserWatching, watchEntity, unwatchEntity } from '../../services/collaborationService';
import type { CollaborationEntityType, EntityWatcher } from '../../types';

interface WatchEntityButtonProps {
  entityType: CollaborationEntityType;
  entityId: string;
  currentUserId: string;
  className?: string;
}

export const WatchEntityButton: React.FC<WatchEntityButtonProps> = ({
  entityType,
  entityId,
  currentUserId,
  className = ''
}) => {
  const [watching, setWatching] = useState<EntityWatcher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await isUserWatching(entityType, entityId, currentUserId);
        setWatching(status);
      } catch (error) {
        console.error('Error checking watch status:', error);
      }
    };
    checkStatus();
  }, [entityType, entityId, currentUserId]);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (watching) {
        await unwatchEntity(entityType, entityId, currentUserId);
        setWatching(null);
      } else {
        const watcher = await watchEntity(entityType, entityId, currentUserId, 'all');
        setWatching(watcher);
      }
    } catch (error) {
      console.error('Error toggling watch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        watching
          ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-900/50'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
      title={watching ? 'Stop watching this project' : 'Watch this project for updates'}
    >
      {watching ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      <span className="font-medium">{watching ? 'Watching' : 'Watch'}</span>
    </button>
  );
};
