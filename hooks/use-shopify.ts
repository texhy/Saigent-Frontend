'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { ShopifyConnectionStatus } from '@/types';

export function useShopify() {
  const [status, setStatus] = useState<ShopifyConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getShopifyStatus();
      setStatus(data);
    } catch (err) {
      // If 404 or no connection, treat as not connected
      setStatus({ connected: false, stores: [] });
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const connect = useCallback((shopDomain: string) => {
    const url = api.getShopifyConnectUrl(shopDomain);
    window.location.href = url;
  }, []);

  const disconnect = useCallback(async (shopDomain: string) => {
    try {
      await api.disconnectShopify(shopDomain);
      await fetchStatus();
    } catch (err) {
      throw err;
    }
  }, [fetchStatus]);

  // Get the first connected store (primary store)
  const primaryStore = status?.stores?.[0] ?? null;

  return {
    status,
    loading,
    error,
    connected: status?.connected ?? false,
    shopDomain: primaryStore?.shop_domain ?? '',
    shopName: primaryStore?.shop_name ?? '',
    stores: status?.stores ?? [],
    connect,
    disconnect,
    refresh: fetchStatus,
  };
}
