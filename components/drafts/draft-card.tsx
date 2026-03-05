'use client';

import { useState, useRef, useEffect } from 'react';
import type { AIResponseDraftListItem } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DraftDebugPanel } from './draft-debug-panel';
import { 
  Bot, 
  User, 
  Check, 
  X, 
  Bug, 
  Clock, 
  Database, 
  Target,
  Edit3,
  Send,
  Loader2,
  Instagram,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { CHANNELS } from '@/lib/constants';

interface DraftCardProps {
  draft: AIResponseDraftListItem;
  onApprove: (editedContent?: string) => Promise<void>;
  onReject: (reason?: string) => Promise<void>;
}

export function DraftCard({ draft, onApprove, onReject }: DraftCardProps) {
  const [showDebug, setShowDebug] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(draft.draft_content);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { conversation_preview, inbound_message_preview } = draft;
  const platform = conversation_preview.platform;
  const channelConfig = CHANNELS[platform];
  const PlatformIcon = platform === 'instagram' ? Instagram : MessageCircle;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedContent, isEditing]);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      const contentToSend = isEditing && editedContent !== draft.draft_content 
        ? editedContent 
        : undefined;
      await onApprove(contentToSend);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await onReject();
    } finally {
      setIsRejecting(false);
    }
  };

  const hasEdits = editedContent !== draft.draft_content;
  const confidence = draft.response_confidence ?? 0;
  const intentConfidence = draft.intent_confidence ?? 0;

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-200",
      "border-l-4",
      confidence > 0.7 ? "border-l-green-500" : 
      confidence > 0.4 ? "border-l-yellow-500" : "border-l-red-500"
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-1.5 rounded-full"
            style={{ backgroundColor: `${channelConfig.color}20` }}
          >
            <PlatformIcon 
              className="h-4 w-4" 
              style={{ color: channelConfig.color }}
            />
          </div>
          <div>
            <div className="font-medium text-sm">
              {conversation_preview.participant_name}
            </div>
            <div className="text-xs text-muted-foreground">
              {conversation_preview.page_name} • {formatDate(draft.created_at)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {draft.detected_intent || 'general'}
          </Badge>
          <Badge 
            variant={confidence > 0.7 ? 'default' : confidence > 0.4 ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {(confidence * 100).toFixed(0)}%
          </Badge>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <>
          {/* Inbound Message */}
          <div className="p-4 bg-background/50">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-muted shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {inbound_message_preview.sender_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(inbound_message_preview.created_at)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                  {inbound_message_preview.content}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* AI Draft */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10 shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />
                    AI Draft
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {draft.model_name}
                  </span>
                  {hasEdits && (
                    <Badge variant="outline" className="text-xs">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edited
                    </Badge>
                  )}
                </div>
                
                {isEditing ? (
                  <textarea
                    ref={textareaRef}
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className={cn(
                      "w-full p-3 text-sm rounded-lg border",
                      "bg-background resize-none min-h-[100px]",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                    placeholder="Edit the AI response..."
                  />
                ) : (
                  <div 
                    className="p-3 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setIsEditing(true)}
                    title="Click to edit"
                  >
                    {editedContent}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {draft.total_latency_ms}ms
              </span>
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                {draft.rag_chunks_retrieved} sources
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                MRR: {draft.mrr.toFixed(3)}
              </span>
              <span className="flex items-center gap-1">
                NDCG: {draft.ndcg.toFixed(3)}
              </span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between p-3 bg-muted/20">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="gap-1"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {hasEdits ? 'Send Edited' : 'Send'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleReject}
                disabled={isApproving || isRejecting}
                className="gap-1"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                Reject
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditedContent(draft.draft_content);
                    setIsEditing(false);
                  }}
                >
                  Reset
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDebug(!showDebug)}
                className={cn("gap-1", showDebug && "bg-muted")}
              >
                <Bug className="h-4 w-4" />
                Debug
              </Button>
            </div>
          </div>

          {/* Debug Panel */}
          {showDebug && (
            <div className="px-4 pb-4">
              <DraftDebugPanel draft={draft} />
            </div>
          )}
        </>
      )}
    </Card>
  );
}

