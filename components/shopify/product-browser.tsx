'use client';

import { useState } from 'react';
import { Search, Plus, Minus, ShoppingCart, Package, Loader2, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import api from '@/lib/api';
import type { ShopifyProduct, ShopifyVariant, ShopifyLineItem } from '@/types';

interface ProductBrowserProps {
  shopDomain: string;
  onAddToOrder: (items: ShopifyLineItem[]) => void;
  className?: string;
}

export function ProductBrowser({ shopDomain, onAddToOrder, className }: ProductBrowserProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<ShopifyLineItem[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const searchProducts = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.searchShopifyProducts(shopDomain, query, 10);
      setProducts(data.products || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: ShopifyProduct, variant: ShopifyVariant) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.variant_id === variant.id);
      if (existing) {
        return prev.map((item) =>
          item.variant_id === variant.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          variant_id: variant.id,
          variant_title: variant.title,
          product_title: product.title,
          price: variant.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.variant_id === variantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Search bar */}
      <div className="flex gap-2 p-4 border-b">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
            className="pl-9"
          />
        </div>
        <Button onClick={searchProducts} disabled={loading || !query.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Product list */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {error && (
              <div className="rounded-lg bg-red-50 text-red-600 p-3 text-sm">{error}</div>
            )}

            {!loading && products.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-10 w-10 mb-3" />
                <p className="text-sm">Search for products to add to the order</p>
              </div>
            )}

            {products.map((product) => (
              <Card
                key={product.id}
                className="p-3 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() =>
                  setExpandedProduct(expandedProduct === product.id ? null : product.id)
                }
              >
                <div className="flex gap-3">
                  {/* Product image */}
                  <div className="h-16 w-16 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.featuredImage?.url ? (
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.variants.length} variant
                        {product.variants.length !== 1 ? 's' : ''}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Stock: {product.totalInventory}
                      </span>
                    </div>
                    {product.variants.length === 1 && (
                      <p className="text-sm font-semibold mt-1">
                        ${product.variants[0].price}
                      </p>
                    )}
                  </div>

                  {/* Quick add for single-variant products */}
                  {product.variants.length === 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="self-center"
                      disabled={!product.variants[0].availableForSale}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, product.variants[0]);
                      }}
                    >
                      {product.variants[0].availableForSale ? (
                        <Plus className="h-3 w-3" />
                      ) : (
                        <span className="text-xs">Out of stock</span>
                      )}
                    </Button>
                  )}
                </div>

                {/* Expanded variants */}
                {expandedProduct === product.id && product.variants.length > 1 && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {product.variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="flex items-center justify-between rounded-md bg-slate-50 p-2"
                      >
                        <div>
                          <p className="text-xs font-medium">{variant.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-semibold">${variant.price}</span>
                            {variant.sku && (
                              <span className="text-xs text-muted-foreground">
                                SKU: {variant.sku}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              Qty: {variant.inventoryQuantity}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!variant.availableForSale}
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product, variant);
                          }}
                        >
                          {variant.availableForSale ? (
                            <Plus className="h-3 w-3" />
                          ) : (
                            <span className="text-xs">Sold out</span>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Cart sidebar */}
        {cart.length > 0 && (
          <div className="w-64 border-l flex flex-col bg-white">
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <h3 className="text-sm font-semibold">
                  Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
                </h3>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {cart.map((item) => (
                  <div key={item.variant_id} className="rounded-md bg-slate-50 p-2 space-y-1">
                    <p className="text-xs font-medium truncate">{item.product_title}</p>
                    {item.variant_title !== 'Default Title' && (
                      <p className="text-xs text-muted-foreground">{item.variant_title}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.variant_id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs w-5 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => updateQuantity(item.variant_id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" size="sm" onClick={() => onAddToOrder(cart)}>
                <ShoppingCart className="h-3 w-3 mr-2" />
                Add to Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
