'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { Session } from '@/types';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.initSession();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize session');
      console.error('Session init error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initSession();
  }, [initSession]);

  return {
    session,
    loading,
    error,
    refresh: initSession,
  };
}

