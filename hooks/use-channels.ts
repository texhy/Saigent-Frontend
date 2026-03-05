'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { ConnectedAccount, ChannelStatus, Platform } from '@/types';

export function useChannels() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { accounts } = await api.getConnectedAccounts();
      setAccounts(accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
      console.error('Fetch accounts error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const getChannelStatus = useCallback(
    (platform: Platform): ChannelStatus => {
      const account = accounts.find((a) => a.platform === platform);
      return {
        platform,
        connected: !!account,
        account,
      };
    },
    [accounts]
  );

  const connectChannel = useCallback((platform: Platform) => {
    const url = platform === 'instagram' 
      ? api.getInstagramLoginUrl() 
      : api.getMessengerLoginUrl();
    window.location.href = url;
  }, []);

  const disconnectChannel = useCallback(async (accountId: number) => {
    try {
      await api.disconnectAccount(accountId);
      await fetchAccounts();
    } catch (err) {
      throw err;
    }
  }, [fetchAccounts]);

  const hasAnyConnection = accounts.length > 0;

  return {
    accounts,
    loading,
    error,
    getChannelStatus,
    connectChannel,
    disconnectChannel,
    hasAnyConnection,
    refresh: fetchAccounts,
  };
}

