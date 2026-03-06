'use client';

import { Bot, User, Headphones, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
  mergedAttachment?: { url: string; type: string };
}

export function MessageBubble({ message, mergedAttachment }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const messageType = message.message_type;
  
  // Determine styling based on message type
  const getMessageStyle = () => {
    if (isInbound) {
      return {
        align: 'justify-start',
        bubble: 'bg-white border border-slate-200 text-slate-900',
        avatar: 'bg-slate-100',
        icon: User,
        iconColor: 'text-slate-500',
      };
    }
    
    if (messageType === 'ai') {
      return {
        align: 'justify-end',
        bubble: 'bg-blue-500 text-white',
        avatar: 'bg-blue-100',
        icon: Bot,
        iconColor: 'text-blue-500',
      };
    }
    
    // Human operator
    return {
      align: 'justify-end',
      bubble: 'bg-emerald-500 text-white',
      avatar: 'bg-emerald-100',
      icon: Headphones,
      iconColor: 'text-emerald-500',
    };
  };

  const style = getMessageStyle();
  const Icon = style.icon;

  return (
    <div className={cn('flex gap-2', style.align)}>
      {/* Avatar for inbound messages */}
      {isInbound && (
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0', style.avatar)}>
          <Icon className={cn('h-4 w-4', style.iconColor)} />
        </div>
      )}

      {/* Message Content */}
      <div className={cn('max-w-[70%] flex flex-col', isInbound ? 'items-start' : 'items-end')}>
        <div className={cn('rounded-2xl px-4 py-2', style.bubble)}>
          {message.content && !message.content.startsWith('[') && (
            <p className={cn('text-sm whitespace-pre-wrap break-words', (message.has_attachment || mergedAttachment) ? 'mb-2' : '')}>
              {message.content}
            </p>
          )}
          {(message.has_attachment && message.attachment_url && (message.attachment_type === 'image' || message.attachment_type === 'sticker')) && (
            <div>
              <img
                src={message.attachment_url}
                alt="Attachment"
                className="rounded-lg max-h-64 object-contain"
              />
            </div>
          )}
          {mergedAttachment && (
            <div>
              <img
                src={mergedAttachment.url}
                alt="Attachment"
                className="rounded-lg max-h-64 object-contain"
              />
            </div>
          )}
          {!message.content && !message.has_attachment && !mergedAttachment && (
            <p className="text-sm">{'\u00A0'}</p>
          )}
        </div>
        
        {/* Metadata */}
        <div className={cn(
          'flex items-center gap-2 mt-1 text-xs text-muted-foreground',
          isInbound ? 'flex-row' : 'flex-row-reverse'
        )}>
          <span>{formatTime(message.created_at)}</span>
          
          {/* AI Response Metadata */}
          {messageType === 'ai' && message.ai_latency_ms && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{message.ai_latency_ms}ms</span>
            </div>
          )}
          
          {/* Message Type Badge */}
          {!isInbound && (
            <Badge 
              variant="outline" 
              className={cn(
                'text-[10px] h-4 px-1',
                messageType === 'ai' ? 'border-blue-200 text-blue-600' : 'border-emerald-200 text-emerald-600'
              )}
            >
              {messageType === 'ai' ? 'AI' : 'You'}
            </Badge>
          )}
        </div>

        {/* AI Intent & Sources */}
        {messageType === 'ai' && (message.ai_intent || message.rag_sources_used?.length) && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.ai_intent && (
              <Badge variant="secondary" className="text-xs">
                {message.ai_intent}
                {message.ai_confidence && ` (${Math.round(message.ai_confidence * 100)}%)`}
              </Badge>
            )}
            {message.rag_sources_used?.slice(0, 2).map((source, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                📚 {source.title}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Avatar for outbound messages */}
      {!isInbound && (
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0', style.avatar)}>
          <Icon className={cn('h-4 w-4', style.iconColor)} />
        </div>
      )}
    </div>
  );
}

