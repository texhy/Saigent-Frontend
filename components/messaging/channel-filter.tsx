'use client';

import { Instagram, MessageCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Platform } from '@/types';

type FilterOption = Platform | 'all';

interface ChannelFilterProps {
  selected: FilterOption;
  onSelect: (option: FilterOption) => void;
  unreadCount?: number;
}

const filters: { id: FilterOption; label: string; icon: React.ElementType; color?: string }[] = [
  { id: 'all', label: 'All', icon: Inbox },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'messenger', label: 'Messenger', icon: MessageCircle, color: '#0084FF' },
];

export function ChannelFilter({ selected, onSelect, unreadCount = 0 }: ChannelFilterProps) {
  return (
    <div className="p-3 border-b">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-slate-900">Conversations</h2>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>
      <div className="flex gap-1">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isSelected = selected === filter.id;
          
          return (
            <button
              key={filter.id}
              onClick={() => onSelect(filter.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              <Icon 
                className="h-3.5 w-3.5" 
                style={{ color: isSelected ? 'white' : filter.color }}
              />
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

