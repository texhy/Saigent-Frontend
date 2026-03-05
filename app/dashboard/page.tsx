'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { ConversationList } from '@/components/messaging/conversation-list';
import { ChatView } from '@/components/messaging/chat-view';
import { ChannelFilter } from '@/components/messaging/channel-filter';
import { StatsPanel } from '@/components/dashboard/stats-panel';
import { DraftButton } from '@/components/drafts';
import { ProductBrowser } from '@/components/shopify/product-browser';
import { DraftOrderForm } from '@/components/shopify/draft-order-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useConversations } from '@/hooks/use-conversations';
import { useMessages } from '@/hooks/use-messages';
import { useShopify } from '@/hooks/use-shopify';
import type { Platform, ShopifyLineItem } from '@/types';

export default function DashboardPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

  // Shopify order dialog state
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderStep, setOrderStep] = useState<'browse' | 'checkout'>('browse');
  const [orderLineItems, setOrderLineItems] = useState<ShopifyLineItem[]>([]);

  const { conversations, loading: convsLoading, totalUnread } = useConversations({
    platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
  });

  const {
    messages,
    conversation: selectedConversation,
    loading: msgsLoading,
    sending,
    sendMessage,
  } = useMessages({
    conversationId: selectedConversationId,
  });

  const { connected: shopifyConnected, shopDomain } = useShopify();

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text);
    } catch (error) {
      // Handle error via toast in ChatView component
      throw error;
    }
  };

  // Reset selected conversation when platform filter changes
  const handlePlatformChange = (platform: Platform | 'all') => {
    setSelectedPlatform(platform);
    setSelectedConversationId(null);
  };

  // Shopify order handlers
  const handleOpenOrderDialog = () => {
    setOrderStep('browse');
    setOrderLineItems([]);
    setOrderDialogOpen(true);
  };

  const handleAddToOrder = (items: ShopifyLineItem[]) => {
    setOrderLineItems(items);
    setOrderStep('checkout');
  };

  const handleSendCheckoutInMessage = async (url: string) => {
    if (selectedConversationId) {
      try {
        await sendMessage(`Here's your checkout link: ${url}`);
        setOrderDialogOpen(false);
      } catch {
        // Error handled by ChatView toast
      }
    }
  };

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col">
      {/* Stats Panel (collapsible) */}
      <StatsPanel />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar - Conversations */}
        <div className="w-80 border-r flex flex-col bg-white">
          <ChannelFilter
            selected={selectedPlatform}
            onSelect={handlePlatformChange}
            unreadCount={totalUnread}
          />
          <ConversationList
            conversations={conversations}
            loading={convsLoading}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-slate-50 min-h-0">
          {/* Top Bar with Draft Button + Create Order */}
          <div className="flex items-center justify-end gap-2 p-4 border-b bg-white">
            {shopifyConnected && selectedConversation && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenOrderDialog}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            )}
            <DraftButton />
          </div>

          {/* Chat View */}
          <div className="flex-1 flex flex-col min-h-0">
            <ChatView
              conversation={selectedConversation}
              messages={messages}
              loading={msgsLoading}
              sending={sending}
              onSend={handleSendMessage}
            />
          </div>
        </div>
      </div>

      {/* Shopify Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent
          className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0"
          style={{ maxWidth: '56rem' }}
        >
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              {orderStep === 'browse' ? 'Search Products' : 'Create Draft Order'}
            </DialogTitle>
            <DialogDescription>
              {orderStep === 'browse'
                ? 'Search for products and add them to the order'
                : 'Review items and create a draft order with checkout link'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {orderStep === 'browse' ? (
              <ProductBrowser
                shopDomain={shopDomain}
                onAddToOrder={handleAddToOrder}
              />
            ) : (
              <DraftOrderForm
                shopDomain={shopDomain}
                lineItems={orderLineItems}
                onUpdateItems={setOrderLineItems}
                onCheckoutLinkGenerated={() => {}}
                onSendInMessage={handleSendCheckoutInMessage}
              />
            )}
          </div>

          {/* Step navigation */}
          {orderStep === 'checkout' && orderLineItems.length > 0 && (
            <div className="p-4 border-t flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOrderStep('browse')}
              >
                ← Back to Products
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

