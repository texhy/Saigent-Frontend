'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Zap, Loader2, ShoppingBag, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChannelCard } from '@/components/connectors/channel-card';
import { useSession } from '@/hooks/use-session';
import { useChannels } from '@/hooks/use-channels';
import { useShopify } from '@/hooks/use-shopify';
import { useToast } from '@/hooks/use-toast';
import { BRAND, ROUTES } from '@/lib/constants';
import { isOnboardingLoggedIn } from '@/lib/onboarding-auth';

function ConnectorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { session, loading: sessionLoading } = useSession();
  const {
    loading: channelsLoading,
    getChannelStatus,
    connectChannel,
    disconnectChannel,
    hasAnyConnection,
    refresh,
  } = useChannels();
  const {
    connected: shopifyConnected,
    shopDomain,
    shopName,
    loading: shopifyLoading,
    connect: connectShopify,
    disconnect: disconnectShopify,
    refresh: refreshShopify,
  } = useShopify();

  const [disconnecting, setDisconnecting] = useState<number | null>(null);
  const [shopifyDisconnecting, setShopifyDisconnecting] = useState(false);
  const [shopDomainInput, setShopDomainInput] = useState('');
  const [oauthHandled, setOauthHandled] = useState(false);

  // Redirect to welcome if not logged in via onboarding
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isOnboardingLoggedIn()) {
      router.replace(ROUTES.home);
    }
  }, [router]);

  // Handle OAuth callback
  useEffect(() => {
    if (oauthHandled) return;

    const instagramConnected = searchParams.get('instagram_connected') === 'true';
    const messengerConnected = searchParams.get('messenger_connected') === 'true';
    const shopifyConnectedParam = searchParams.get('shopify_connected') === 'true';

    if (instagramConnected) {
      toast({
        title: 'Instagram Connected!',
        description: 'Your Instagram account has been successfully connected.',
      });
      refresh();
      setOauthHandled(true);
      window.history.replaceState({}, '', ROUTES.channels);
    }

    if (messengerConnected) {
      toast({
        title: 'Messenger Connected!',
        description: 'Your Facebook Page has been successfully connected.',
      });
      refresh();
      setOauthHandled(true);
      window.history.replaceState({}, '', ROUTES.channels);
    }

    if (shopifyConnectedParam) {
      toast({
        title: 'Shopify Connected!',
        description: 'Your Shopify store has been successfully connected.',
      });
      refreshShopify();
      setOauthHandled(true);
      window.history.replaceState({}, '', ROUTES.channels);
    }
  }, [searchParams, refresh, refreshShopify, toast, oauthHandled]);

  const handleDisconnect = async (accountId: number) => {
    try {
      setDisconnecting(accountId);
      await disconnectChannel(accountId);
      toast({
        title: 'Disconnected',
        description: 'Channel has been disconnected.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect channel.',
        variant: 'destructive',
      });
    } finally {
      setDisconnecting(null);
    }
  };

  const handleShopifyDisconnect = async () => {
    if (!shopDomain) return;
    try {
      setShopifyDisconnecting(true);
      await disconnectShopify(shopDomain);
      toast({
        title: 'Disconnected',
        description: 'Shopify store has been disconnected.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Shopify store.',
        variant: 'destructive',
      });
    } finally {
      setShopifyDisconnecting(false);
    }
  };

  const handleShopifyConnect = () => {
    const domain = shopDomainInput.trim();
    if (!domain) {
      toast({
        title: 'Enter shop domain',
        description: 'Please enter your Shopify store domain (e.g. my-store.myshopify.com)',
        variant: 'destructive',
      });
      return;
    }
    connectShopify(domain);
  };

  const handleContinue = () => {
    window.location.href = ROUTES.knowledge;
  };

  const isLoading = sessionLoading || channelsLoading;
  const instagramStatus = getChannelStatus('instagram');
  const messengerStatus = getChannelStatus('messenger');

  // Don't render main content until we've checked auth (avoid flash)
  if (typeof window !== 'undefined' && !isOnboardingLoggedIn()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">{BRAND.name}</span>
          </div>
          {session && (
            <Badge variant="outline" className="text-xs hidden sm:flex">
              Session active
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Connect Your Channels
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect your social media channels to start automating customer conversations with AI.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
              1
            </div>
            <span className="text-sm font-medium">Channels</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="text-sm text-muted-foreground">Knowledge</span>
          </div>
          <div className="w-8 sm:w-12 h-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Channel Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 animate-slideUp">
              <ChannelCard
                platform="instagram"
                status={instagramStatus}
                onConnect={() => connectChannel('instagram')}
                onDisconnect={() => {
                  if (instagramStatus.account) {
                    handleDisconnect(instagramStatus.account.id);
                  }
                }}
                loading={disconnecting === instagramStatus.account?.id}
              />
              <ChannelCard
                platform="messenger"
                status={messengerStatus}
                onConnect={() => connectChannel('messenger')}
                onDisconnect={() => {
                  if (messengerStatus.account) {
                    handleDisconnect(messengerStatus.account.id);
                  }
                }}
                loading={disconnecting === messengerStatus.account?.id}
              />

              {/* Shopify Connector Card */}
              <Card
                className={`relative overflow-hidden transition-all duration-200 ${
                  shopifyConnected ? 'ring-2 ring-emerald-500/20 border-emerald-200' : ''
                }`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: '#96BF48' }}
                />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        shopifyConnected ? 'bg-emerald-50' : 'bg-slate-100'
                      }`}
                    >
                      <Store
                        className="h-6 w-6"
                        style={{ color: shopifyConnected ? '#96BF48' : '#64748b' }}
                      />
                    </div>
                    <Badge
                      variant={shopifyConnected ? 'success' : 'secondary'}
                      className="font-medium"
                    >
                      {shopifyConnected ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Connected
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Not connected
                        </>
                      )}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4 text-lg">Shopify</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Connect your Shopify store to create orders and send checkout links via chat.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {shopifyConnected ? (
                    <>
                      <div className="mb-4 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-muted-foreground">Connected store</p>
                        <p className="font-medium text-sm">{shopName || shopDomain}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{shopDomain}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleShopifyDisconnect}
                          disabled={shopifyDisconnecting}
                        >
                          {shopifyDisconnecting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Disconnect'
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        placeholder="my-store.myshopify.com"
                        value={shopDomainInput}
                        onChange={(e) => setShopDomainInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleShopifyConnect()}
                      />
                      <Button
                        className="w-full"
                        style={{ backgroundColor: '#96BF48' }}
                        onClick={handleShopifyConnect}
                        disabled={shopifyLoading}
                      >
                        {shopifyLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingBag className="mr-2 h-4 w-4" />
                        )}
                        Connect Shopify
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Continue Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                disabled={!hasAnyConnection && !shopifyConnected}
                onClick={handleContinue}
                className="px-8"
              >
                Continue to Knowledge Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {!hasAnyConnection && !shopifyConnected && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                Connect at least one channel to continue
              </p>
            )}
          </>
        )}

        {/* Connection Summary */}
        {hasAnyConnection && (
          <div className="mt-12 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-700">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-medium">
                {session?.connected_channels_count || 0} channel(s) connected
              </span>
            </div>
            <p className="text-sm text-emerald-600 mt-1">
              You can proceed to set up your knowledge base for AI responses.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ConnectorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }
    >
      <ConnectorPageContent />
    </Suspense>
  );
}
