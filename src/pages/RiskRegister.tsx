import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { RoleGate } from '../components/shared/RoleGate';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { RiskForm } from '../components/forms/RiskForm';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { formatDate } from '../utils/cn';
import type { RiskEntry } from '../types';

const columns: Column<RiskEntry>[] = [
{
  key: 'id',
  header: 'Risk ID',
  value: (row) => row.id,
  render: (row) => <span className="font-medium text-navy">{row.id}</span>
},
{
  key: 'title',
  header: 'Title',
  value: (row) => row.title,
  render: (row) => <span className="block max-w-[320px] truncate">{row.title}</span>
},
{ key: 'category', header: 'Category', filterable: true, value: (row) => row.category },
{
  key: 'inherentRating',
  header: 'Inherent',
  filterable: true,
  value: (row) => row.inherentRating,
  render: (row) => <StatusBadge status={row.inherentRating} withDot={false} />
},
{
  key: 'controls',
  header: 'Controls',
  align: 'right',
  value: (row) => row.controls
},
{
  key: 'residualRating',
  header: 'Residual',
  filterable: true,
  value: (row) => row.residualRating,
  render: (row) => <StatusBadge status={row.residualRating} withDot={false} />
},
{
  key: 'owner',
  header: 'Owner',
  roles: ['Admin', 'RiskManager', 'Auditor', 'ProcessOwner'],
  value: (row) => row.owner
},
{
  key: 'reviewDate',
  header: 'Review date',
  value: (row) => row.reviewDate,
  render: (row) => formatDate(row.reviewDate)
},
{
  key: 'status',
  header: 'Status',
  filterable: true,
  value: (row) => row.status,
  render: (row) => <StatusBadge status={row.status} />
}];


export function RiskRegister() {
  const { data, error, isLoading, refetch } = useBffQuery<RiskEntry[]>(ENDPOINTS.riskRegister.list);
  const [selected, setSelected] = useState<RiskEntry | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const rows = data ?? [];

  return (
    <>
      <PageBanner
        title="Risk Register"
        subtitle="The bank's consolidated inventory of identified risks, controls and residual exposure"
        breadcrumb={['Kyronix', 'Risk Register']}
        action={
        <RoleGate allow={['Admin', 'RiskManager', 'ProcessOwner']}>
            <Button variant="accent" size="sm" onClick={() => setFormOpen(true)}>
              <PlusIcon className="h-3.5 w-3.5" />
              New risk
            </Button>
          </RoleGate>
        } />
      


      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Critical residual"
          value={String(rows.filter((row) => row.residualRating === 'Critical').length)}
          tone="critical"
          delta={0} />
        
        <StatCard
          label="High residual"
          value={String(rows.filter((row) => row.residualRating === 'High').length)}
          tone="warning"
          delta={14} />
        
        <StatCard
          label="Closed this quarter"
          value={String(rows.filter((row) => row.status === 'Closed').length)}
          tone="success"
          delta={-8} />
        
      </div>

      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onRowClick={setSelected}
        searchPlaceholder="Search risks"
        exportName="risk-register" />
      

      <DetailDrawer
        open={selected !== null}
        title={selected?.title ?? ''}
        subtitle={selected ? `${selected.id} · ${selected.category}` : undefined}
        onClose={() => setSelected(null)}>
        
        {selected &&
        <>
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
              {selected.description}
            </p>
            <dl className="mt-4">
              <DetailRow label="Inherent rating">
                <StatusBadge status={selected.inherentRating} withDot={false} />
              </DetailRow>
              <DetailRow label="Residual rating">
                <StatusBadge status={selected.residualRating} withDot={false} />
              </DetailRow>
              <DetailRow label="Likelihood × impact">
                {selected.likelihood} × {selected.impact}
              </DetailRow>
              <DetailRow label="Controls mapped">{selected.controls}</DetailRow>
              <DetailRow label="Owner">{selected.owner}</DetailRow>
              <DetailRow label="Business unit">{selected.unit}</DetailRow>
              <DetailRow label="Next review">{formatDate(selected.reviewDate)}</DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={selected.status} />
              </DetailRow>
            </dl>
          </>
        }
      </DetailDrawer>

      <RiskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={() => {
          setFormOpen(false);
          setSaved(true);
        }} />
      

      <SuccessModal
        open={saved}
        title="Risk added to the register"
        description="The entry was created and routed to the risk owner for treatment planning."
        onClose={() => setSaved(false)} />
      
    </>);

}