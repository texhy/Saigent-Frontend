'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import type { Conversation, Platform } from '@/types';
import { POLLING_INTERVAL } from '@/lib/constants';

interface UseConversationsOptions {
  platform?: Platform;
  enablePolling?: boolean;
  autoSync?: boolean; // Sync from Graph API on first load
}

export function useConversations(options: UseConversationsOptions = {}) {
  const { platform, enablePolling = true, autoSync = true } = options;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const lastFetchTime = useRef<string | null>(null);
  const hasSynced = useRef(false);

  const fetchConversations = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (platform) params.platform = platform;
      if (isPolling && lastFetchTime.current) {
        params.since = lastFetchTime.current;
      }

      const response = await api.getConversations(params);
      const { conversations: newConversations, server_time, total_unread } = response;
      lastFetchTime.current = server_time;
      setTotalUnread(total_unread || 0);

      if (isPolling && params.since) {
        // Merge new/updated conversations
        setConversations((prev) => {
          const updated = [...prev];
          for (const conv of newConversations) {
            const idx = updated.findIndex((c) => c.id === conv.id);
            if (idx >= 0) {
              updated[idx] = conv;
            } else {
              updated.unshift(conv);
            }
          }
          // Sort by last_message_at
          return updated.sort(
            (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
          );
        });
      } else {
        setConversations(newConversations);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      console.error('Fetch conversations error:', err);
    } finally {
      setLoading(false);
    }
  }, [platform]);

  // Sync conversations from Graph API
  const syncConversations = useCallback(async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const params: Record<string, string> = {};
      if (platform) params.platform = platform;
      
      console.log('🔄 Syncing conversations from Graph API...');
      const result = await api.syncConversations(params);
      console.log(`✅ Synced: ${result.synced_conversations} conversations, ${result.synced_messages} messages`);
      
      // Refresh conversations after sync
      await fetchConversations(false);
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sync conversations';
      setError(errorMsg);
      console.error('Sync conversations error:', err);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [platform, fetchConversations]);

  // Initial load: sync from Graph API first, then fetch from database
  useEffect(() => {
    const initLoad = async () => {
      lastFetchTime.current = null;
      
      // Auto-sync on first load if enabled and not already synced
      if (autoSync && !hasSynced.current) {
        hasSynced.current = true;
        try {
          await syncConversations();
        } catch (err) {
          // Sync failed, just fetch existing data
          console.warn('Auto-sync failed, fetching existing data:', err);
          await fetchConversations(false);
        }
      } else {
        await fetchConversations(false);
      }
    };
    
    initLoad();
  }, [autoSync, syncConversations, fetchConversations]);

  // Polling
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      fetchConversations(true);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [enablePolling, fetchConversations]);

  return {
    conversations,
    loading,
    syncing,
    error,
    totalUnread,
    refresh: () => fetchConversations(false),
    sync: syncConversations,
  };
}

