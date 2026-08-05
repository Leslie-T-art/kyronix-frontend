import React, { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { OltsIncidentForm } from '../components/forms/OltsIncidentForm';
import { SuccessModal } from '../components/shared/SuccessModal';
import { PageBanner } from '../components/shared/PageBanner';
import { AlertBanner } from '../components/shared/AlertBanner';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { RoleGate } from '../components/shared/RoleGate';
import { Button } from '../components/ui/Button';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { formatCurrency, formatDate } from '../utils/cn';
import type { OltsException } from '../types';

const columns: Column<OltsException>[] = [
{
  key: 'reference',
  header: 'Reference',
  value: (row) => row.reference,
  render: (row) => <span className="font-medium text-navy">{row.reference}</span>
},
{ key: 'branch', header: 'Branch', filterable: true, value: (row) => row.branch },
{
  key: 'transactionType',
  header: 'Transaction type',
  filterable: true,
  value: (row) => row.transactionType
},
{
  key: 'amount',
  header: 'Amount',
  align: 'right',
  value: (row) => row.amount,
  render: (row) => formatCurrency(row.amount, row.currency)
},
{
  key: 'exceptionReason',
  header: 'Exception reason',
  value: (row) => row.exceptionReason,
  render: (row) => <span className="block max-w-[280px] truncate">{row.exceptionReason}</span>
},
{
  key: 'status',
  header: 'Status',
  filterable: true,
  value: (row) => row.status,
  render: (row) => <StatusBadge status={row.status} />
},
{
  key: 'raisedDate',
  header: 'Raised',
  value: (row) => row.raisedDate,
  render: (row) => formatDate(row.raisedDate)
},
{
  key: 'owner',
  header: 'Owner',
  roles: ['Admin', 'RiskManager', 'Auditor', 'ProcessOwner'],
  value: (row) => row.owner
}];


export function Olts() {
  const { data, error, isLoading, refetch } = useBffQuery<OltsException[]>(ENDPOINTS.olts.list);
  const [formOpen, setFormOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const rows = data ?? [];

  const escalated = rows.filter((row) => row.status === 'Escalated').length;
  const open = rows.filter((row) => row.status === 'Open').length;
  const value = rows.reduce((total, row) => total + row.amount, 0);

  return (
    <>
      <PageBanner
        title="OLTS"
        subtitle="Online transaction surveillance exceptions raised across the branch network"
        breadcrumb={['Kyronix', 'OLTS']}
        action={
        <RoleGate allow={['Admin', 'RiskManager', 'ProcessOwner']}>
            <Button variant="accent" size="sm" onClick={() => setFormOpen(true)}>
              <PlusIcon className="h-3.5 w-3.5" />
              Log exception
            </Button>
          </RoleGate>
        } />
      

      {escalated > 0 &&
      <AlertBanner
        variant="warning"
        title={`${escalated} exceptions are escalated and awaiting resolution`}
        description="Escalated items must be cleared within 48 hours of being raised."
        dismissible />

      }

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Escalated" value={String(escalated)} tone="critical" delta={12} />
        <StatCard label="Open" value={String(open)} tone="warning" delta={-4} />
        <StatCard
          label="Exposure under review"
          value={formatCurrency(value)}
          tone="neutral"
          delta={6} />
        
      </div>

      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search reference, branch, reason"
        exportName="olts-exceptions" />
      

      <OltsIncidentForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={() => {
          setFormOpen(false);
          setSaved(true);
        }} />
      

      <SuccessModal
        open={saved}
        title="Incident captured"
        description="The loss incident was submitted to OLTS and written to the audit trail."
        onClose={() => setSaved(false)} />
      
    </>);

}