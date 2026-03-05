import type { 
  Session,
  ConnectedAccount, 
  Conversation, 
  Message, 
  KnowledgeBase, 
  KnowledgeStats, 
  MessagingStats,
  AIResponseDraft,
  AIResponseDraftListItem,
  DraftStats,
  DraftDebugInfo,
  ShopifyConnectionStatus,
  ShopifyProduct,
  ShopifyDraftOrder,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${this.baseUrl}${endpoint}`;
    
    // Add query params
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      credentials: 'include', // CRITICAL: Include cookies for session
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============ Session ============
  async initSession(): Promise<Session> {
    return this.request<Session>('/connectors/session/init/', { method: 'POST' });
  }

  // ============ Connectors ============
  async getConnectedAccounts(): Promise<{ accounts: ConnectedAccount[] }> {
    return this.request<{ accounts: ConnectedAccount[] }>('/connectors/accounts/');
  }

  getInstagramLoginUrl(): string {
    return `${this.baseUrl}/connectors/instagram/login/`;
  }

  getMessengerLoginUrl(): string {
    return `${this.baseUrl}/connectors/messenger/login/`;
  }

  async disconnectAccount(accountId: number): Promise<{ message: string }> {
    return this.request(`/connectors/accounts/${accountId}/disconnect/`, {
      method: 'POST',
    });
  }

  async reconnectAccount(accountId: number): Promise<{ message: string }> {
    return this.request(`/connectors/accounts/${accountId}/reconnect/`, {
      method: 'POST',
    });
  }

  // ============ Conversations ============
  async getConversations(params?: { 
    platform?: string; 
    since?: string;
    limit?: string;
  }): Promise<{
    conversations: Conversation[];
    count: number;
    total_unread: number;
    server_time: string;
  }> {
    return this.request('/messaging/conversations/', { params });
  }

  async getMessages(
    conversationId: number, 
    params?: { 
      limit?: string; 
      since?: string;
      before?: string;
    }
  ): Promise<{
    conversation: Conversation;
    messages: Message[];
    count: number;
    has_more: boolean;
    server_time: string;
  }> {
    return this.request(`/messaging/conversations/${conversationId}/messages/`, { params });
  }

  async sendMessage(conversationId: number, text: string): Promise<{
    message: Message;
    status: string;
  }> {
    return this.request(`/messaging/conversations/${conversationId}/send/`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getMessagingStats(): Promise<MessagingStats> {
    return this.request<MessagingStats>('/messaging/stats/');
  }

  async syncConversations(params?: { 
    platform?: string; 
    account_id?: string;
  }): Promise<{
    synced_accounts: number;
    synced_conversations: number;
    synced_messages: number;
    errors?: Array<{ account_id: number; platform: string; error: string }>;
  }> {
    return this.request('/messaging/sync/', { 
      method: 'POST',
      params,
    });
  }

  // ============ Knowledge ============
  async uploadWebsite(url: string, maxPages?: number): Promise<{
    knowledge_base_id: number;
    status: string;
    message: string;
  }> {
    return this.request('/knowledge/upload/website/', {
      method: 'POST',
      body: JSON.stringify({ url, max_pages: maxPages }),
    });
  }

  async uploadDocument(file: File): Promise<{
    knowledge_base_id: number;
    filename: string;
    size_mb: number;
    status: string;
    message: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/knowledge/upload/document/`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getKnowledgeBases(): Promise<{
    knowledge_bases: KnowledgeBase[];
    count: number;
  }> {
    return this.request('/knowledge/bases/');
  }

  async getKnowledgeBase(kbId: number): Promise<{
    knowledge_base: KnowledgeBase;
    sample_chunks: Array<{ id: number; content: string; chunk_index: number }>;
  }> {
    return this.request(`/knowledge/bases/${kbId}/`);
  }

  async getKnowledgeStats(): Promise<KnowledgeStats> {
    return this.request<KnowledgeStats>('/knowledge/stats/');
  }

  async deleteKnowledgeBase(kbId: number): Promise<{ message: string }> {
    return this.request(`/knowledge/bases/${kbId}/delete/`, {
      method: 'DELETE',
    });
  }

  async getSupportedFileTypes(): Promise<{
    supported_extensions: string[];
    supported_mime_types: string[];
    max_file_size_mb: number;
  }> {
    return this.request('/knowledge/supported-types/');
  }

  // ============ AI Drafts ============
  
  /**
   * Get pending AI drafts for review
   */
  async getPendingDrafts(params?: {
    status?: string;
    limit?: string;
    since?: string;
  }): Promise<{
    drafts: AIResponseDraftListItem[];
    count: number;
    total_pending: number;
    server_time: string;
  }> {
    return this.request('/messaging/drafts/', { params });
  }

  /**
   * Get a specific draft with full details
   */
  async getDraft(draftId: number): Promise<{
    draft: AIResponseDraft;
  }> {
    return this.request(`/messaging/drafts/${draftId}/`);
  }

  /**
   * Approve and send a draft
   */
  async approveDraft(draftId: number, editedContent?: string): Promise<{
    status: string;
    message: Message;
    draft: AIResponseDraftListItem;
  }> {
    return this.request(`/messaging/drafts/${draftId}/approve/`, {
      method: 'POST',
      body: JSON.stringify({ edited_content: editedContent }),
    });
  }

  /**
   * Reject a draft
   */
  async rejectDraft(draftId: number, reason?: string): Promise<{
    status: string;
    draft: AIResponseDraftListItem;
  }> {
    return this.request(`/messaging/drafts/${draftId}/reject/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Get detailed debug info for a draft
   */
  async getDraftDebug(draftId: number): Promise<DraftDebugInfo> {
    return this.request(`/messaging/drafts/${draftId}/debug/`);
  }

  /**
   * Get draft statistics
   */
  async getDraftStats(): Promise<DraftStats> {
    return this.request('/messaging/drafts/stats/');
  }

  // ============ Shopify ============

  /**
   * Get the Shopify OAuth connect URL (redirects to Shopify authorization)
   */
  getShopifyConnectUrl(shopDomain: string): string {
    return `${this.baseUrl}/shopify/connect?shop=${encodeURIComponent(shopDomain)}`;
  }

  /**
   * Get Shopify connection status for the current session
   */
  async getShopifyStatus(): Promise<ShopifyConnectionStatus> {
    return this.request<ShopifyConnectionStatus>('/shopify/status');
  }

  /**
   * Disconnect a Shopify store
   */
  async disconnectShopify(shopDomain: string): Promise<{ message: string }> {
    return this.request('/shopify/disconnect', {
      method: 'POST',
      body: JSON.stringify({ shop_domain: shopDomain }),
    });
  }

  /**
   * Search Shopify products
   */
  async searchShopifyProducts(shopDomain: string, queryText: string, first?: number): Promise<{
    products: ShopifyProduct[];
    count: number;
  }> {
    return this.request('/shopify/products/search', {
      method: 'POST',
      body: JSON.stringify({ 
        shop_domain: shopDomain, 
        query_text: queryText, 
        first: first || 10 
      }),
    });
  }

  /**
   * Get detailed product information
   */
  async getShopifyProductDetails(shopDomain: string, productId: string): Promise<{
    product: ShopifyProduct;
  }> {
    return this.request('/shopify/products/details', {
      method: 'POST',
      body: JSON.stringify({ shop_domain: shopDomain, product_id: productId }),
    });
  }

  /**
   * Create a Shopify draft order
   */
  async createShopifyDraftOrder(params: {
    shop_domain: string;
    line_items: Array<{ variant_id: string; quantity: number }>;
    customer_email?: string;
    note?: string;
    reserve_minutes?: number;
  }): Promise<{ draft_order: ShopifyDraftOrder }> {
    return this.request('/shopify/draft-orders/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Send a draft order invoice (generate checkout link)
   */
  async sendShopifyInvoice(params: {
    shop_domain: string;
    draft_order_id: string;
    to_email?: string;
    custom_message?: string;
  }): Promise<{ invoice_url: string }> {
    return this.request('/shopify/draft-orders/invoice', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;

