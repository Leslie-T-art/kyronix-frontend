import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { DownloadIcon, RefreshCwIcon, SearchIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { AlertBanner } from '../components/shared/AlertBanner';
import { StatCard } from '../components/shared/StatCard';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/States';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../lib/auth/roles';
import { formatDateTime } from '../utils/cn';
import { listAuthAuditEvents } from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import type { AuthAuditEvent } from '../types';

function parseJsonValue(value: string | null): string {
  if (!value) return '—';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function Audit() {
  const { user, accessToken, signOut } = useAuth();
  const [events, setEvents] = useState<AuthAuditEvent[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [service, setService] = useState('');
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [selected, setSelected] = useState<AuthAuditEvent | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const refetch = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listAuthAuditEvents(accessToken);
    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }
    setEvents(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, signOut]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const options = useMemo(
    () => ({
      services: Array.from(new Set(events.map((event) => event.serviceName))).sort(),
      actors: Array.from(new Set(events.map((event) => event.username ?? 'Anonymous'))).sort(),
      actions: Array.from(new Set(events.map((event) => event.action))).sort()
    }),
    [events]
  );

  const filtered = events.filter((event) => {
    const matchesQuery =
    query.trim() === '' ||
    [
    event.entityType,
    event.entityId,
    event.businessReference,
    event.correlationId,
    event.username,
    event.requestPath,
    event.failureReason].
    join(' ').
    toLowerCase().
    includes(query.trim().toLowerCase());
    return (
      matchesQuery && (
      !service || event.serviceName === service) && (
      !actor || (event.username ?? 'Anonymous') === actor) && (
      !action || event.action === action));

  });

  const auditVolume = useMemo(() => {
    const dailyTotals = filtered.reduce<Record<string, number>>((accumulator, event) => {
      const day = new Date(event.occurredAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      });
      accumulator[day] = (accumulator[day] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(dailyTotals).map(([day, count]) => ({ day, events: count }));
  }, [filtered]);

  const today = new Date().toISOString().slice(0, 10);
  const eventsToday = events.filter((event) => event.occurredAt.startsWith(today)).length;
  const privilegedChanges = events.filter((event) => (event.roles ?? '').includes('ADMIN')).length;

  function exportTrail() {
    const header = 'Occurred At,Username,Roles,Service,Action,Event Type,Entity Type,Entity ID,Result,Method,Path,IP,Correlation ID';
    const body = filtered.
    map((event) =>
    [
    event.occurredAt,
    event.username ?? '',
    event.roles ?? '',
    event.serviceName,
    event.action,
    event.eventType,
    event.entityType,
    event.entityId ?? '',
    event.result,
    event.requestMethod,
    event.requestPath,
    event.sourceIp,
    event.correlationId].

    map((field) => `"${String(field).replace(/"/g, '""')}"`).
    join(',')
    ).
    join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-trail.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageBanner
        title="Audit"
        subtitle="Immutable, chronological record of authentication and authorization activity from the auth service"
        breadcrumb={['Kyronix', 'Audit']}
        action={
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            {user && can(user.role, 'export') ?
          <Button variant="accent" size="sm" onClick={exportTrail}>
                <DownloadIcon className="h-3.5 w-3.5" />
                Export trail
              </Button> :
          undefined}
          </div>
        } />
      

      <AlertBanner
        variant="info"
        title="This trail is read-only for every role"
        description="Records are written by the API gateway and cannot be edited or deleted from the interface." />
      

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Events today" value={String(eventsToday)} tone="info" delta={0} />
        <StatCard label="Distinct actors" value={String(options.actors.length)} tone="neutral" delta={9} />
        <StatCard label="Privileged events" value={String(privilegedChanges)} tone="warning" delta={0} />
      </div>

      <SurfaceCard title="Event volume" description="Events written to the trail, last seven days">
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={auditVolume} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#f4f4f5" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
              <Tooltip
                cursor={{ fill: '#fafafa' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e4e4e7',
                  fontSize: 12,
                  boxShadow: 'none'
                }} />
              
              <Bar dataKey="events" name="Events" fill="#152947" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SurfaceCard>

      <SurfaceCard title="Audit trail" description="Chronological activity across all engines" bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 p-4">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search entity, path, correlation ID"
              aria-label="Search audit trail"
              className="h-9 w-64 rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" />
            
          </div>
          <TrailFilter label="services" value={service} onChange={setService} options={options.services} />
          <TrailFilter label="actors" value={actor} onChange={setActor} options={options.actors} />
          <TrailFilter label="actions" value={action} onChange={setAction} options={options.actions} />
        </div>

        {isLoading && <LoadingState rows={6} />}
        {!isLoading && error &&
        <ErrorState description={error.message} correlationId={error.correlationId} onRetry={refetch} />
        }
        {!isLoading && !error && filtered.length === 0 &&
        <EmptyState title="No audit events" description="No events match the current filters." />
        }

        {!isLoading && !error && filtered.length > 0 &&
        <ol className="divide-y divide-zinc-100">
            {filtered.map((event) =>
          <li
            key={event.id}
            className="flex cursor-pointer gap-4 px-5 py-4 transition-colors hover:bg-zinc-50"
            onClick={() => {
              setSelected(event);
              setDetailOpen(true);
            }}>
                <div className="flex flex-col items-center pt-1">
                  <span className={`h-2 w-2 rounded-full ${event.result === 'SUCCESS' ? 'bg-green-600' : 'bg-red-600'}`} />
                  <span className="mt-1 w-px flex-1 bg-zinc-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-navy">{event.username ?? 'Anonymous'}</p>
                    <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-500">
                      {event.roles ?? 'No roles'}
                    </span>
                    <span className="rounded-xl border border-navy-200 bg-navy-50 px-2 py-0.5 text-[10px] text-navy-700">
                      {event.serviceName}
                    </span>
                    <span className={`rounded-xl border px-2 py-0.5 text-[10px] ${event.result === 'SUCCESS' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                      {event.result}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">
                    {event.action} — <span className="font-medium text-navy">{event.entityType}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {event.requestMethod} {event.requestPath}
                    {event.failureReason ? ` · ${event.failureReason}` : ''}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {formatDateTime(event.occurredAt)} · IP {event.sourceIp} · {event.correlationId}
                  </p>
                </div>
              </li>
          )}
          </ol>
        }
      </SurfaceCard>

      <DetailDrawer
        open={detailOpen}
        title={selected?.eventType ?? 'Audit event'}
        subtitle={selected ? `${selected.requestMethod} ${selected.requestPath}` : undefined}
        onClose={() => setDetailOpen(false)}
        width="xl">
        {!selected && <EmptyState description="Select an audit event to view its full details." />}
        {selected &&
        <div className="space-y-5">
            <dl>
              <DetailRow label="Occurred at">{formatDateTime(selected.occurredAt)}</DetailRow>
              <DetailRow label="Result">{selected.result}</DetailRow>
              <DetailRow label="Service">{selected.serviceName}</DetailRow>
              <DetailRow label="Action">{selected.action}</DetailRow>
              <DetailRow label="Event type">{selected.eventType}</DetailRow>
              <DetailRow label="Entity type">{selected.entityType}</DetailRow>
              <DetailRow label="Entity ID">{selected.entityId ?? '—'}</DetailRow>
              <DetailRow label="Business reference">{selected.businessReference ?? '—'}</DetailRow>
              <DetailRow label="User ID">{selected.userId ?? '—'}</DetailRow>
              <DetailRow label="Username">{selected.username ?? '—'}</DetailRow>
              <DetailRow label="Roles">{selected.roles ?? '—'}</DetailRow>
              <DetailRow label="Permissions">{selected.permissions ?? '—'}</DetailRow>
              <DetailRow label="Failure reason">{selected.failureReason ?? '—'}</DetailRow>
              <DetailRow label="Method">{selected.requestMethod}</DetailRow>
              <DetailRow label="Path">{selected.requestPath}</DetailRow>
              <DetailRow label="Source IP">{selected.sourceIp}</DetailRow>
              <DetailRow label="User agent">{selected.userAgent}</DetailRow>
              <DetailRow label="Correlation ID">{selected.correlationId}</DetailRow>
            </dl>

            <div className="grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">Old values</p>
                <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">{parseJsonValue(selected.oldValues)}</pre>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">New values</p>
                <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-700">{parseJsonValue(selected.newValues)}</pre>
              </div>
            </div>
          </div>
        }
      </DetailDrawer>
    </>);

}

function TrailFilter({
  label,
  value,
  onChange,
  options





}: {label: string;value: string;onChange: (value: string) => void;options: string[];}) {
  return (
    <select
      aria-label={`Filter by ${label}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
      
      <option value="">All {label}</option>
      {options.map((option) =>
      <option key={option} value={option}>
          {option}
        </option>
      )}
    </select>);

}
