'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { KnowledgeBase, KnowledgeStats } from '@/types';

export function useKnowledge() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKnowledgeBases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [kbData, statsData] = await Promise.all([
        api.getKnowledgeBases(),
        api.getKnowledgeStats(),
      ]);
      setKnowledgeBases(kbData.knowledge_bases);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch knowledge bases');
      console.error('Fetch knowledge bases error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKnowledgeBases();
  }, [fetchKnowledgeBases]);

  // Poll for processing status
  useEffect(() => {
    const hasProcessing = knowledgeBases.some((kb) => kb.status === 'processing');
    if (!hasProcessing) return;

    const interval = setInterval(fetchKnowledgeBases, 5000);
    return () => clearInterval(interval);
  }, [knowledgeBases, fetchKnowledgeBases]);

  const uploadWebsite = useCallback(async (url: string) => {
    const result = await api.uploadWebsite(url);
    await fetchKnowledgeBases();
    return result;
  }, [fetchKnowledgeBases]);

  const uploadDocument = useCallback(async (file: File) => {
    const result = await api.uploadDocument(file);
    await fetchKnowledgeBases();
    return result;
  }, [fetchKnowledgeBases]);

  const deleteKnowledgeBase = useCallback(async (kbId: number) => {
    await api.deleteKnowledgeBase(kbId);
    await fetchKnowledgeBases();
  }, [fetchKnowledgeBases]);

  const hasReadyKnowledgeBase = knowledgeBases.some((kb) => kb.status === 'ready');
  const hasProcessingKnowledgeBase = knowledgeBases.some((kb) => kb.status === 'processing');

  return {
    knowledgeBases,
    stats,
    loading,
    error,
    uploadWebsite,
    uploadDocument,
    deleteKnowledgeBase,
    hasReadyKnowledgeBase,
    hasProcessingKnowledgeBase,
    refresh: fetchKnowledgeBases,
  };
}

