import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { DownloadIcon, SearchIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { AlertBanner } from '../components/shared/AlertBanner';
import { StatCard } from '../components/shared/StatCard';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/States';
import { Button } from '../components/ui/Button';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { auditVolume } from '../data/auditTrail';
import { useAuth } from '../contexts/AuthContext';
import { can } from '../lib/auth/roles';
import { formatDateTime } from '../utils/cn';
import type { AuditEvent } from '../types';

export function Audit() {
  const { user } = useAuth();
  const { data, error, isLoading, refetch } = useBffQuery<AuditEvent[]>(ENDPOINTS.audit.trail);
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState('');
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');

  const events = data ?? [];

  const options = useMemo(
    () => ({
      engines: Array.from(new Set(events.map((event) => event.engine))).sort(),
      actors: Array.from(new Set(events.map((event) => event.actor))).sort(),
      actions: Array.from(new Set(events.map((event) => event.action))).sort()
    }),
    [events]
  );

  const filtered = events.filter((event) => {
    const matchesQuery =
    query.trim() === '' ||
    [event.entity, event.change, event.correlationId, event.actor].
    join(' ').
    toLowerCase().
    includes(query.trim().toLowerCase());
    return (
      matchesQuery && (
      !engine || event.engine === engine) && (
      !actor || event.actor === actor) && (
      !action || event.action === action));

  });

  function exportTrail() {
    const header = 'Timestamp,Actor,Role,Engine,Action,Entity,Change,IP,Correlation ID';
    const body = filtered.
    map((event) =>
    [
    event.timestamp,
    event.actor,
    event.role,
    event.engine,
    event.action,
    event.entity,
    event.change,
    event.ip,
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
        subtitle="Immutable, chronological record of every action taken across the risk engines"
        breadcrumb={['Kyronix', 'Audit']}
        action={
        user && can(user.role, 'export') ?
        <Button variant="accent" size="sm" onClick={exportTrail}>
              <DownloadIcon className="h-3.5 w-3.5" />
              Export trail
            </Button> :
        undefined
        } />
      

      <AlertBanner
        variant="info"
        title="This trail is read-only for every role"
        description="Records are written by the API gateway and cannot be edited or deleted from the interface." />
      

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Events today" value="143" tone="info" delta={-48} caption="vs yesterday" />
        <StatCard label="Distinct actors" value={String(options.actors.length)} tone="neutral" delta={9} />
        <StatCard label="Privileged changes" value="12" tone="warning" delta={20} />
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
              placeholder="Search entity, change, correlation ID"
              aria-label="Search audit trail"
              className="h-9 w-64 rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" />
            
          </div>
          <TrailFilter label="engines" value={engine} onChange={setEngine} options={options.engines} />
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
          <li key={event.id} className="flex gap-4 px-5 py-4">
                <div className="flex flex-col items-center pt-1">
                  <span className="h-2 w-2 rounded-full bg-gold" />
                  <span className="mt-1 w-px flex-1 bg-zinc-200" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold text-navy">{event.actor}</p>
                    <span className="rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] text-zinc-500">
                      {event.role}
                    </span>
                    <span className="rounded-xl border border-navy-200 bg-navy-50 px-2 py-0.5 text-[10px] text-navy-700">
                      {event.engine}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-600">
                    {event.action} — <span className="font-medium text-navy">{event.entity}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{event.change}</p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    {formatDateTime(event.timestamp)} · IP {event.ip} · {event.correlationId}
                  </p>
                </div>
              </li>
          )}
          </ol>
        }
      </SurfaceCard>
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