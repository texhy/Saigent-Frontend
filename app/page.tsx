'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BRAND, ROUTES } from '@/lib/constants';

function WelcomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If user lands on / with OAuth callback params, send them to channels to handle it
  useEffect(() => {
    const instagram = searchParams.get('instagram_connected');
    const messenger = searchParams.get('messenger_connected');
    const shopify = searchParams.get('shopify_connected');
    if (instagram || messenger || shopify) {
      const params = new URLSearchParams(searchParams.toString());
      router.replace(`${ROUTES.channels}?${params.toString()}`);
    }
  }, [searchParams, router]);

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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Welcome to {BRAND.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started by registering your business or signing in to your account.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 animate-slideUp">
          <Link href={ROUTES.register}>
            <Card className="relative overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-blue-500/20 cursor-pointer border-2 border-transparent hover:border-blue-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 mb-2">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Register</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Create an account. Choose Ecommerce (Shopify) or Service-based business and enter your details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg">
                  Register
                  <UserPlus className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href={ROUTES.login}>
            <Card className="relative overflow-hidden h-full transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-slate-500/20 cursor-pointer border-2 border-transparent hover:border-slate-200">
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-500" />
              <CardHeader className="pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 mb-2">
                  <LogIn className="h-6 w-6 text-slate-600" />
                </div>
                <CardTitle className="text-lg">Log in</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Already have an account? Sign in with your business type and password to continue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" size="lg">
                  Log in
                  <LogIn className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-blue-500/20" />
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
