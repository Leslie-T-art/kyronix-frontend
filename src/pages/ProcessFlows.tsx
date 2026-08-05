import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { AlertBanner } from '../components/shared/AlertBanner';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer } from '../components/shared/DetailDrawer';
import { RoleGate } from '../components/shared/RoleGate';
import { Button } from '../components/ui/Button';
import { ProcessFlowForm } from '../components/forms/ProcessFlowForm';
import { SuccessModal } from '../components/shared/SuccessModal';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { formatDate } from '../utils/cn';
import type { ProcessFlow } from '../types';

const columns: Column<ProcessFlow>[] = [
{
  key: 'name',
  header: 'Process',
  value: (row) => row.name,
  render: (row) =>
  <div>
        <p className="font-medium text-navy">{row.name}</p>
        <p className="text-[11px] text-zinc-400">{row.id}</p>
      </div>

},
{ key: 'department', header: 'Department', filterable: true, value: (row) => row.department },
{ key: 'owner', header: 'Owner', value: (row) => row.owner },
{ key: 'version', header: 'Version', align: 'right', value: (row) => row.version },
{
  key: 'lastReviewed',
  header: 'Last reviewed',
  value: (row) => row.lastReviewed,
  render: (row) => formatDate(row.lastReviewed)
},
{ key: 'linkedRisks', header: 'Linked risks', align: 'right', value: (row) => row.linkedRisks },
{
  key: 'status',
  header: 'Status',
  filterable: true,
  value: (row) => row.status,
  render: (row) => <StatusBadge status={row.status} />
}];


export function ProcessFlowsPage() {
  const { data, error, isLoading, refetch } = useBffQuery<ProcessFlow[]>(
    ENDPOINTS.processFlows.list
  );
  const [selected, setSelected] = useState<ProcessFlow | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const expired = (data ?? []).filter((row) => row.status === 'Expired').length;

  return (
    <>
      <PageBanner
        title="Process Flows"
        subtitle="Documented end-to-end processes, their control points and linked risks"
        breadcrumb={['Kyronix', 'Process Flows']}
        action={
        <RoleGate allow={['Admin', 'RiskManager', 'ProcessOwner']}>
            <Button variant="accent" size="sm" onClick={() => setFormOpen(true)}>
              <PlusIcon className="h-3.5 w-3.5" />
              New process
            </Button>
          </RoleGate>
        } />
      

      {expired > 0 &&
      <AlertBanner
        variant="warning"
        title={`${expired} process document is past its review date`}
        description="Processes must be reviewed and re-approved at least annually."
        dismissible />

      }

      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        onRowClick={setSelected}
        searchPlaceholder="Search processes"
        exportName="process-flows" />
      

      <DetailDrawer
        open={selected !== null}
        title={selected?.name ?? ''}
        subtitle={selected ? `${selected.id} · ${selected.version} · ${selected.department}` : undefined}
        onClose={() => setSelected(null)}>
        
        {selected &&
        <ol className="space-y-3">
            {selected.steps.map((step, index) =>
          <li key={step.name} className="rounded-xl border border-zinc-200 p-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-navy">{step.name}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">Actor: {step.actor}</p>
                    <p className="mt-1 inline-flex rounded-xl bg-gold-50 px-2 py-0.5 text-[11px] text-gold-700">
                      Control: {step.control}
                    </p>
                  </div>
                </div>
              </li>
          )}
          </ol>
        }
      </DetailDrawer>

      <ProcessFlowForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={() => {
          setFormOpen(false);
          setSaved(true);
        }} />
      

      <SuccessModal
        open={saved}
        title="Process documented"
        description="The process flow was created as a draft and sent for review."
        onClose={() => setSaved(false)} />
      
    </>);

}