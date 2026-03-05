'use client';

import { Instagram, MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, getInitials, truncate } from '@/lib/utils';
import type { Conversation } from '@/types';

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ConversationList({
  conversations,
  loading,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (loading) {
    return (
      <div className="flex-1 p-3 space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3 p-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <MessageCircle className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm text-muted-foreground">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Messages will appear here when customers contact you
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {conversations.map((conversation) => {
          const isSelected = selectedId === conversation.id;
          const PlatformIcon = conversation.platform === 'instagram' ? Instagram : MessageCircle;
          const platformColor = conversation.platform === 'instagram' ? '#E4405F' : '#0084FF';

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={cn(
                'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
                isSelected
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-slate-50'
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-slate-200 text-slate-600 text-sm">
                    {getInitials(conversation.participant_name)}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-white flex items-center justify-center"
                >
                  <PlatformIcon className="h-3 w-3" style={{ color: platformColor }} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'text-sm truncate',
                    conversation.unread_count > 0 ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                  )}>
                    {conversation.participant_name}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatDate(conversation.last_message_at)}
                  </span>
                </div>
                
                {conversation.participant_username && (
                  <p className="text-xs text-muted-foreground truncate">
                    @{conversation.participant_username}
                  </p>
                )}
                
                <p className={cn(
                  'text-xs mt-1 truncate',
                  conversation.unread_count > 0 ? 'text-slate-700' : 'text-muted-foreground'
                )}>
                  {conversation.last_message_preview || 'No messages'}
                </p>
              </div>

              {/* Unread Badge */}
              {conversation.unread_count > 0 && (
                <Badge className="bg-blue-500 text-white h-5 min-w-[20px] px-1.5 text-xs">
                  {conversation.unread_count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

