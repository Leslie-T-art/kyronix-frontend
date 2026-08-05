import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { SuccessModal } from '../components/shared/SuccessModal';
import { RoleGate } from '../components/shared/RoleGate';
import { Button } from '../components/ui/Button';
import { KriForm } from '../components/forms/KriForm';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { formatDate } from '../utils/cn';
import type { Kri } from '../types';

function Sparkline({ points, status }: {points: number[];status: Kri['breachStatus'];}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const path = points.
  map((point, index) => {
    const x = index / (points.length - 1) * 100;
    const y = 20 - (point - min) / range * 16;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).
  join(' ');
  const stroke =
  status === 'Red' ? '#b91c1c' : status === 'Amber' ? '#d97706' : '#15803d';
  return (
    <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-6 w-24" aria-hidden="true">
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>);

}

const columns: Column<Kri>[] = [
{
  key: 'name',
  header: 'Indicator',
  value: (row) => row.name,
  render: (row) => <span className="font-medium text-navy">{row.name}</span>
},
{ key: 'category', header: 'Category', filterable: true, value: (row) => row.category },
{ key: 'owner', header: 'Owner', value: (row) => row.owner },
{
  key: 'threshold',
  header: 'Thresholds',
  sortable: false,
  value: (row) => `${row.amberThreshold} / ${row.redThreshold}`,
  render: (row) =>
  <span className="tabular text-[11px] text-zinc-500">
        <span className="text-green-700">≤{row.amberThreshold}</span> ·{' '}
        <span className="text-amber-600">{row.amberThreshold}–{row.redThreshold}</span> ·{' '}
        <span className="text-red-700">&gt;{row.redThreshold}</span>
      </span>

},
{
  key: 'currentValue',
  header: 'Current',
  align: 'right',
  value: (row) => row.currentValue,
  render: (row) =>
  <span className="font-semibold text-navy">
        {row.currentValue}
        <span className="ml-1 text-[10px] font-normal text-zinc-400">{row.unitLabel}</span>
      </span>

},
{
  key: 'trend',
  header: 'Trend',
  sortable: false,
  value: (row) => row.trend[row.trend.length - 1],
  render: (row) => <Sparkline points={row.trend} status={row.breachStatus} />
},
{
  key: 'breachStatus',
  header: 'Breach',
  filterable: true,
  value: (row) => row.breachStatus,
  render: (row) => <StatusBadge status={row.breachStatus} />
},
{
  key: 'lastUpdated',
  header: 'Updated',
  value: (row) => row.lastUpdated,
  render: (row) => formatDate(row.lastUpdated)
}];


export function KriPage() {
  const { data, error, isLoading, refetch } = useBffQuery<Kri[]>(ENDPOINTS.kri.list);
  const [selected, setSelected] = useState<Kri | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const rows = data ?? [];

  return (
    <>
      <PageBanner
        title="Key Risk Indicators"
        subtitle="Early-warning metrics monitored against board-approved tolerance thresholds"
        breadcrumb={['Kyronix', 'KRI']}
        action={
        <RoleGate allow={['Admin', 'RiskManager', 'ProcessOwner']}>
            <Button variant="accent" size="sm" onClick={() => setFormOpen(true)}>
              <PlusIcon className="h-3.5 w-3.5" />
              New indicator
            </Button>
          </RoleGate>
        } />
      


      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Red breaches"
          value={String(rows.filter((row) => row.breachStatus === 'Red').length)}
          tone="critical"
          delta={50} />
        
        <StatCard
          label="Amber warnings"
          value={String(rows.filter((row) => row.breachStatus === 'Amber').length)}
          tone="warning"
          delta={0} />
        
        <StatCard
          label="Within tolerance"
          value={String(rows.filter((row) => row.breachStatus === 'Green').length)}
          tone="success"
          delta={-10} />
        
      </div>

      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onRowClick={setSelected}
        searchPlaceholder="Search indicators"
        exportName="key-risk-indicators" />
      

      <DetailDrawer
        open={selected !== null}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.category} · ${selected.owner}` : undefined}
        onClose={() => setSelected(null)}>
        
        {selected &&
        <dl>
            <DetailRow label="Current value">
              {selected.currentValue} {selected.unitLabel}
            </DetailRow>
            <DetailRow label="Target">
              {selected.target} {selected.unitLabel}
            </DetailRow>
            <DetailRow label="Amber threshold">{selected.amberThreshold}</DetailRow>
            <DetailRow label="Red threshold">{selected.redThreshold}</DetailRow>
            <DetailRow label="Breach status">
              <StatusBadge status={selected.breachStatus} />
            </DetailRow>
            <DetailRow label="Business unit">{selected.unit}</DetailRow>
            <DetailRow label="Last updated">{formatDate(selected.lastUpdated)}</DetailRow>
          </dl>
        }
      </DetailDrawer>

      <KriForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={() => {
          setFormOpen(false);
          setSaved(true);
        }} />
      

      <SuccessModal
        open={saved}
        title="Indicator created"
        description="The new KRI was registered and will report from the next measurement cycle."
        onClose={() => setSaved(false)} />
      
    </>);

}