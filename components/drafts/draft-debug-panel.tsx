'use client';

import { useState } from 'react';
import type { AIResponseDraftListItem, RAGSource, RetrievalMetrics, DebugLogEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronRight,
  Clock, 
  Database, 
  Zap, 
  Target,
  FileText,
  Activity,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftDebugPanelProps {
  draft: AIResponseDraftListItem;
  retrievalMetrics?: RetrievalMetrics;
  ragSources?: RAGSource[];
  debugLogs?: DebugLogEntry[];
}

export function DraftDebugPanel({ 
  draft, 
  retrievalMetrics, 
  ragSources = [],
  debugLogs = []
}: DraftDebugPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    metrics: true,
    timing: true,
    sources: false,
    timeline: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Use draft-level metrics if retrieval metrics not provided
  const mrr = retrievalMetrics?.mrr ?? draft.mrr ?? 0;
  const ndcg = retrievalMetrics?.ndcg ?? draft.ndcg ?? 0;
  const retrievalTime = retrievalMetrics?.retrieval_time_ms ?? 0;

  return (
    <div className="border-t border-border/50 mt-4 pt-4 space-y-4">
      {/* RAG Retrieval Metrics */}
      <CollapsibleSection
        title="RAG Retrieval Metrics"
        icon={<Database className="h-4 w-4" />}
        expanded={expandedSections.metrics}
        onToggle={() => toggleSection('metrics')}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="MRR" 
            value={mrr.toFixed(3)} 
            description="Mean Reciprocal Rank"
            status={mrr > 0.7 ? 'good' : mrr > 0.4 ? 'medium' : 'low'}
          />
          <MetricCard 
            label="NDCG" 
            value={ndcg.toFixed(3)} 
            description="Normalized DCG"
            status={ndcg > 0.7 ? 'good' : ndcg > 0.4 ? 'medium' : 'low'}
          />
          <MetricCard 
            label="Chunks" 
            value={draft.rag_chunks_retrieved.toString()} 
            description="Sources Retrieved"
          />
          <MetricCard 
            label="Retrieval" 
            value={`${retrievalTime}ms`} 
            description="Search Time"
          />
        </div>

        {retrievalMetrics && (
          <div className="mt-4 space-y-2">
            {retrievalMetrics.vector_scores && retrievalMetrics.vector_scores.length > 0 && (
              <ScoreBar 
                label="Vector Scores" 
                scores={retrievalMetrics.vector_scores}
                color="bg-blue-500"
              />
            )}
            {retrievalMetrics.bm25_scores && retrievalMetrics.bm25_scores.length > 0 && (
              <ScoreBar 
                label="BM25 Scores" 
                scores={retrievalMetrics.bm25_scores}
                color="bg-green-500"
              />
            )}
            {retrievalMetrics.rrf_scores && retrievalMetrics.rrf_scores.length > 0 && (
              <ScoreBar 
                label="RRF Scores" 
                scores={retrievalMetrics.rrf_scores}
                color="bg-purple-500"
              />
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* Timing & Performance */}
      <CollapsibleSection
        title="LLM Generation"
        icon={<Zap className="h-4 w-4" />}
        expanded={expandedSections.timing}
        onToggle={() => toggleSection('timing')}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Model" 
            value={draft.model_name} 
            description="LLM Used"
          />
          <MetricCard 
            label="Generation" 
            value={`${draft.generation_time_ms}ms`} 
            description="LLM Time"
          />
          <MetricCard 
            label="Total" 
            value={`${draft.total_latency_ms}ms`} 
            description="End-to-End"
          />
          <MetricCard 
            label="Confidence" 
            value={`${((draft.response_confidence ?? 0) * 100).toFixed(0)}%`} 
            description="Response"
            status={(draft.response_confidence ?? 0) > 0.7 ? 'good' : (draft.response_confidence ?? 0) > 0.4 ? 'medium' : 'low'}
          />
        </div>
      </CollapsibleSection>

      {/* Intent Detection */}
      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
        <Target className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <span className="text-sm text-muted-foreground">Intent Detection:</span>
          <span className="ml-2 font-medium">
            {draft.detected_intent || 'Unknown'}
          </span>
        </div>
        <Badge variant={
          (draft.intent_confidence ?? 0) > 0.7 ? 'default' : 
          (draft.intent_confidence ?? 0) > 0.4 ? 'secondary' : 'outline'
        }>
          {((draft.intent_confidence ?? 0) * 100).toFixed(0)}% confidence
        </Badge>
      </div>

      {/* RAG Sources */}
      {ragSources.length > 0 && (
        <CollapsibleSection
          title={`Sources Used (${ragSources.length})`}
          icon={<FileText className="h-4 w-4" />}
          expanded={expandedSections.sources}
          onToggle={() => toggleSection('sources')}
        >
          <ScrollArea className="max-h-60">
            <div className="space-y-3">
              {ragSources.map((source, idx) => (
                <div key={idx} className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {source.kb_title}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Score: {source.score.toFixed(3)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {source.content_preview}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleSection>
      )}

      {/* Debug Timeline */}
      {debugLogs.length > 0 && (
        <CollapsibleSection
          title="Debug Timeline"
          icon={<Activity className="h-4 w-4" />}
          expanded={expandedSections.timeline}
          onToggle={() => toggleSection('timeline')}
        >
          <ScrollArea className="max-h-60">
            <div className="space-y-2">
              {debugLogs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <span className="font-mono text-muted-foreground w-16 shrink-0">
                    {log.elapsed_ms}ms
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-foreground">
                      {formatStepName(log.step)}
                    </span>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <pre className="mt-1 p-2 bg-muted/50 rounded text-[10px] overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CollapsibleSection>
      )}
    </div>
  );
}

// Helper Components

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, expanded, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-sm font-medium hover:text-foreground/80 transition-colors"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {icon}
        {title}
      </button>
      {expanded && <div className="pl-5">{children}</div>}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  description: string;
  status?: 'good' | 'medium' | 'low';
}

function MetricCard({ label, value, description, status }: MetricCardProps) {
  return (
    <div className="p-3 bg-muted/30 rounded-lg">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn(
        "font-mono font-semibold text-lg",
        status === 'good' && 'text-green-500',
        status === 'medium' && 'text-yellow-500',
        status === 'low' && 'text-red-500'
      )}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground">{description}</div>
    </div>
  );
}

interface ScoreBarProps {
  label: string;
  scores: number[];
  color: string;
}

function ScoreBar({ label, scores, color }: ScoreBarProps) {
  const maxScore = Math.max(...scores, 1);
  
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="flex gap-1 h-6">
        {scores.slice(0, 10).map((score, idx) => (
          <div
            key={idx}
            className={cn("w-8 rounded transition-all", color)}
            style={{ 
              height: `${(score / maxScore) * 100}%`,
              opacity: 0.4 + (score / maxScore) * 0.6
            }}
            title={`#${idx + 1}: ${score.toFixed(4)}`}
          />
        ))}
      </div>
    </div>
  );
}

function formatStepName(step: string): string {
  return step
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

