'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, ArrowLeft, Store, Briefcase, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BRAND, ROUTES } from '@/lib/constants';
import { setStoredUser, type BusinessType } from '@/lib/onboarding-auth';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopDomain, setShopDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessType) {
      toast({
        title: 'Select business type',
        description: 'Please choose Ecommerce (Shopify) or Service-based.',
        variant: 'destructive',
      });
      return;
    }
    if (!businessName.trim()) {
      toast({
        title: 'Business name required',
        description: 'Please enter your business name.',
        variant: 'destructive',
      });
      return;
    }
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email.',
        variant: 'destructive',
      });
      return;
    }
    if (!password || password.length < 6) {
      toast({
        title: 'Password required',
        description: 'Please enter a password of at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }
    if (businessType === 'ecommerce' && !shopDomain.trim()) {
      toast({
        title: 'Shop domain required',
        description: 'Please enter your Shopify store domain (e.g. my-store.myshopify.com).',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        email: email.trim(),
        password,
        business_type: businessType,
        business_name: businessName.trim(),
        ...(businessType === 'ecommerce' && shopDomain.trim() && { shop_domain: shopDomain.trim() }),
      });
      setStoredUser({
        email: email.trim(),
        password,
        businessType,
        businessName: businessName.trim(),
        shopDomain: businessType === 'ecommerce' ? shopDomain.trim() : undefined,
      });
      toast({
        title: 'Account created',
        description: 'You can now log in with your email and password.',
      });
      router.replace(ROUTES.home);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      const is404 = message.includes('404');
      toast({
        title: 'Registration failed',
        description: is404
          ? 'Register endpoint not found. Set NEXT_PUBLIC_AUTH_REGISTER_URL in .env.local to the same path you use in Postman (e.g. /api/register or /users/register).'
          : message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-lg">{BRAND.name}</span>
          </Link>
          <Link href={ROUTES.home}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-lg">
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Register
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your account. Choose your business type and enter your details.
          </p>
        </div>

        <Card className="animate-slideUp">
          <CardHeader>
            <CardTitle className="text-lg">Business type</CardTitle>
            <CardDescription>Select how you use {BRAND.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setBusinessType('ecommerce')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  businessType === 'ecommerce'
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <Store className="h-6 w-6" style={{ color: '#96BF48' }} />
                </div>
                <span className="text-sm font-medium text-slate-900">Ecommerce (Shopify)</span>
                <span className="text-xs text-muted-foreground text-center">
                  I sell products online
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBusinessType('service')}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                  businessType === 'service'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-slate-900">Service-based</span>
                <span className="text-xs text-muted-foreground text-center">
                  I offer services
                </span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  Business name
                </label>
                <Input
                  placeholder="Acme Inc."
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              {businessType === 'ecommerce' && (
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                    Shopify store domain
                  </label>
                  <Input
                    placeholder="my-store.myshopify.com"
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    className="rounded-lg"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href={ROUTES.login} className="text-blue-600 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
