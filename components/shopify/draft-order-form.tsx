'use client';

import { useState } from 'react';
import {
  Loader2,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Send,
  ShoppingBag,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import api from '@/lib/api';
import type { ShopifyLineItem, ShopifyDraftOrder } from '@/types';

interface DraftOrderFormProps {
  shopDomain: string;
  lineItems: ShopifyLineItem[];
  customerEmail?: string;
  onUpdateItems: (items: ShopifyLineItem[]) => void;
  onCheckoutLinkGenerated?: (url: string) => void;
  onSendInMessage?: (url: string) => void;
  className?: string;
}

export function DraftOrderForm({
  shopDomain,
  lineItems,
  customerEmail: initialEmail = '',
  onUpdateItems,
  onCheckoutLinkGenerated,
  onSendInMessage,
  className,
}: DraftOrderFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [note, setNote] = useState('');
  const [reserveMinutes, setReserveMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<ShopifyDraftOrder | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const total = lineItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  const updateQuantity = (variantId: string, delta: number) => {
    const updated = lineItems
      .map((item) =>
        item.variant_id === variantId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    onUpdateItems(updated);
  };

  const removeItem = (variantId: string) => {
    onUpdateItems(lineItems.filter((item) => item.variant_id !== variantId));
  };

  const createDraftOrder = async () => {
    if (lineItems.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.createShopifyDraftOrder({
        shop_domain: shopDomain,
        line_items: lineItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        customer_email: email || undefined,
        note: note || undefined,
        reserve_minutes: reserveMinutes || undefined,
      });
      setCreatedOrder(data.draft_order);
      if (data.draft_order?.invoiceUrl) {
        setCheckoutUrl(data.draft_order.invoiceUrl);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create draft order');
    } finally {
      setLoading(false);
    }
  };

  const sendInvoice = async () => {
    if (!createdOrder) return;
    setInvoiceLoading(true);
    setError(null);
    try {
      const data = await api.sendShopifyInvoice({
        shop_domain: shopDomain,
        draft_order_id: createdOrder.id,
        to_email: email || undefined,
        custom_message: note || undefined,
      });
      setCheckoutUrl(data.invoice_url);
      onCheckoutLinkGenerated?.(data.invoice_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleCopy = () => {
    if (!checkoutUrl) return;
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInMessage = () => {
    if (checkoutUrl) {
      onSendInMessage?.(checkoutUrl);
    }
  };

  // Show success state if order is created
  if (createdOrder) {
    return (
      <div className={`space-y-4 p-4 ${className || ''}`}>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <Check className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold">Draft Order Created</p>
            <p className="text-xs text-muted-foreground">{createdOrder.name}</p>
          </div>
        </div>

        {/* Order summary */}
        <Card className="p-3 space-y-2 bg-slate-50">
          {createdOrder.lineItems.map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span>
                {item.title} × {item.quantity}
              </span>
              {item.originalUnitPriceSet && (
                <span className="font-medium">
                  {item.originalUnitPriceSet.shopMoney.currencyCode}{' '}
                  {(
                    parseFloat(item.originalUnitPriceSet.shopMoney.amount) * item.quantity
                  ).toFixed(2)}
                </span>
              )}
            </div>
          ))}
          {createdOrder.totalPriceSet && (
            <>
              <Separator />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>
                  {createdOrder.totalPriceSet.shopMoney.currencyCode}{' '}
                  {createdOrder.totalPriceSet.shopMoney.amount}
                </span>
              </div>
            </>
          )}
        </Card>

        {/* Checkout link section */}
        {checkoutUrl ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Checkout Link</p>
            <div className="rounded-lg bg-slate-50 p-3 flex items-center gap-2">
              <code className="text-xs flex-1 truncate">{checkoutUrl}</code>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => window.open(checkoutUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
            <Button size="sm" className="w-full" onClick={handleSendInMessage}>
              <Send className="h-3 w-3 mr-2" />
              Send in Message
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {email && (
              <Input
                placeholder="Customer email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            )}
            <Button
              className="w-full"
              size="sm"
              onClick={sendInvoice}
              disabled={invoiceLoading}
            >
              {invoiceLoading ? (
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-3 w-3 mr-2" />
              )}
              Generate Checkout Link
            </Button>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 text-red-600 p-3 text-sm">{error}</div>
        )}
      </div>
    );
  }

  // Build order form
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Draft Order</h3>
          <Badge variant="outline" className="text-xs ml-auto">
            {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Line items */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No items added yet</p>
              <p className="text-xs">Search for products to add</p>
            </div>
          ) : (
            lineItems.map((item) => (
              <div key={item.variant_id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product_title}</p>
                    {item.variant_title !== 'Default Title' && (
                      <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-red-600"
                    onClick={() => removeItem(item.variant_id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => updateQuantity(item.variant_id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => updateQuantity(item.variant_id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}

          {lineItems.length > 0 && (
            <>
              <Separator />

              {/* Customer email */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Customer Email
                </label>
                <Input
                  placeholder="customer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Order Note</label>
                <Textarea
                  placeholder="e.g. Order from Instagram chat"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-16 resize-none"
                />
              </div>

              {/* Reserve time */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Reserve Inventory (minutes)
                </label>
                <Input
                  type="number"
                  value={reserveMinutes}
                  onChange={(e) => setReserveMinutes(parseInt(e.target.value) || 0)}
                  min={0}
                  max={1440}
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {lineItems.length > 0 && (
        <div className="p-4 border-t space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Estimated Total</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 text-red-600 p-2 text-xs">{error}</div>
          )}

          <Button className="w-full" onClick={createDraftOrder} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4 mr-2" />
            )}
            Create Draft Order
          </Button>
        </div>
      )}
    </div>
  );
}
