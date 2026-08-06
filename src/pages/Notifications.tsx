import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArchiveIcon, CheckCheckIcon, EyeIcon, EyeOffIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/States';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { Button } from '../components/ui/Button';
import {
  archiveAllReadNotifications,
  archiveNotification,
  deleteNotification,
  dismissNotification,
  getNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  openNotificationsStream,
  type NotificationListQuery
} from '../lib/api/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { cn, formatDateTime } from '../utils/cn';
import type { ApiError } from '../lib/api/errors';
import type { NotificationRecord } from '../types';

const DOT: Record<string, string> = {
  HIGH: 'bg-red-600',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-green-600',
  INFO: 'bg-navy',
  DEFAULT: 'bg-zinc-400'
};

function priorityTone(priority?: string | null): 'critical' | 'warning' | 'success' | 'info' | 'neutral' {
  if (priority === 'HIGH') return 'critical';
  if (priority === 'MEDIUM') return 'warning';
  if (priority === 'LOW') return 'success';
  if (priority === 'INFO') return 'info';
  return 'neutral';
}

export function Notifications() {
  const { accessToken, signOut } = useAuth();
  const { unreadCount, refreshUnreadCount } = useNotifications();
  const [page, setPage] = useState(0);
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [readState, setReadState] = useState<'UNREAD' | 'READ' | ''>('UNREAD');
  const [state, setState] = useState<'ACTIVE' | 'ARCHIVED' | 'DISMISSED' | ''>('ACTIVE');
  const [sourceService, setSourceService] = useState('');
  const [records, setRecords] = useState<NotificationRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailBusy, setDetailBusy] = useState(false);
  const [selected, setSelected] = useState<NotificationRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<NotificationRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const query = useMemo<NotificationListQuery>(
    () => ({
      type: type || undefined,
      priority: priority || undefined,
      readState: readState || undefined,
      state: state || undefined,
      sourceService: sourceService || undefined,
      page,
      size: 20
    }),
    [type, priority, readState, state, sourceService, page]
  );

  const handleUnauthorized = useCallback(
    (nextError: ApiError | null) => {
      if (nextError?.code === 'UNAUTHORIZED') {
        signOut();
        return true;
      }
      return false;
    },
    [signOut]
  );

  const refetch = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listNotifications(accessToken, query);
    if (handleUnauthorized(response.error)) return;
    setRecords(response.data?.content ?? []);
    setTotalElements(response.data?.totalElements ?? 0);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, query, handleUnauthorized]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();
    void openNotificationsStream(
      accessToken,
      () => {
        void refetch();
        void refreshUnreadCount();
      },
      () => undefined,
      controller.signal
    );
    return () => controller.abort();
  }, [accessToken, refetch, refreshUnreadCount]);

  const options = useMemo(
    () => ({
      types: Array.from(new Set(records.map((item) => item.type).filter(Boolean))) as string[],
      priorities: Array.from(new Set(records.map((item) => item.priority).filter(Boolean))) as string[],
      services: Array.from(new Set(records.map((item) => item.sourceService).filter(Boolean))) as string[]
    }),
    [records]
  );

  async function openDetail(id: string) {
    if (!accessToken) return;
    setDetailBusy(true);
    setDetailOpen(true);
    const response = await getNotification(accessToken, id);
    setDetailBusy(false);
    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setError(response.error);
      return;
    }
    setSelected(response.data);
  }

  async function runAction(
    action: 'read' | 'unread' | 'dismiss' | 'archive',
    id: string
  ) {
    if (!accessToken) return;
    const requester = {
      read: markNotificationRead,
      unread: markNotificationUnread,
      dismiss: dismissNotification,
      archive: archiveNotification
    } as const;
    const response = await requester[action](accessToken, id);
    if (handleUnauthorized(response.error)) return;
    if (response.error) {
      setError(response.error);
      return;
    }
    await refetch();
    await refreshUnreadCount();
    if (selected?.id === id && response.data) setSelected(response.data);
  }

  async function runBulkAction(action: 'read-all' | 'archive-all-read') {
    if (!accessToken) return;
    const response =
      action === 'read-all'
        ? await markAllNotificationsRead(accessToken)
        : await archiveAllReadNotifications(accessToken);
    if (handleUnauthorized(response.error)) return;
    if (response.error) {
      setError(response.error);
      return;
    }
    await refetch();
    await refreshUnreadCount();
  }

  async function confirmDeleteNotification() {
    if (!accessToken || !confirmDelete) return;
    setDeleteBusy(true);
    const response = await deleteNotification(accessToken, confirmDelete.id);
    setDeleteBusy(false);
    if (handleUnauthorized(response.error)) return;
    if (response.error) {
      setError(response.error);
      return;
    }
    setConfirmDelete(null);
    if (selected?.id === confirmDelete.id) {
      setSelected(null);
      setDetailOpen(false);
    }
    await refetch();
    await refreshUnreadCount();
  }

  return (
    <>
      <PageBanner
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} from the live notifications service`}
        breadcrumb={['Kyronix', 'Notifications']}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => void refetch()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => void runBulkAction('archive-all-read')}>
              <ArchiveIcon className="h-3.5 w-3.5" />
              Archive read
            </Button>
            <Button
              variant="accent"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => void runBulkAction('read-all')}
              disabled={unreadCount === 0}>
              <CheckCheckIcon className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          </div>
        }
      />

      <SurfaceCard
        title="Inbox"
        description={`Showing ${records.length} of ${totalElements} notifications`}
        bodyClassName="p-0"
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <Filter label="Type" value={type} onChange={setType} options={options.types} />
            <Filter label="Priority" value={priority} onChange={setPriority} options={options.priorities} />
            <Filter label="Read state" value={readState} onChange={(value) => setReadState(value as 'UNREAD' | 'READ' | '')} options={['UNREAD', 'READ']} />
            <Filter label="State" value={state} onChange={(value) => setState(value as 'ACTIVE' | 'ARCHIVED' | 'DISMISSED' | '')} options={['ACTIVE', 'ARCHIVED', 'DISMISSED']} />
            <Filter label="Service" value={sourceService} onChange={setSourceService} options={options.services} />
          </div>
        }
      >
        {isLoading && <LoadingState rows={5} />}
        {!isLoading && error && <ErrorState description={error.message} correlationId={error.correlationId} onRetry={() => void refetch()} />}
        {!isLoading && !error && records.length === 0 && (
          <EmptyState title="You're all caught up" description="No notifications match the current filters." />
        )}
        {!isLoading && !error && records.length > 0 && (
          <ul className="divide-y divide-zinc-100">
            {records.map((item) => {
              const unread = item.readState !== 'READ';
              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex flex-col gap-3 px-4 py-4 sm:flex-row sm:px-5',
                    unread && 'bg-navy-50/40'
                  )}>
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', DOT[item.priority ?? 'DEFAULT'] ?? DOT.DEFAULT)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="text-left text-xs font-semibold text-navy hover:underline"
                        onClick={() => void openDetail(item.id)}
                      >
                        {item.title}
                      </button>
                      {item.sourceService && <StatusBadge status={item.sourceService} tone="neutral" withDot={false} />}
                      {item.priority && <StatusBadge status={item.priority} tone={priorityTone(item.priority)} withDot={false} />}
                      {unread && (
                        <span className="rounded-xl bg-gold px-2 py-0.5 text-[10px] font-medium text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-600">{item.message}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">{formatDateTime(item.occurredAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:w-[220px] sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => void runAction(unread ? 'read' : 'unread', item.id)}
                    >
                      {unread ? <EyeIcon className="h-3.5 w-3.5" /> : <EyeOffIcon className="h-3.5 w-3.5" />}
                      {unread ? 'Mark read' : 'Mark unread'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => void runAction('dismiss', item.id)}>
                      Dismiss
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 sm:flex-none"
                      onClick={() => void runAction('archive', item.id)}>
                      Archive
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setConfirmDelete(item)}>
                      <Trash2Icon className="h-3.5 w-3.5" />
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SurfaceCard>

      <DetailDrawer
        open={detailOpen}
        title={selected?.title ?? 'Notification detail'}
        subtitle={selected ? `${selected.type ?? 'Notification'} · ${selected.sourceService ?? 'notifications-service'}` : undefined}
        onClose={() => setDetailOpen(false)}
        width="lg"
      >
        {detailBusy && <LoadingState rows={4} />}
        {!detailBusy && !selected && <EmptyState description="Select a notification to view its details." />}
        {!detailBusy && selected && (
          <dl>
            <DetailRow label="Title">{selected.title}</DetailRow>
            <DetailRow label="Message">{selected.message}</DetailRow>
            <DetailRow label="Type">{selected.type ?? '—'}</DetailRow>
            <DetailRow label="Priority">{selected.priority ?? '—'}</DetailRow>
            <DetailRow label="Source service">{selected.sourceService ?? '—'}</DetailRow>
            <DetailRow label="Event type">{selected.eventType ?? '—'}</DetailRow>
            <DetailRow label="Entity type">{selected.entityType ?? '—'}</DetailRow>
            <DetailRow label="Entity ID">{selected.entityId ?? '—'}</DetailRow>
            <DetailRow label="Business reference">{selected.businessReference ?? '—'}</DetailRow>
            <DetailRow label="Read state">{selected.readState ?? '—'}</DetailRow>
            <DetailRow label="State">{selected.state ?? '—'}</DetailRow>
            <DetailRow label="Occurred at">{formatDateTime(selected.occurredAt)}</DetailRow>
            <DetailRow label="Read at">{selected.readAt ? formatDateTime(selected.readAt) : '—'}</DetailRow>
            <DetailRow label="Archived at">{selected.archivedAt ? formatDateTime(selected.archivedAt) : '—'}</DetailRow>
            <DetailRow label="Correlation ID">{selected.correlationId ?? '—'}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <ConfirmModal
        open={Boolean(confirmDelete)}
        title={confirmDelete ? `Delete notification?` : 'Delete notification?'}
        description={
          confirmDelete
            ? `This will permanently delete "${confirmDelete.title}". This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete notification"
        busy={deleteBusy}
        tone="danger"
        onConfirm={() => void confirmDeleteNotification()}
        onClose={() => {
          if (deleteBusy) return;
          setConfirmDelete(null);
        }}
      />
    </>
  );
}

function Filter({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      aria-label={`Filter by ${label}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy sm:w-auto sm:min-w-[120px]"
    >
      <option value="">All {label.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
