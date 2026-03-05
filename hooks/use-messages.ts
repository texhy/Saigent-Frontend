'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import type { Message, Conversation } from '@/types';
import { POLLING_INTERVAL } from '@/lib/constants';

interface UseMessagesOptions {
  conversationId: number | null;
  enablePolling?: boolean;
}

export function useMessages(options: UseMessagesOptions) {
  const { conversationId, enablePolling = true } = options;
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchTime = useRef<string | null>(null);

  const fetchMessages = useCallback(async (isPolling = false) => {
    if (!conversationId) return;

    try {
      if (!isPolling) setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (isPolling && lastFetchTime.current) {
        params.since = lastFetchTime.current;
      }

      const response = await api.getMessages(conversationId, params);
      const { conversation: conv, messages: newMessages, server_time } = response;

      lastFetchTime.current = server_time;
      setConversation(conv);

      if (isPolling && params.since) {
        // Append only new messages
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNew = newMessages.filter((m) => !existingIds.has(m.id));
          if (uniqueNew.length === 0) return prev;
          // Sort by created_at ascending (oldest first for chat view)
          return [...prev, ...uniqueNew].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
      } else {
        // Full load - already sorted by backend (oldest to newest)
        setMessages(newMessages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
      console.error('Fetch messages error:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Reset when conversation changes
  useEffect(() => {
    lastFetchTime.current = null;
    setMessages([]);
    setConversation(null);
    setError(null);
    if (conversationId) {
      fetchMessages(false);
    }
  }, [conversationId, fetchMessages]);

  // Polling
  useEffect(() => {
    if (!enablePolling || !conversationId) return;

    const interval = setInterval(() => {
      fetchMessages(true);
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [enablePolling, conversationId, fetchMessages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!conversationId) return;

    try {
      setSending(true);
      const { message } = await api.sendMessage(conversationId, text);
      
      // Optimistically add message
      setMessages((prev) => [...prev, message]);
      
      return message;
    } catch (err) {
      throw err;
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  return {
    messages,
    conversation,
    loading,
    sending,
    error,
    sendMessage,
    refresh: () => fetchMessages(false),
  };
}

