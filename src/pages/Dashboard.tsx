import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { RefreshCwIcon } from 'lucide-react';
import { AlertBanner } from '../components/shared/AlertBanner';
import { PageBanner } from '../components/shared/PageBanner';
import { StatCard } from '../components/shared/StatCard';
import { SurfaceCard } from '../components/shared/SurfaceCard';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/States';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  getDashboardRoleAnalytics,
  getDashboardSummary,
  listDashboardRoles
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { scopeLabel } from '../lib/auth/roles';
import { cn, formatDateTime } from '../utils/cn';
import type {
  DashboardMetric,
  DashboardRoleCatalogEntry,
  DashboardRoleSummary,
  DashboardSummaryPayload,
  DashboardTopActor,
  SemanticTone
} from '../types';

type DistributionView = 'portfolio' | 'workflow' | 'activity' | 'notifications';

const PIE_COLORS = ['#152947', '#ba9155', '#dc2626', '#16a34a', '#64748b', '#f59e0b', '#0f766e'];

const APP_ROLE_TO_DASHBOARD_ROLE: Record<string, string[]> = {
  Admin: ['SYSTEM_ADMIN', 'ENTERPRISE_ADMIN'],
  Head: ['DEPARTMENT_HEAD'],
  RiskManager: ['ENTERPRISE_ADMIN'],
  Auditor: ['AUTHORIZER'],
  ProcessOwner: ['DEPARTMENT_HEAD'],
  Inputter: ['INPUTTER'],
  Staff: ['INPUTTER']
};

function severityToTone(severity: DashboardMetric['severity']): SemanticTone {
  if (severity === 'critical') return 'critical';
  if (severity === 'warning') return 'warning';
  if (severity === 'positive') return 'success';
  if (severity === 'info') return 'info';
  return 'neutral';
}

function insightVariant(level: 'critical' | 'warning' | 'info' | 'positive'): 'error' | 'warning' | 'info' | 'success' {
  if (level === 'critical') return 'error';
  if (level === 'warning') return 'warning';
  if (level === 'positive') return 'success';
  return 'info';
}

function toDistributionRows(values: Record<string, number>): Array<{name: string; value: number;}> {
  return Object.entries(values)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);
}

function formatMetricValue(metric: DashboardMetric): string {
  return `${metric.value.toLocaleString()} ${metric.unit}`;
}

function resolveAllowedRoleCodes(summaryRoles: string[], backendRoles: string[], appRole?: string): string[] {
  const mappedRoles = appRole ? APP_ROLE_TO_DASHBOARD_ROLE[appRole] ?? [] : [];
  return Array.from(new Set([...summaryRoles, ...backendRoles, ...mappedRoles]));
}

