// usePresence Hook - Track and display online users
import { useState, useEffect } from 'react';
import { presenceService, type PresenceState } from '../services/presenceService';

/**
 * Hook to track presence in a channel
 */
export function usePresence(
  channelName: string,
  initialState?: Partial<PresenceState>,
  enabled: boolean = true
) {
  const [presences, setPresences] = useState<PresenceState[]>([]);
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (!enabled || !channelName) return;

    let unsubscribe: (() => void) | null = null;

    const join = async () => {
      unsubscribe = await presenceService.joinPresence(
        channelName,
        initialState || {},
        (newPresences) => {
          setPresences(newPresences);
        }
      );
      setIsJoined(true);
    };

    join();

    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsJoined(false);
      }
    };
  }, [channelName, enabled]);

  const updatePresence = async (updates: Partial<PresenceState>) => {
    if (isJoined) {
      await presenceService.updatePresence(channelName, updates);
    }
  };

  return {
    presences,
    isJoined,
    updatePresence,
    onlineCount: presences.length,
  };
}

/**
 * Hook to track presence for a specific entity (project, case, etc.)
 */
export function useEntityPresence(
  entityType: string,
  entityId: string,
  enabled: boolean = true
) {
  return usePresence(
    `${entityType}:${entityId}`,
    {
      current_entity_type: entityType,
      current_entity_id: entityId,
    },
    enabled
  );
}

/**
 * Hook for global presence (all online users)
 */
export function useGlobalPresence(enabled: boolean = true) {
  return usePresence('global', {}, enabled);
}
