// ============ Session ============
export interface Session {
  session_id: string;
  created: boolean;
  has_connected_channels: boolean;
  has_knowledge_base: boolean;
  connected_channels_count: number;
  knowledge_bases_count: number;
  knowledge_bases_ready?: number;
}

// ============ Channels ============
export type Platform = 'instagram' | 'messenger';

export interface ConnectedAccount {
  id: number;
  platform: Platform;
  page_name: string;
  instagram_username?: string;
  page_id: string;
  instagram_id?: string;
  created_at: string;
}

export interface ChannelStatus {
  platform: Platform;
  connected: boolean;
  account?: ConnectedAccount;
}

// ============ Knowledge ============
export type KnowledgeSourceType = 'website' | 'document';
export type KnowledgeStatus = 'processing' | 'ready' | 'failed';

export interface KnowledgeBase {
  id: number;
  session_id: string;
  source_type: KnowledgeSourceType;
  source_url: string;
  source_title: string;
  status: KnowledgeStatus;
  chunk_count?: number;
  total_chunks?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeStats {
  total_knowledge_bases: number;
  ready: number;
  processing: number;
  failed: number;
  total_chunks: number;
}

// ============ Messaging ============
export interface Conversation {
  id: number;
  platform_conv_id: string;
  participant_id: string;
  participant_name: string;
  participant_username?: string;
  last_message_at: string;
  unread_count: number;
  status: string;
  platform: Platform;
  page_name: string;
  last_message_preview?: string;
  message_count?: number;
  created_at: string;
  updated_at: string;
}

export type MessageType = 'customer' | 'ai' | 'human';
export type MessageDirection = 'inbound' | 'outbound';

export interface Message {
  id: number;
  platform_msg_id: string;
  direction: MessageDirection;
  content: string;
  sender_id: string;
  sender_name: string;
  has_attachment?: boolean;
  attachment_type?: string | null;
  attachment_url?: string | null;
  is_ai_generated: boolean;
  ai_intent?: string;
  ai_confidence?: number;
  ai_latency_ms?: number;
  rag_sources_used?: Array<{
    title: string;
    url: string;
    similarity: number;
  }>;
  created_at: string;
  message_type: MessageType;
}

// ============ Stats ============
export interface MessagingStats {
  conversations: {
    total: number;
    active: number;
    unread: number;
    by_platform: Record<string, { total: number; unread: number }>;
  };
  messages: {
    total: number;
    today: number;
    by_platform: Record<string, {
      total: number;
      inbound: number;
      outbound: number;
      ai_generated: number;
      human_sent: number;
    }>;
  };
  ai_performance: {
    avg_latency_ms: number;
    total_ai_responses: number;
  };
  channels: Array<{
    account_id: number;
    platform: Platform;
    page_name: string;
    instagram_username?: string;
    conversations: number;
    unread: number;
    messages_total: number;
    messages_today: number;
    ai_responses: number;
  }>;
}

// ============ AI Drafts ============
export type DraftStatus = 'pending' | 'approved' | 'rejected' | 'edited' | 'expired' | 'auto_sent';

export interface RetrievalMetrics {
  mrr: number;
  ndcg: number;
  vector_scores?: number[];
  bm25_scores?: number[];
  rrf_scores?: number[];
  retrieval_time_ms: number;
  num_vector_results?: number;
  num_bm25_results?: number;
  num_fused_results?: number;
}

export interface RAGSource {
  chunk_id: number;
  kb_id: number;
  kb_title: string;
  content_preview: string;
  score: number;
  source_type?: string;
  source_url?: string;
}

export interface DebugLogEntry {
  step: string;
  timestamp: string;
  elapsed_ms: number;
  details: Record<string, unknown>;
}

export interface ConversationPreview {
  id: number;
  participant_name: string;
  participant_username?: string;
  platform: Platform;
  page_name: string;
}

export interface InboundMessagePreview {
  id: number;
  content: string;
  sender_name: string;
  created_at: string;
  has_attachment?: boolean;
  attachment_type?: string | null;
  attachment_url?: string | null;
}

// Full draft (with all debug info)
export interface AIResponseDraft {
  id: number;
  conversation_id: number;
  inbound_message: Message;
  draft_content: string;
  edited_content: string | null;
  model_name: string;
  generation_time_ms: number;
  total_latency_ms: number;
  rag_query: string;
  rag_chunks_retrieved: number;
  rag_top_k: number;
  retrieval_metrics: RetrievalMetrics;
  rag_sources: RAGSource[];
  mrr: number;
  ndcg: number;
  retrieval_time: number;
  detected_intent: string | null;
  intent_confidence: number | null;
  response_confidence: number | null;
  status: DraftStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  conversation_preview: ConversationPreview;
  debug_logs: DebugLogEntry[];
}

// Lightweight draft (for list view)
export interface AIResponseDraftListItem {
  id: number;
  conversation_id: number;
  inbound_message_preview: InboundMessagePreview;
  draft_content: string;
  model_name: string;
  generation_time_ms: number;
  total_latency_ms: number;
  rag_chunks_retrieved: number;
  mrr: number;
  ndcg: number;
  detected_intent: string | null;
  intent_confidence: number | null;
  response_confidence: number | null;
  status: DraftStatus;
  created_at: string;
  conversation_preview: ConversationPreview;
}

export interface DraftStats {
  by_status: {
    pending: number;
    approved: number;
    rejected: number;
    edited: number;
    expired: number;
    auto_sent: number;
  };
  totals: {
    total: number;
    reviewed: number;
  };
  rates: {
    approval_rate: number;
    edit_rate: number;
  };
  averages: {
    confidence: number;
    intent_confidence: number;
    generation_time_ms: number;
    total_latency_ms: number;
  };
}

export interface DraftDebugInfo {
  draft_id: number;
  status: DraftStatus;
  timing: {
    generation_time_ms: number;
    total_latency_ms: number;
    retrieval_time_ms: number;
  };
  retrieval_metrics: RetrievalMetrics;
  rag_sources: RAGSource[];
  rag_chunks_retrieved: number;
  rag_query: string;
  intent: {
    detected: string | null;
    confidence: number | null;
  };
  response_confidence: number | null;
  model: {
    name: string;
    generation_time_ms: number;
  };
  debug_logs: DebugLogEntry[];
  review: {
    status: DraftStatus;
    reviewed_at: string | null;
    reviewed_by: string | null;
  };
}

// ============ Shopify ============
export interface ShopifyStore {
  id: number;
  shop_domain: string;
  shop_name: string;
  scopes: string;
  installed_at: string;
  updated_at: string;
}

export interface ShopifyConnectionStatus {
  connected: boolean;
  stores: ShopifyStore[];
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: string;
  sku: string;
  availableForSale: boolean;
  inventoryQuantity: number;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  featuredImage?: { url: string; altText?: string } | null;
  variants: ShopifyVariant[];
  totalInventory: number;
}

export interface ShopifyLineItem {
  variant_id: string;
  variant_title: string;
  product_title: string;
  price: string;
  quantity: number;
}

export interface ShopifyDraftOrder {
  id: string;
  name: string;
  status: string;
  invoiceUrl?: string;
  totalPriceSet?: { shopMoney: { amount: string; currencyCode: string } };
  lineItems: Array<{
    id: string;
    title: string;
    quantity: number;
    originalUnitPriceSet?: { shopMoney: { amount: string; currencyCode: string } };
  }>;
}

// ============ API Responses ============
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  details?: string;
}

