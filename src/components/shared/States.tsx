import React from 'react';
import { InboxIcon, RefreshCwIcon, TriangleAlertIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export function LoadingState({ rows = 6 }: {rows?: number;}) {
  return (
    <div className="space-y-2 p-5" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading data</span>
      {Array.from({ length: rows }).map((_, index) =>
      <div key={index} className="h-11 animate-pulse rounded-xl bg-zinc-100" />
      )}
    </div>);

}

export function EmptyState({
  title = 'Nothing to show',
  description = 'No records match the current filters.',
  action




}: {title?: string;description?: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <InboxIcon className="h-5 w-5 text-zinc-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-navy">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>);

}

export function ErrorState({
  title = 'Unable to load data',
  description,
  correlationId,
  onRetry





}: {title?: string;description?: string;correlationId?: string;onRetry?: () => void;}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
        <TriangleAlertIcon className="h-5 w-5 text-red-700" />
      </div>
      <p className="mt-3 text-sm font-medium text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-zinc-500">{description}</p>}
      {correlationId &&
      <p className="mt-1 text-[11px] text-zinc-400">Correlation ID: {correlationId}</p>
      }
      {onRetry &&
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCwIcon className="h-3.5 w-3.5" />
          Retry
        </Button>
      }
    </div>);

}