import React, { useState } from 'react';
import { CheckCheckIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/States';
import { Button } from '../components/ui/Button';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { cn } from '../utils/cn';
import type { AppNotification } from '../types';

const DOT: Record<string, string> = {
  critical: 'bg-red-600',
  warning: 'bg-amber-500',
  success: 'bg-green-600',
  info: 'bg-navy',
  neutral: 'bg-zinc-400'
};

export function Notifications() {
  const { data, error, isLoading, refetch } = useBffQuery<AppNotification[]>(
    ENDPOINTS.notifications.list
  );
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'new' | 'all'>('new');

  const all = (data ?? []).map((item) => ({
    ...item,
    unread: item.unread && !readIds.includes(item.id)
  }));
  const unreadCount = all.filter((item) => item.unread).length;
  const visible = filter === 'new' ? all.filter((item) => item.unread) : all;

  return (
    <>
      <PageBanner
        title="Notifications"
        subtitle={`${unreadCount} new notification${unreadCount === 1 ? '' : 's'} across the risk engines`}
        breadcrumb={['Kyronix', 'Notifications']}
        action={
        <Button
          variant="accent"
          size="sm"
          onClick={() => setReadIds(all.map((item) => item.id))}
          disabled={unreadCount === 0}>
          
            <CheckCheckIcon className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        } />
      

      <SurfaceCard
        title="Inbox"
        description="Threshold breaches, escalations and approvals routed to your role"
        bodyClassName="p-0"
        action={
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 p-1">
            {(['new', 'all'] as const).map((value) =>
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'rounded-xl px-3 py-1 text-xs font-medium capitalize transition-colors',
              filter === value ? 'bg-navy text-white' : 'text-zinc-500 hover:bg-zinc-100'
            )}>
            
                {value}
              </button>
          )}
          </div>
        }>
        
        {isLoading && <LoadingState rows={5} />}
        {!isLoading && error &&
        <ErrorState
          description={error.message}
          correlationId={error.correlationId}
          onRetry={refetch} />

        }
        {!isLoading && !error && visible.length === 0 &&
        <EmptyState
          title="You're all caught up"
          description="No new notifications for your role right now." />

        }
        {!isLoading && !error && visible.length > 0 &&
        <ul className="divide-y divide-zinc-100">
            {visible.map((item) =>
          <li
            key={item.id}
            className={cn('flex gap-3 px-5 py-4', item.unread && 'bg-navy-50/40')}>
            
                <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', DOT[item.tone])} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-navy">{item.title}</p>
                    <StatusBadge status={item.engine} tone="neutral" withDot={false} />
                    {item.unread &&
                <span className="rounded-xl bg-gold px-2 py-0.5 text-[10px] font-medium text-white">
                        New
                      </span>
                }
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">{item.body}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">{item.time}</p>
                </div>
                {item.unread &&
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReadIds((current) => [...current, item.id])}>
              
                    Mark read
                  </Button>
            }
              </li>
          )}
          </ul>
        }
      </SurfaceCard>
    </>);

}