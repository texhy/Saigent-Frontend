'use client';

import { Instagram, MessageCircle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CHANNELS } from '@/lib/constants';
import type { Platform, ChannelStatus } from '@/types';

interface ChannelCardProps {
  platform: Platform;
  status: ChannelStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

const icons = {
  instagram: Instagram,
  messenger: MessageCircle,
};

export function ChannelCard({
  platform,
  status,
  onConnect,
  onDisconnect,
  loading,
}: ChannelCardProps) {
  const channel = CHANNELS[platform];
  const Icon = icons[platform];
  const isConnected = status.connected;

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        isConnected && 'ring-2 ring-emerald-500/20 border-emerald-200'
      )}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: channel.color }}
      />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              isConnected ? 'bg-emerald-50' : 'bg-slate-100'
            )}
          >
            <Icon
              className="h-6 w-6"
              style={{ color: isConnected ? channel.color : '#64748b' }}
            />
          </div>
          
          <Badge
            variant={isConnected ? 'success' : 'secondary'}
            className="font-medium"
          >
            {isConnected ? (
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
        
        <CardTitle className="mt-4 text-lg">{channel.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {channel.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isConnected && status.account && (
          <div className="mb-4 rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-muted-foreground">Connected account</p>
            <p className="font-medium text-sm">
              {platform === 'instagram' 
                ? `@${status.account.instagram_username || status.account.page_name}`
                : status.account.page_name
              }
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onConnect}
                disabled={loading}
              >
                Manage
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDisconnect}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Disconnect'}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              style={{ backgroundColor: channel.color }}
              onClick={onConnect}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icon className="mr-2 h-4 w-4" />
              )}
              Connect {channel.name}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

