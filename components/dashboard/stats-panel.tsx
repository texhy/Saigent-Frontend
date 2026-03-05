'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Bot, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Instagram,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStats } from '@/hooks/use-stats';
import { cn, formatNumber } from '@/lib/utils';

export function StatsPanel() {
  const [expanded, setExpanded] = useState(false);
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="h-14 border-b bg-white flex items-center px-4 gap-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={cn(
      'border-b bg-white transition-all duration-200',
      expanded ? 'py-4' : ''
    )}>
      {/* Collapsed View */}
      <div className="h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-6">
          {/* Total Conversations */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversations</p>
              <p className="text-sm font-semibold">{formatNumber(stats.conversations.total)}</p>
            </div>
          </div>

          {/* Active Today */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-sm font-semibold">{stats.conversations.active}</p>
            </div>
          </div>

          {/* Messages Today */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Today</p>
              <p className="text-sm font-semibold">{formatNumber(stats.messages.today)}</p>
            </div>
          </div>

          {/* AI Responses */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Bot className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Responses</p>
              <p className="text-sm font-semibold">{formatNumber(stats.ai_performance.total_ai_responses)}</p>
            </div>
          </div>

          {/* Avg Latency */}
          {stats.ai_performance.avg_latency_ms > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Response</p>
                <p className="text-sm font-semibold">{Math.round(stats.ai_performance.avg_latency_ms)}ms</p>
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="gap-1"
        >
          {expanded ? (
            <>
              Less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              More <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideUp">
          {/* Per-Channel Stats */}
          {stats.channels?.map((channel) => (
            <div 
              key={channel.account_id}
              className="p-3 rounded-lg bg-slate-50 border"
            >
              <div className="flex items-center gap-2 mb-2">
                {channel.platform === 'instagram' ? (
                  <Instagram className="h-4 w-4" style={{ color: '#E4405F' }} />
                ) : (
                  <MessageCircle className="h-4 w-4" style={{ color: '#0084FF' }} />
                )}
                <span className="text-sm font-medium truncate">
                  {channel.instagram_username ? `@${channel.instagram_username}` : channel.page_name}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Conversations</p>
                  <p className="font-semibold">{channel.conversations}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unread</p>
                  <p className="font-semibold text-red-500">{channel.unread}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Messages</p>
                  <p className="font-semibold">{channel.messages_total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">AI Replies</p>
                  <p className="font-semibold">{channel.ai_responses}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Message Breakdown */}
          <div className="p-3 rounded-lg bg-slate-50 border col-span-2">
            <h4 className="text-sm font-medium mb-2">Message Breakdown</h4>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="font-semibold">{formatNumber(stats.messages.total)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Inbound</p>
                <p className="font-semibold">
                  {formatNumber(
                    Object.values(stats.messages.by_platform).reduce((sum, p) => sum + (p.inbound || 0), 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Outbound</p>
                <p className="font-semibold">
                  {formatNumber(
                    Object.values(stats.messages.by_platform).reduce((sum, p) => sum + (p.outbound || 0), 0)
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">AI Generated</p>
                <p className="font-semibold">
                  {formatNumber(
                    Object.values(stats.messages.by_platform).reduce((sum, p) => sum + (p.ai_generated || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

