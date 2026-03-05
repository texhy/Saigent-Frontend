'use client';

import { useState, useEffect, useRef } from 'react';
import { useDrafts } from '@/hooks/use-drafts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { DraftsModal } from './drafts-modal';
import { toast } from 'sonner';

export function DraftButton() {
  const { drafts, totalPending, loading } = useDrafts({ enablePolling: true });
  const [modalOpen, setModalOpen] = useState(false);
  const previousDraftIds = useRef<Set<number>>(new Set());

  // Detect new drafts and show toast
  useEffect(() => {
    if (!loading && drafts.length > 0) {
      const currentDraftIds = new Set(drafts.map(d => d.id));
      
      // Find new drafts (drafts that weren't in the previous set)
      const newDrafts = drafts.filter(d => !previousDraftIds.current.has(d.id));
      
      if (newDrafts.length > 0 && previousDraftIds.current.size > 0) {
        // Show toast notification for new drafts
        toast('New draft generated', {
          description: `${newDrafts.length} new draft${newDrafts.length > 1 ? 's' : ''} ready for review`,
          action: {
            label: 'Review',
            onClick: () => setModalOpen(true),
          },
        });
      }
      
      previousDraftIds.current = currentDraftIds;
    } else if (!loading && drafts.length === 0) {
      previousDraftIds.current = new Set();
    }
  }, [drafts, loading]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setModalOpen(true)}
        className="relative"
      >
        <Bot className="h-4 w-4 mr-2" />
        Drafts
        {totalPending > 0 && (
          <Badge 
            variant="default" 
            className="ml-2 h-5 min-w-5 px-1.5 text-xs"
          >
            {totalPending}
          </Badge>
        )}
      </Button>
      
      <DraftsModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}

