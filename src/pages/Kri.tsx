import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { KriForm } from '../components/forms/KriForm';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState } from '../components/shared/States';
import { PageBanner } from '../components/shared/PageBanner';
import { RowActionsMenu, type RowActionItem } from '../components/shared/RowActionsMenu';
import { RoleGate } from '../components/shared/RoleGate';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  createKriRecord,
  deleteKriRecord,
  listDepartments,
  listKriRecords,
  listRiskRecords,
  updateKriRecord
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { formatDate, formatDateTime } from '../utils/cn';
import type { Department, KriRecord, KriRecordPayload, RiskRecord } from '../types';

function breachStatus(row: KriRecord): 'Green' | 'Amber' | 'Red' {
  if (row.currentValue > row.redThreshold) return 'Red';
  if (row.currentValue > row.amberThreshold) return 'Amber';
  return 'Green';
}

export function KriPage() {
  const { accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<KriRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [riskRecords, setRiskRecords] = useState<RiskRecord[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<KriRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KriRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refetch = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listKriRecords(accessToken);
    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }
    setRows(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, signOut]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const loadFormOptions = useCallback(async () => {
    if (!accessToken) return;

    const [departmentsResponse, riskRecordsResponse] = await Promise.all([
      listDepartments(accessToken),
      listRiskRecords(accessToken)
    ]);

    if (departmentsResponse.error?.code === 'UNAUTHORIZED' || riskRecordsResponse.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (departmentsResponse.data) setDepartments(departmentsResponse.data.filter((department) => department.active));
    if (riskRecordsResponse.data) setRiskRecords(riskRecordsResponse.data);
  }, [accessToken, signOut]);

  useEffect(() => {
    void loadFormOptions();
  }, [loadFormOptions]);

  async function handleCreate(payload: KriRecordPayload) {
    if (!accessToken) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createKriRecord(accessToken, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setFormError(response.error?.message ?? 'Unable to create indicator.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Indicator ${response.data.kriId} created successfully.`);
    await refetch();
  }

  async function handleUpdate(payload: KriRecordPayload) {
    if (!accessToken || !selected) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateKriRecord(accessToken, selected.kriId, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setFormError(response.error?.message ?? 'Unable to update indicator.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`Indicator ${response.data.kriId} updated successfully.`);
    await refetch();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget) return;
    setDeleteBusy(true);
    const response = await deleteKriRecord(accessToken, deleteTarget.kriId);
    setDeleteBusy(false);
    if (response.error) {
      if (response.error.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setError(response.error);
      return;
    }

    if (selected?.id === deleteTarget.id) setSelected(null);
    setDeleteTarget(null);
    setSavedMessage(`Indicator ${deleteTarget.kriId} deleted successfully.`);
    await refetch();
  }

  const columns = useMemo<Column<KriRecord>[]>(() => [
    {
      key: 'kriId',
      header: 'KRI ID',
      value: (row) => row.kriId,
      render: (row) => <span className="font-medium text-navy">{row.kriId}</span>
    },
    {
      key: 'indicatorName',
      header: 'Indicator',
      value: (row) => row.indicatorName,
      render: (row) => <span className="block max-w-[220px] truncate">{row.indicatorName}</span>
    },
    { key: 'category', header: 'Category', filterable: true, value: (row) => row.category },
    { key: 'owner', header: 'Owner', value: (row) => row.owner },
    { key: 'businessUnit', header: 'Business unit', value: (row) => row.businessUnit },
    {
      key: 'threshold',
      header: 'Thresholds',
      sortable: false,
      value: (row) => `${row.greenUpperBound}/${row.amberThreshold}/${row.redThreshold}`,
      render: (row) => (
        <span className="tabular text-[11px] text-zinc-500">
          <span className="text-green-700">≤{row.greenUpperBound}</span> ·{' '}
          <span className="text-amber-600">{row.amberThreshold}</span> ·{' '}
          <span className="text-red-700">{row.redThreshold}</span>
        </span>
      )
    },
    {
      key: 'currentValue',
      header: 'Current',
      align: 'right',
      value: (row) => row.currentValue,
      render: (row) => (
        <span className="font-semibold text-navy">
          {row.currentValue}
          <span className="ml-1 text-[10px] font-normal text-zinc-400">{row.unitOfMeasure}</span>
        </span>
      )
    },
    {
      key: 'breachStatus',
      header: 'Breach',
      filterable: true,
      value: (row) => breachStatus(row),
      render: (row) => <StatusBadge status={breachStatus(row)} />
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      value: (row) => row.updatedAt,
      render: (row) => formatDate(row.updatedAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      value: () => 'Actions',
      render: (row) => {
        const actions: RowActionItem[] = [
          {
            key: 'view',
            label: 'View indicator',
            icon: EyeIcon,
            onClick: () => {
              setSelected(row);
              setOpenMenuId(null);
            }
          },
          {
            key: 'edit',
            label: 'Update indicator',
            icon: PencilIcon,
            onClick: () => {
              setSelected(row);
              setFormMode('edit');
              setFormError(null);
              setFormOpen(true);
              setOpenMenuId(null);
            }
          },
          {
            key: 'delete',
            label: 'Delete indicator',
            icon: Trash2Icon,
            tone: 'danger',
            onClick: () => {
              setDeleteTarget(row);
              setOpenMenuId(null);
            }
          }
        ];

        return (
          <RowActionsMenu
            open={openMenuId === row.id}
            onToggle={() => setOpenMenuId((current) => (current === row.id ? null : row.id))}
            actions={actions}
            ariaLabel={`Actions for ${row.kriId}`}
          />
        );
      }
    }
  ], [openMenuId]);

  return (
    <>
      <PageBanner
        title="Key Risk Indicators"
        subtitle="Live KRI records monitored against tolerance thresholds"
        breadcrumb={['Kyronix', 'KRI']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <RoleGate allow={['Admin', 'RiskManager', 'ProcessOwner']}>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setFormMode('create');
                  setFormError(null);
                  setFormOpen(true);
                }}>
                <PlusIcon className="h-3.5 w-3.5" />
                New indicator
              </Button>
            </RoleGate>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Red breaches"
          value={String(rows.filter((row) => breachStatus(row) === 'Red').length)}
          tone="critical"
          delta={0}
        />
        <StatCard
          label="Amber warnings"
          value={String(rows.filter((row) => breachStatus(row) === 'Amber').length)}
          tone="warning"
          delta={0}
        />
        <StatCard
          label="Within tolerance"
          value={String(rows.filter((row) => breachStatus(row) === 'Green').length)}
          tone="success"
          delta={0}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        onRowClick={setSelected}
        searchPlaceholder="Search indicators"
        exportName="key-risk-indicators"
        pageSize={10}
      />

      <DetailDrawer
        open={selected !== null}
        title={selected?.indicatorName ?? ''}
        subtitle={selected ? `${selected.kriId} · ${selected.category} · ${selected.owner}` : undefined}
        onClose={() => setSelected(null)}
        width="lg">
        {selected &&
        <dl>
            <DetailRow label="Current value">
              {selected.currentValue} {selected.unitOfMeasure}
            </DetailRow>
            <DetailRow label="Target">
              {selected.target} {selected.unitOfMeasure}
            </DetailRow>
            <DetailRow label="Direction">{selected.direction}</DetailRow>
            <DetailRow label="Green upper bound">{selected.greenUpperBound}</DetailRow>
            <DetailRow label="Amber threshold">{selected.amberThreshold}</DetailRow>
            <DetailRow label="Red threshold">{selected.redThreshold}</DetailRow>
            <DetailRow label="Breach status">
              <StatusBadge status={breachStatus(selected)} />
            </DetailRow>
            <DetailRow label="Business unit">{selected.businessUnit}</DetailRow>
            <DetailRow label="Measurement frequency">{selected.measurementFrequency}</DetailRow>
            <DetailRow label="Data source">{selected.dataSource}</DetailRow>
            <DetailRow label="Linked risk">{selected.linkedRisk || '—'}</DetailRow>
            <DetailRow label="Escalate to">{selected.escalateTo || '—'}</DetailRow>
            <DetailRow label="Next review date">{formatDate(selected.nextReviewDate)}</DetailRow>
            <DetailRow label="Updated at">{formatDateTime(selected.updatedAt)}</DetailRow>
            <DetailRow label="Updated by">{selected.updatedBy}</DetailRow>
          </dl>
        }
      </DetailDrawer>

      <KriForm
        open={formOpen}
        mode={formMode}
        initialValues={selected}
        departments={departments}
        riskRecords={riskRecords}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Indicator action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.kriId}?` : 'Delete indicator?'}
        description={
          deleteTarget
            ? `This will permanently delete the ${deleteTarget.indicatorName} KRI record. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete indicator"
        cancelLabel="Cancel"
        busy={deleteBusy}
        tone="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => {
          if (deleteBusy) return;
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