function DashboardBarChart({
  data,
  dataKey = 'value',
  color = '#152947'
}: {
  data: Array<Record<string, string | number>>;
  dataKey?: string;
  color?: string;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#f4f4f5" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#71717a' }} />
          <Tooltip
            cursor={{ fill: '#fafafa' }}
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e4e4e7',
              fontSize: 12,
              boxShadow: 'none'
            }}
          />
          <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DashboardPieChart({
  data
}: {
  data: Array<{name: string; value: number;}>;
}) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={2}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e4e4e7',
              fontSize: 12,
              boxShadow: 'none'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Dashboard() {
  const { user, accessToken, signOut } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryPayload | null>(null);
  const [roles, setRoles] = useState<DashboardRoleCatalogEntry[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [roleAnalytics, setRoleAnalytics] = useState<DashboardRoleSummary | null>(null);
  const [selectedActor, setSelectedActor] = useState<DashboardTopActor | null>(null);
  const [distributionView, setDistributionView] = useState<DistributionView>('portfolio');
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [roleBusy, setRoleBusy] = useState(false);
  const isInputterView = user?.role === 'Inputter' || selectedRole === 'INPUTTER';
  const isAdminTelemetryView = ['Admin', 'RiskManager', 'Auditor'].includes(user?.role ?? '');
  const allowedRoleCodes = useMemo(
    () => resolveAllowedRoleCodes(summary?.user.roles ?? [], user?.backendRoles ?? [], user?.role),
    [summary?.user.roles, user?.backendRoles, user?.role]
  );
  const visibleRoles = useMemo(
    () => roles.filter((role) => allowedRoleCodes.includes(role.roleCode)),
    [roles, allowedRoleCodes]
  );

  const loadDashboard = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const [summaryResponse, rolesResponse] = await Promise.all([
      getDashboardSummary(accessToken),
      listDashboardRoles(accessToken)
    ]);

    const firstError = summaryResponse.error ?? rolesResponse.error;
    if (firstError?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (firstError || !summaryResponse.data || !rolesResponse.data) {
      setError(firstError ?? null);
      setIsLoading(false);
      return;
    }

    const nextSummary = summaryResponse.data;
    const nextRoles = rolesResponse.data.roles ?? [];
    const nextAllowedRoleCodes = resolveAllowedRoleCodes(
      nextSummary.user.roles,
      user?.backendRoles ?? [],
      user?.role
    );
    const nextVisibleRoles = nextRoles.filter((role) => nextAllowedRoleCodes.includes(role.roleCode));
    const defaultRole =
      nextVisibleRoles.find((role) => nextSummary.user.roles.includes(role.roleCode))?.roleCode ??
      nextVisibleRoles[0]?.roleCode ??
      '';

    setSummary(nextSummary);
    setRoles(nextRoles);
    setSelectedRole((current) => {
      if (current && nextVisibleRoles.some((item) => item.roleCode === current)) return current;
      return defaultRole;
    });
    setRoleAnalytics(nextSummary.roleAnalytics.find((item) => item.roleCode === defaultRole) ?? null);
    setSelectedActor(nextSummary.activity.topActors[0] ?? null);
    setIsLoading(false);
  }, [accessToken, signOut, user?.backendRoles, user?.role]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!accessToken || !selectedRole || !allowedRoleCodes.includes(selectedRole)) return;

    const summaryRole = summary?.roleAnalytics.find((item) => item.roleCode === selectedRole) ?? null;
    if (summaryRole) setRoleAnalytics(summaryRole);

    let cancelled = false;
    setRoleBusy(true);

    getDashboardRoleAnalytics(accessToken, selectedRole).then((response) => {
      if (cancelled) return;

      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }

      if (!response.error && response.data) {
        setRoleAnalytics(response.data);
      }

      setRoleBusy(false);
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, allowedRoleCodes, selectedRole, signOut, summary]);

  const selectedRoleCatalog = useMemo(
    () => visibleRoles.find((role) => role.roleCode === selectedRole) ?? null,
    [visibleRoles, selectedRole]
  );

  const headlineMetrics = summary?.headlineMetrics ?? [];
  const prioritizedHeadlineMetrics = useMemo(() => {
    if (!isInputterView) return headlineMetrics;
    const preferredOrder = [
      'portfolio.records',
      'workflow.pending',
      'reviews.overdue',
      'notifications.unread'
    ];
    return preferredOrder
      .map((key) => headlineMetrics.find((metric) => metric.key === key))
      .filter((metric): metric is DashboardMetric => Boolean(metric));
  }, [headlineMetrics, isInputterView]);
  const roleMetrics = roleAnalytics?.metrics ?? [];
  const portfolioTotals = useMemo(
    () => summary ? [
      { name: 'Risk register', value: summary.portfolio.riskRecords },
      { name: 'Self assessments', value: summary.portfolio.selfAssessments },
      { name: 'KRI records', value: summary.portfolio.kriRecords },
      { name: 'OLTS incidents', value: summary.portfolio.oltsIncidents },
      { name: 'Process flows', value: summary.portfolio.processFlows }
    ] : [],
    [summary]
  );
  const roleBreakdownRows = useMemo(
    () => toDistributionRows(roleAnalytics?.breakdowns ?? {}),
    [roleAnalytics]
  );
  const workflowQueueRows = useMemo(
    () => toDistributionRows(summary?.workflow.queueByModule ?? {}),
    [summary]
  );
  const serviceActivityRows = useMemo(
    () => toDistributionRows(summary?.activity.serviceActivity ?? {}),
    [summary]
  );
  const notificationPriorityRows = useMemo(
    () => toDistributionRows(summary?.notifications.byPriority ?? {}),
    [summary]
  );
  const notificationSourceRows = useMemo(
    () => toDistributionRows(summary?.notifications.bySourceService ?? {}),
    [summary]
  );
  const residualRiskRows = useMemo(
    () => toDistributionRows(summary?.portfolio.residualRiskDistribution ?? {}),
    [summary]
  );
  const thresholdRows = useMemo(
    () => toDistributionRows(summary?.portfolio.kriThresholdDistribution ?? {}),
    [summary]
  );
  const authorizationRows = useMemo(
    () => toDistributionRows(summary?.portfolio.incidentAuthorizationDistribution ?? {}),
    [summary]
  );
  const processFlowRows = useMemo(
    () => toDistributionRows(summary?.portfolio.processFlowWorkflowDistribution ?? {}),
    [summary]
  );
  const actionOutcomeRows = useMemo(
    () => toDistributionRows(summary?.activity.actionOutcomes ?? {}),
    [summary]
  );
  const agingBucketRows = useMemo(
    () => (summary?.workflow.agingBuckets ?? []).map((item) => ({ name: item.label, value: item.count })),
    [summary]
  );

  const distributionTitle =
    distributionView === 'portfolio'
      ? 'Portfolio composition'
      : distributionView === 'workflow'
        ? 'Workflow distribution'
        : distributionView === 'activity'
          ? 'Activity distribution'
          : 'Notification distribution';

  const distributionDescription =
    distributionView === 'portfolio'
      ? 'Cross-module inventory and concentration'
      : distributionView === 'workflow'
        ? 'Approval queues and aging buckets'
        : distributionView === 'activity'
          ? 'Service activity and action outcomes'
          : 'Unread and active notification signals';

  return (
    <>
      <PageBanner
        title={`Good day, ${user?.name.split(' ')[0] ?? 'User'}`}
        subtitle={`Here is whats happenning today ...`}
        breadcrumb={['Kyronix', 'Dashboard']}
        action={
          <Button variant="accent" size="sm" onClick={() => void loadDashboard()}>
            <RefreshCwIcon className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <SurfaceCard bodyClassName="p-0">
          <LoadingState rows={10} />
        </SurfaceCard>
      ) : null}

      {!isLoading && error ? (
        <SurfaceCard bodyClassName="p-0">
          <ErrorState description={error.message} correlationId={error.correlationId} onRetry={() => void loadDashboard()} />
        </SurfaceCard>
      ) : null}

      {!isLoading && !error && summary ? (
        <>
          <div className="space-y-3">
            {summary.insights.map((insight) => (
              <AlertBanner
                key={`${insight.level}-${insight.title}`}
                variant={insightVariant(insight.level)}
                title={insight.title}
                description={insight.description}
              />
            ))}
          </div>

          <div className={cn('mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2', isInputterView ? 'xl:grid-cols-4' : 'xl:grid-cols-3')}>
            {(isInputterView ? prioritizedHeadlineMetrics : headlineMetrics).map((metric) => (
              <StatCard
                key={metric.key}
                label={metric.label}
                value={formatMetricValue(metric)}
                tone={severityToTone(metric.severity)}
                caption="Live dashboard metric"
              />
            ))}
          </div>

          {isInputterView ? (
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SurfaceCard
                title="Your dashboard focus"
                description={roleAnalytics?.focus ?? selectedRoleCatalog?.purpose ?? 'Your active work queue and notifications.'}
              >
                {roleAnalytics ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {roleMetrics.map((metric) => (
                      <div key={metric.key} className="rounded-xl border border-zinc-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-zinc-500">{metric.label}</p>
                            <p className="mt-1 text-xl font-semibold text-navy">{formatMetricValue(metric)}</p>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                              severityToTone(metric.severity) === 'critical' && 'bg-red-50 text-red-700',
                              severityToTone(metric.severity) === 'warning' && 'bg-amber-50 text-amber-700',
                              severityToTone(metric.severity) === 'success' && 'bg-green-50 text-green-700',
                              severityToTone(metric.severity) === 'info' && 'bg-navy-50 text-navy',
                              severityToTone(metric.severity) === 'neutral' && 'bg-zinc-100 text-zinc-600'
                            )}
                          >
                            {metric.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState description="No role metrics available." />
                )}
              </SurfaceCard>

              <SurfaceCard
                className="xl:col-span-2"
                title={distributionTitle}
                description={distributionDescription}
                action={
                  <div className="flex flex-wrap gap-2">
                    {(['portfolio', 'workflow', 'activity', 'notifications'] as DistributionView[]).map((view) => (
                      <button
                        key={view}
                        type="button"
                        onClick={() => setDistributionView(view)}
                        className={cn(
                          'rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors',
                          distributionView === view
                            ? 'border-navy bg-navy-50 text-navy'
                            : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300'
                        )}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                }
              >
                {distributionView === 'portfolio' ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {portfolioTotals.length ? <DashboardBarChart data={portfolioTotals} /> : <EmptyState description="Nothing to show" />}
                    {thresholdRows.length ? <DashboardPieChart data={thresholdRows} /> : (
                      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-sm text-zinc-400">
                        No KRI threshold distribution available.
                      </div>
                    )}
                  </div>
                ) : null}

                {distributionView === 'workflow' ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {workflowQueueRows.length ? <DashboardBarChart data={workflowQueueRows} color="#ba9155" /> : <EmptyState description="Nothing to show" />}
                    {agingBucketRows.length ? <DashboardBarChart data={agingBucketRows} color="#152947" /> : <EmptyState description="No workflow aging buckets available." />}
                  </div>
                ) : null}

                {distributionView === 'activity' ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {serviceActivityRows.length ? <DashboardBarChart data={serviceActivityRows} color="#152947" /> : <EmptyState description="Nothing to show" />}
                    {actionOutcomeRows.length ? <DashboardPieChart data={actionOutcomeRows} /> : <EmptyState description="No action outcome distribution available." />}
                  </div>
                ) : null}

                {distributionView === 'notifications' ? (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {notificationPriorityRows.length ? <DashboardPieChart data={notificationPriorityRows} /> : <EmptyState description="Nothing to show" />}
                    {notificationSourceRows.length ? <DashboardBarChart data={notificationSourceRows} color="#ba9155" /> : <EmptyState description="No notification source distribution available." />}
                  </div>
                ) : null}
              </SurfaceCard>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SurfaceCard
                className="xl:col-span-2"
                title="Current role"
                description={roleBusy ? 'Refreshing role analytics...' : roleAnalytics?.focus ?? 'Role analytics'}
              >
                {visibleRoles.length > 1 ? (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {visibleRoles.map((role) => {
                      const active = role.roleCode === selectedRole;
                      return (
                        <button
                          key={role.roleCode}
                          type="button"
                          onClick={() => setSelectedRole(role.roleCode)}
                          className={cn(
                            'rounded-xl border px-3 py-2 text-left transition-colors',
                            active ? 'border-navy bg-navy-50 text-navy' : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                          )}
                        >
                          <p className="text-xs font-semibold">{role.roleName}</p>
                          <p className="mt-0.5 text-[11px] opacity-80">{role.audience}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {roleAnalytics ? (
                  <div className="space-y-3">
                    {roleMetrics.map((metric) => (
                      <div key={metric.key} className="rounded-xl border border-zinc-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-zinc-500">{metric.label}</p>
                            <p className="mt-1 text-xl font-semibold text-navy">{formatMetricValue(metric)}</p>
                          </div>
                          <span
                            className={cn(
                              'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                              severityToTone(metric.severity) === 'critical' && 'bg-red-50 text-red-700',
                              severityToTone(metric.severity) === 'warning' && 'bg-amber-50 text-amber-700',
                              severityToTone(metric.severity) === 'success' && 'bg-green-50 text-green-700',
                              severityToTone(metric.severity) === 'info' && 'bg-navy-50 text-navy',
                              severityToTone(metric.severity) === 'neutral' && 'bg-zinc-100 text-zinc-600'
                            )}
                          >
                            {metric.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState description="Select a role to load role analytics." />
                )}
              </SurfaceCard>

              <SurfaceCard title="Role brief" description={`Generated ${formatDateTime(summary.generatedAt)} from ${summary.user.username}`}>
                {selectedRoleCatalog ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Purpose</p>
                      <p className="mt-2 text-sm text-zinc-600">{selectedRoleCatalog.purpose}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Recommended widgets</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedRoleCatalog.recommendedWidgets.map((widget) => (
                          <span key={widget} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-[11px] font-medium text-zinc-600">
                            {widget}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState description="No role brief available." />
                )}
              </SurfaceCard>
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SurfaceCard
              className={cn(!isInputterView && 'xl:col-span-3')}
              title={isInputterView ? 'Quick breakdowns' : 'Concentrations'}
              description={isInputterView ? 'The most relevant distributions for your queue' : 'Role and portfolio breakdowns'}
            >
              <div className="space-y-4">
                {!isInputterView ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Role breakdown</p>
                    {roleBreakdownRows.length ? (
                      <div className="space-y-2">
                        {roleBreakdownRows.map((row) => (
                          <div key={row.name}>
                            <div className="mb-1 flex items-center justify-between text-xs text-zinc-600">
                              <span>{row.name}</span>
                              <span>{row.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-100">
                              <div className="h-2 rounded-full bg-navy" style={{ width: `${Math.min(row.value * 10, 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState description="No role breakdown available." />
                    )}
                  </div>
                ) : null}

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">Residual risk mix</p>
                  {residualRiskRows.length ? (
                    <div className="space-y-2">
                      {residualRiskRows.map((row) => (
                        <div key={row.name} className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-xs text-zinc-600">
                          <span>{row.name}</span>
                          <span className="font-semibold text-navy">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState description="No residual risk distribution available." />
                  )}
                </div>
              </div>
            </SurfaceCard>

            {isInputterView ? (
              <SurfaceCard title="Queue snapshot" description="Where your current workload is concentrated">
                {workflowQueueRows.length ? (
                  <DashboardBarChart data={workflowQueueRows} color="#ba9155" />
                ) : notificationSourceRows.length ? (
                  <DashboardBarChart data={notificationSourceRows} color="#152947" />
                ) : portfolioTotals.length ? (
                  <DashboardBarChart data={portfolioTotals} color="#152947" />
                ) : (
                  <EmptyState description="No queue distribution available." />
                )}
              </SurfaceCard>
            ) : null}

            {isInputterView ? (
              <SurfaceCard title="Notification pulse" description="Priority and source signals from your inbox">
                {notificationPriorityRows.length ? (
                  <DashboardPieChart data={notificationPriorityRows} />
                ) : notificationSourceRows.length ? (
                  <DashboardBarChart data={notificationSourceRows} color="#152947" />
                ) : actionOutcomeRows.length ? (
                  <DashboardPieChart data={actionOutcomeRows} />
                ) : (
                  <EmptyState description="No notification activity available." />
                )}
              </SurfaceCard>
            ) : null}
          </div>

          {isAdminTelemetryView ? (
            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SurfaceCard className="xl:col-span-2" title="Interactive actor table" description="Select an actor to inspect activity concentration" bodyClassName="p-0">
                {summary.activity.topActors.length ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-zinc-100 text-sm">
                      <thead className="bg-zinc-50">
                        <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                          <th className="px-5 py-3 font-medium">Actor</th>
                          <th className="px-5 py-3 font-medium">Events</th>
                          <th className="px-5 py-3 font-medium">Failures</th>
                          <th className="px-5 py-3 font-medium">Failure rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {summary.activity.topActors.map((actor) => {
                          const failureRate = actor.events === 0 ? 0 : Math.round(actor.failures / actor.events * 100);
                          const active = selectedActor?.username === actor.username;
                          return (
                            <tr
                              key={actor.username}
                              className={cn('cursor-pointer transition-colors', active ? 'bg-navy-50' : 'hover:bg-zinc-50')}
                              onClick={() => setSelectedActor(actor)}
                            >
                              <td className="px-5 py-3 font-medium text-navy">{actor.username}</td>
                              <td className="px-5 py-3 text-zinc-600">{actor.events}</td>
                              <td className="px-5 py-3 text-zinc-600">{actor.failures}</td>
                              <td className="px-5 py-3 text-zinc-600">{failureRate}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5">
                    <EmptyState description="No actor activity available." />
                  </div>
                )}
              </SurfaceCard>

              <SurfaceCard title="Actor detail" description={selectedActor ? selectedActor.username : 'Select a row from the actor table'}>
                {selectedActor ? (
                  <div className="space-y-3">
                    <div className="rounded-xl border border-zinc-200 p-4">
                      <p className="text-xs font-medium text-zinc-500">Events last 7 days</p>
                      <p className="mt-1 text-2xl font-semibold text-navy">{selectedActor.events}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 p-4">
                      <p className="text-xs font-medium text-zinc-500">Failed events</p>
                      <p className="mt-1 text-2xl font-semibold text-navy">{selectedActor.failures}</p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 p-4">
                      <p className="text-xs font-medium text-zinc-500">Failure rate</p>
                      <p className="mt-1 text-2xl font-semibold text-navy">
                        {selectedActor.events === 0 ? 0 : Math.round(selectedActor.failures / selectedActor.events * 100)}%
                      </p>
                    </div>
                  </div>
                ) : (
                  <EmptyState description="Select an actor to view details." />
                )}
              </SurfaceCard>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <SurfaceCard className="xl:col-span-2" title="Portfolio signal tables" description="Operational state across modules">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Incident authorization</p>
                  {authorizationRows.length ? (
                    <div className="space-y-2">
                      {authorizationRows.map((row) => (
                        <div key={row.name} className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                          <span className="text-zinc-600">{row.name}</span>
                          <span className="font-semibold text-navy">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState description="No incident authorization distribution available." />
                  )}
                </div>
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">Process flow states</p>
                  {processFlowRows.length ? (
                    <div className="space-y-2">
                      {processFlowRows.map((row) => (
                        <div key={row.name} className="flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2 text-sm">
                          <span className="text-zinc-600">{row.name}</span>
                          <span className="font-semibold text-navy">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState description="No process flow workflow distribution available." />
                  )}
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard title="Notifications" description="Current notification posture">
              <div className="space-y-3">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="text-xs font-medium text-zinc-500">Unread</p>
                  <p className="mt-1 text-2xl font-semibold text-navy">{summary.notifications.unread}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="text-xs font-medium text-zinc-500">Active</p>
                  <p className="mt-1 text-2xl font-semibold text-navy">{summary.notifications.active}</p>
                </div>
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="text-xs font-medium text-zinc-500">Expired</p>
                  <p className="mt-1 text-2xl font-semibold text-navy">{summary.notifications.expired}</p>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </>
      ) : null}
    </>
  );
}
