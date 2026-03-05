'use client';

import { Zap, Settings, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BRAND } from '@/lib/constants';
import Link from 'next/link';

export function Topbar() {
  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-lg">{BRAND.name}</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            Inbox
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Channels
          </Button>
        </Link>
        <Link href="/setup/knowledge">
          <Button variant="ghost" size="sm">
            Knowledge
          </Button>
        </Link>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
            2
          </span>
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

