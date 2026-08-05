import React from 'react';
import { PlusIcon } from 'lucide-react';
import { PageBanner } from '../components/shared/PageBanner';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { DataTable, type Column } from '../components/shared/DataTable';
import { RoleGate } from '../components/shared/RoleGate';
import { Button } from '../components/ui/Button';
import { useBffQuery } from '../hooks/useBffQuery';
import { ENDPOINTS } from '../lib/api/endpoints';
import { cn, formatDate } from '../utils/cn';
import type { SelfAssessment } from '../types';

const columns: Column<SelfAssessment>[] = [
{
  key: 'name',
  header: 'Assessment',
  value: (row) => row.name,
  render: (row) =>
  <div>
        <p className="font-medium text-navy">{row.name}</p>
        <p className="text-[11px] text-zinc-400">{row.id}</p>
      </div>

},
{ key: 'unit', header: 'Unit', filterable: true, value: (row) => row.unit },
{ key: 'period', header: 'Period', filterable: true, value: (row) => row.period },
{
  key: 'completion',
  header: 'Completion',
  value: (row) => row.completion,
  render: (row) =>
  <div className="flex items-center gap-2">
        <div className="h-1.5 w-24 overflow-hidden rounded-xl bg-zinc-100">
          <div
        className={cn(
          'h-full rounded-xl',
          row.completion === 100 ? 'bg-green-600' : 'bg-navy'
        )}
        style={{ width: `${row.completion}%` }} />
      
        </div>
        <span className="tabular text-[11px] text-zinc-500">{row.completion}%</span>
      </div>

},
{
  key: 'dueDate',
  header: 'Due',
  value: (row) => row.dueDate,
  render: (row) => formatDate(row.dueDate)
},
{ key: 'assessor', header: 'Assessor', value: (row) => row.assessor },
{
  key: 'status',
  header: 'Status',
  filterable: true,
  value: (row) => row.status,
  render: (row) => <StatusBadge status={row.status} />
}];


export function SelfAssessmentPage() {
  const { data, error, isLoading, refetch } = useBffQuery<SelfAssessment[]>(
    ENDPOINTS.selfAssessment.list
  );
  const rows = data ?? [];

  return (
    <>
      <PageBanner
        title="Self Assessment"
        subtitle="Risk and control self-assessment campaigns by business unit"
        breadcrumb={['Kyronix', 'Self Assessment']}
        action={
        <RoleGate allow={['Admin', 'RiskManager']}>
            <Button variant="accent" size="sm">
              <PlusIcon className="h-3.5 w-3.5" />
              Launch campaign
            </Button>
          </RoleGate>
        } />
      

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Overdue"
          value={String(rows.filter((row) => row.status === 'Overdue').length)}
          tone="critical"
          delta={33} />
        
        <StatCard
          label="In progress"
          value={String(rows.filter((row) => row.status === 'In Progress').length)}
          tone="info"
          delta={0} />
        
        <StatCard
          label="Submitted"
          value={String(rows.filter((row) => row.status === 'Submitted').length)}
          tone="success"
          delta={-20} />
        
      </div>

      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search assessments"
        exportName="self-assessments" />
      
    </>);

}