'use client';

import { useState } from 'react';
import { useDrafts } from '@/hooks/use-drafts';
import { DraftCard } from './draft-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DraftsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DraftsModal({ open, onOpenChange }: DraftsModalProps) {
  const { drafts, loading, error, approveDraft, rejectDraft, refresh } = useDrafts();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-white">
        <DialogHeader>
          <DialogTitle>AI Drafts Pending Review</DialogTitle>
          <DialogDescription>
            Review and approve AI-generated responses before sending
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col bg-white">
          {loading ? (
            <div className="space-y-4 py-4">
              {[1, 2].map((i) => (
                <DraftCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
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
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
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
      </DialogContent>
    </Dialog>
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

