'use client';

import { useDrafts } from '@/hooks/use-drafts';
import { DraftCard } from './draft-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bot, 
  RefreshCw, 
  Inbox,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { toast } from 'sonner';

interface DraftQueueProps {
  className?: string;
  maxHeight?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function DraftQueue({ 
  className,
  maxHeight = '600px',
  collapsible = true,
  defaultCollapsed = false 
}: DraftQueueProps) {
  const { drafts, loading, error, totalPending, approveDraft, rejectDraft, refresh } = useDrafts();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleApprove = async (draftId: number, editedContent?: string) => {
    try {
      await approveDraft(draftId, editedContent);
      toast.success('Draft approved and sent!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve draft');
    }
  };

  const handleReject = async (draftId: number, reason?: string) => {
    try {
      await rejectDraft(draftId, reason);
      toast.success('Draft rejected');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject draft');
    }
  };

  // Don't render if no pending drafts and not loading
  if (!loading && drafts.length === 0 && totalPending === 0) {
    return null;
  }

  return (
    <div className={cn("border rounded-lg bg-card overflow-hidden", className)}>
      {/* Header */}
      <div 
        className={cn(
          "flex items-center justify-between p-3 bg-primary/5 border-b",
          collapsible && "cursor-pointer hover:bg-primary/10 transition-colors"
        )}
        onClick={() => collapsible && setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-full bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-sm">AI Drafts Pending Review</h3>
            <p className="text-xs text-muted-foreground">
              {totalPending > 0 ? `${totalPending} draft${totalPending !== 1 ? 's' : ''} awaiting approval` : 'No pending drafts'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {totalPending > 0 && (
            <Badge variant="default" className="text-xs">
              {totalPending}
            </Badge>
          )}
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          
          {collapsible && (
            collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-3">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <DraftCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                Try Again
              </Button>
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No drafts pending review</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                New drafts will appear here when messages arrive
              </p>
            </div>
          ) : (
            <ScrollArea style={{ maxHeight }}>
              <div className="space-y-4 pr-2">
                {drafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onApprove={(edited) => handleApprove(draft.id, edited)}
                    onReject={(reason) => handleReject(draft.id, reason)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}

function DraftCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3 bg-muted/30">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 bg-muted/20">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

// Export a minimal version for the dashboard sidebar
export function DraftQueueBadge() {
  const { totalPending } = useDrafts({ enablePolling: true });
  
  if (totalPending === 0) return null;
  
  return (
    <Badge variant="default" className="text-xs animate-pulse">
      {totalPending}
    </Badge>
  );
}

