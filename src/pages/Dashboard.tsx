import React from 'react';
import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis } from
'recharts';
import { ArrowRightIcon, RefreshCwIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { AlertBanner } from '../components/shared/AlertBanner';
import { StatCard } from '../components/shared/StatCard';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { ErrorState, LoadingState } from '../components/shared/States';
import { RoleGate } from '../components/shared/RoleGate';
import { Button } from '../components/ui/Button';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { scopeLabel } from '../lib/auth/roles';
import { cn } from '../utils/cn';
import type { DashboardSummary } from '../types';

const HEAT_LEVELS = [
{ max: 4, className: 'bg-green-100 text-green-800 border-green-200' },
{ max: 9, className: 'bg-amber-100 text-amber-800 border-amber-200' },
{ max: 14, className: 'bg-red-100 text-red-800 border-red-200' }];


function heatClass(likelihood: number, impact: number, count: number): string {
  const score = likelihood * impact;
  if (count === 0) return 'bg-zinc-50 text-zinc-300 border-zinc-200';
  const level = HEAT_LEVELS.find((item) => score <= item.max) ?? HEAT_LEVELS[2];
  return level.className;
}

export function Dashboard() {
  const { user } = useAuth();
  const { data, error, isLoading, refetch } = useBffQuery<DashboardSummary>(
    ENDPOINTS.dashboard.summary
  );

  return (
    <>
      <PageBanner
        title={`Good day, ${user?.name.split(' ')[0]}`}
        subtitle={`Enterprise risk position · ${user ? scopeLabel(user.role, user.unit) : ''}`}
        breadcrumb={['Kyronix', 'Dashboard']}
        action={
        <Button variant="accent" size="sm" onClick={refetch}>
            <RefreshCwIcon className="h-3.5 w-3.5" />
            Refresh
          </Button>
        } />
      

      <RoleGate allow={['Admin', 'RiskManager', 'Auditor']}>
        <AlertBanner
          variant="error"
          title="3 key risk indicators are in red breach"
          description="Overdue AML alerts, unpatched critical vulnerabilities and core banking downtime all exceed tolerance."
          dismissible
          action={
          <Link
            to="/kri"
            className="inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium underline-offset-2 hover:underline">
            
              Review KRIs
              <ArrowRightIcon className="h-3 w-3" />
            </Link>
          } />
        
      </RoleGate>

      {isLoading &&
      <SurfaceCard bodyClassName="p-0">
          <LoadingState rows={8} />
        </SurfaceCard>
      }

      {!isLoading && error &&
      <SurfaceCard bodyClassName="p-0">
          <ErrorState
          description={error.message}
          correlationId={error.correlationId}
          onRetry={refetch} />
        
        </SurfaceCard>
      }

      {!isLoading && !error && data &&
      <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.stats.map((stat) =>
          <StatCard
            key={stat.key}
            label={stat.label}
            value={stat.value}
            delta={stat.delta}
            tone={stat.tone} />

          )}
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SurfaceCard
            className="xl:col-span-2"
            title="Risk exposure trend"
            description="Inherent versus residual exposure score, rolling six months">
            
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.exposureTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="#f4f4f5" vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#71717a' }} />
                  
                    <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#71717a' }} />
                  
                    <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #e4e4e7',
                      fontSize: 12,
                      boxShadow: 'none'
                    }} />
                  
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                    type="monotone"
                    dataKey="inherent"
                    name="Inherent"
                    stroke="#152947"
                    strokeWidth={2}
                    dot={false} />
                  
                    <Line
                    type="monotone"
                    dataKey="residual"
                    name="Residual"
                    stroke="#ba9155"
                    strokeWidth={2}
                    dot={false} />
                  
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>

            <SurfaceCard title="Risk heatmap" description="Likelihood × impact, all open risks">
              <div className="flex gap-2">
                <div className="flex flex-col justify-between py-1 text-[10px] font-medium text-zinc-400">
                  {[5, 4, 3, 2, 1].map((value) =>
                <span key={value} className="flex h-9 items-center">
                      {value}
                    </span>
                )}
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[5, 4, 3, 2, 1].map((likelihood) =>
                  [1, 2, 3, 4, 5].map((impact) => {
                    const cell = data.heatmap.find(
                      (item) => item.likelihood === likelihood && item.impact === impact
                    );
                    const count = cell?.count ?? 0;
                    return (
                      <div
                        key={`${likelihood}-${impact}`}
                        className={cn(
                          'flex h-9 items-center justify-center rounded-xl border text-xs font-semibold',
                          heatClass(likelihood, impact, count)
                        )}
                        title={`Likelihood ${likelihood} × Impact ${impact}: ${count} risks`}>
                        
                            {count || '·'}
                          </div>);

                  })
                  )}
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-1.5 text-center text-[10px] font-medium text-zinc-400">
                    {[1, 2, 3, 4, 5].map((value) =>
                  <span key={value}>{value}</span>
                  )}
                  </div>
                  <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-zinc-400">
                    Impact
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SurfaceCard
            className="xl:col-span-2"
            title="Attention required"
            description="Items breaching tolerance or past their due date"
            bodyClassName="p-0">
            
              <ul className="divide-y divide-zinc-100">
                {data.attention.map((item) =>
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5">
                
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      item.tone === 'critical' && 'bg-red-600',
                      item.tone === 'warning' && 'bg-amber-500',
                      item.tone === 'success' && 'bg-green-600',
                      (item.tone === 'info' || item.tone === 'neutral') && 'bg-navy'
                    )} />
                  
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-navy">{item.title}</p>
                        <p className="text-[11px] text-zinc-500">{item.engine}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-zinc-500">
                      {item.due}
                    </span>
                  </li>
              )}
              </ul>
            </SurfaceCard>

            <SurfaceCard title="Recent activity" description="Across all engines" bodyClassName="p-0">
              <ul className="divide-y divide-zinc-100">
                {data.activity.map((item) =>
              <li key={item.id} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-navy-50 text-center text-[10px] font-semibold leading-6 text-navy">
                      {item.actor.slice(0, 1)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-zinc-600">
                        <span className="font-medium text-navy">{item.actor}</span> {item.action}
                      </p>
                      <p className="text-[11px] text-zinc-400">{item.time}</p>
                    </div>
                  </li>
              )}
              </ul>
            </SurfaceCard>
          </div>
        </>
      }
    </>);

}