'use client';

import { useEffect, useRef } from 'react';
import { Instagram, MessageCircle, Loader2, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageBubble } from './message-bubble';
import { MessageComposer } from './message-composer';
import { useToast } from '@/hooks/use-toast';
import { cn, getInitials } from '@/lib/utils';
import type { Conversation, Message } from '@/types';

interface ChatViewProps {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  onSend: (text: string) => Promise<void>;
}

export function ChatView({
  conversation,
  messages,
  loading,
  sending,
  onSend,
}: ChatViewProps) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    try {
      await onSend(text);
    } catch (error) {
      toast({
        title: 'Failed to send',
        description: error instanceof Error ? error.message : 'Could not send message',
        variant: 'destructive',
      });
    }
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center p-6">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Select a conversation</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a conversation from the list to view messages and respond to your customers
          </p>
        </div>
      </div>
    );
  }

  const PlatformIcon = conversation.platform === 'instagram' ? Instagram : MessageCircle;
  const platformColor = conversation.platform === 'instagram' ? '#E4405F' : '#0084FF';
  const platformName = conversation.platform === 'instagram' ? 'Instagram' : 'Messenger';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Chat Header */}
      <div className="h-16 border-b bg-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
              {getInitials(conversation.participant_name)}
            </div>
            <div 
              className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center"
            >
              <PlatformIcon className="h-3 w-3" style={{ color: platformColor }} />
            </div>
          </div>
          
          {/* Info */}
          <div>
            <h3 className="font-semibold text-slate-900">{conversation.participant_name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {conversation.participant_username && (
                <span>@{conversation.participant_username}</span>
              )}
              <Badge 
                variant="outline" 
                className="text-[10px] h-4 px-1.5"
                style={{ borderColor: platformColor, color: platformColor }}
              >
                {platformName}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {conversation.message_count || messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 bg-slate-50" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {loading ? (
            // Loading skeleton
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={cn('flex gap-2', i % 2 === 0 ? 'justify-start' : 'justify-end')}>
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-64' : 'w-48')} />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            // No messages yet
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start the conversation by sending a message
                </p>
              </div>
            </div>
          ) : (
            // Messages
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Message Composer */}
      <MessageComposer
        onSend={handleSend}
        sending={sending}
        disabled={loading}
      />
    </div>
  );
}

