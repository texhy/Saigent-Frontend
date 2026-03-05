'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import type { AIResponseDraftListItem, DraftStats, DraftDebugInfo } from '@/types';
import { POLLING_INTERVAL } from '@/lib/constants';

interface UseDraftsOptions {
  status?: string;
  enablePolling?: boolean;
  pollingInterval?: number;
}

export function useDrafts(options: UseDraftsOptions = {}) {
  const { 
    status = 'pending', 
    enablePolling = true,
    pollingInterval = POLLING_INTERVAL 
  } = options;
  
  const [drafts, setDrafts] = useState<AIResponseDraftListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPending, setTotalPending] = useState(0);
  const lastFetchTime = useRef<string | null>(null);

  // Fetch drafts
  const fetchDrafts = useCallback(async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);
      setError(null);

      const params: Record<string, string> = { status };
      if (isPolling && lastFetchTime.current) {
        params.since = lastFetchTime.current;
      }

      const response = await api.getPendingDrafts(params);
      const { drafts: newDrafts, server_time, total_pending } = response;
      
      lastFetchTime.current = server_time;
      setTotalPending(total_pending);

      if (isPolling && params.since) {
        // Merge new drafts with existing ones
        setDrafts((prev) => {
          const updated = [...prev];
          for (const draft of newDrafts) {
            const idx = updated.findIndex((d) => d.id === draft.id);
            if (idx >= 0) {
              updated[idx] = draft;
            } else {
              updated.unshift(draft); // New drafts at the top
            }
          }
          // Remove any drafts that are no longer pending (if we're filtering by pending)
          if (status === 'pending') {
            return updated.filter(d => d.status === 'pending');
          }
          return updated.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      } else {
        setDrafts(newDrafts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch drafts');
      console.error('Fetch drafts error:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Approve draft
  const approveDraft = useCallback(async (draftId: number, editedContent?: string) => {
    try {
      const response = await api.approveDraft(draftId, editedContent);
      
      // Remove the approved draft from the list
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      setTotalPending((prev) => Math.max(0, prev - 1));
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve draft';
      setError(message);
      throw err;
    }
  }, []);

  // Reject draft
  const rejectDraft = useCallback(async (draftId: number, reason?: string) => {
    try {
      const response = await api.rejectDraft(draftId, reason);
      
      // Remove the rejected draft from the list
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      setTotalPending((prev) => Math.max(0, prev - 1));
      
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject draft';
      setError(message);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    lastFetchTime.current = null;
    fetchDrafts(false);
  }, [fetchDrafts]);

  // Polling
  useEffect(() => {
    if (!enablePolling) return;

    const interval = setInterval(() => {
      fetchDrafts(true);
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [enablePolling, pollingInterval, fetchDrafts]);

  return {
    drafts,
    loading,
    error,
    totalPending,
    approveDraft,
    rejectDraft,
    refresh: () => fetchDrafts(false),
  };
}

// Hook for getting detailed draft info
export function useDraftDetail(draftId: number | null) {
  const [draft, setDraft] = useState<DraftDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDraft = useCallback(async () => {
    if (!draftId) {
      setDraft(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.getDraftDebug(draftId);
      setDraft(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch draft details');
      console.error('Fetch draft detail error:', err);
    } finally {
      setLoading(false);
    }
  }, [draftId]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  return { draft, loading, error, refresh: fetchDraft };
}

// Hook for draft statistics
export function useDraftStats() {
  const [stats, setStats] = useState<DraftStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDraftStats();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch draft stats');
      console.error('Fetch draft stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}

