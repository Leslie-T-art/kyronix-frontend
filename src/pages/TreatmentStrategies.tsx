import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { TreatmentStrategyForm } from '../components/forms/TreatmentStrategyForm';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState } from '../components/shared/States';
import { PageBanner } from '../components/shared/PageBanner';
import { RowActionsMenu, type RowActionItem } from '../components/shared/RowActionsMenu';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../lib/api/errors';
import {
  createTreatmentStrategy,
  deleteTreatmentStrategy,
  getTreatmentStrategy,
  listTreatmentStrategies,
  updateTreatmentStrategy
} from '../lib/api/client';
import type { TreatmentStrategy, TreatmentStrategyPayload } from '../types';
import { formatDateTime } from '../utils/cn';

export function TreatmentStrategies() {
  const { user, accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<TreatmentStrategy[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<TreatmentStrategy | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TreatmentStrategy | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const canManage = user?.role === 'Admin';

  const handleUnauthorized = useCallback(
    (nextError: ApiError | null) => {
      if (nextError?.code === 'UNAUTHORIZED') {
        signOut();
        return true;
      }
      return false;
    },
    [signOut]
  );

  const refetch = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listTreatmentStrategies(accessToken);
    if (handleUnauthorized(response.error)) return;
    setRows(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, handleUnauthorized]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  async function loadDetail(id: string | number) {
    if (!accessToken) return;
    setDetailBusy(true);
    const response = await getTreatmentStrategy(accessToken, id);
    setDetailBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setError(response.error);
      return;
    }

    setSelected(response.data);
    setDetailOpen(true);
  }

  async function handleCreate(payload: TreatmentStrategyPayload) {
    if (!accessToken || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createTreatmentStrategy(accessToken, payload);
    setFormBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to create treatment strategy.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Treatment strategy ${response.data.code} created successfully.`);
    await refetch();
  }

  async function handleUpdate(payload: TreatmentStrategyPayload) {
    if (!accessToken || !selected || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateTreatmentStrategy(accessToken, selected.id, payload);
    setFormBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to update treatment strategy.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`Treatment strategy ${response.data.code} updated successfully.`);
    await refetch();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget || !canManage) return;
    setDeleteBusy(true);
    const response = await deleteTreatmentStrategy(accessToken, deleteTarget.id);
    setDeleteBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error) {
      setError(response.error);
      return;
    }

    if (selected?.id === deleteTarget.id) {
      setSelected(null);
      setDetailOpen(false);
    }
    setDeleteTarget(null);
    setSavedMessage(`Treatment strategy ${deleteTarget.code} deleted successfully.`);
    await refetch();
  }

  const columns = useMemo<Column<TreatmentStrategy>[]>(() => [
    {
      key: 'code',
      header: 'Code',
      value: (row) => row.code,
      render: (row) => <span className="font-medium text-navy">{row.code}</span>
    },
    {
      key: 'name',
      header: 'Name',
      value: (row) => row.name,
      render: (row) => <span className="block max-w-[320px] truncate">{row.name}</span>
    },
    {
      key: 'status',
      header: 'Status',
      filterable: true,
      value: (row) => row.status,
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'updatedAt',
      header: 'Updated at',
      value: (row) => row.updatedAt ?? '',
      render: (row) => (row.updatedAt ? formatDateTime(row.updatedAt) : 'Unknown')
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
            label: 'View treatment strategy',
            icon: EyeIcon,
            onClick: () => {
              void loadDetail(row.id);
              setOpenMenuId(null);
            }
          },
          ...(canManage
            ? [
                {
                  key: 'edit',
                  label: 'Update treatment strategy',
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
                  label: 'Delete treatment strategy',
                  icon: Trash2Icon,
                  tone: 'danger' as const,
                  onClick: () => {
                    setDeleteTarget(row);
                    setOpenMenuId(null);
                  }
                }
              ]
            : [])
        ];

        return (
          <RowActionsMenu
            open={openMenuId === String(row.id)}
            onToggle={() => setOpenMenuId((current) => (current === String(row.id) ? null : String(row.id)))}
            actions={actions}
            ariaLabel={`Actions for ${row.code}`}
          />
        );
      }
    }
  ], [canManage, openMenuId]);

  const activeCount = rows.filter((row) => row.status.toLowerCase() === 'active').length;
  const inactiveCount = rows.filter((row) => row.status.toLowerCase() === 'inactive').length;

  return (
    <>
      <PageBanner
        title="Treatment strategies"
        subtitle="KRI treatment strategy configuration managed through the centralized KRI service"
        breadcrumb={['Kyronix', 'System configurations', 'Treatment strategies']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            {canManage && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setFormMode('create');
                  setFormError(null);
                  setFormOpen(true);
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Create treatment strategy
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total strategies" value={String(rows.length)} tone="neutral" delta={0} />
        <StatCard label="Active strategies" value={String(activeCount)} tone="success" delta={0} />
        <StatCard label="Inactive strategies" value={String(inactiveCount)} tone="warning" delta={0} />
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to view treatment strategies.
        </div>
      )}

      {accessToken && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.id)}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refetch()}
          onRowClick={(row) => void loadDetail(row.id)}
          searchPlaceholder="Search treatment strategy code, name, or status"
          exportName="treatment-strategies"
          pageSize={10}
        />
      )}

      <TreatmentStrategyForm
        open={formOpen}
        mode={formMode}
        initialValues={selected}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <DetailDrawer
        open={detailOpen}
        title={selected?.code ?? 'Treatment strategy detail'}
        subtitle="Treatment strategy record"
        onClose={() => setDetailOpen(false)}
        width="md"
      >
        {detailBusy && <EmptyState description="Loading treatment strategy..." />}
        {!detailBusy && !selected && <EmptyState description="Select a treatment strategy to view its details." />}
        {!detailBusy && selected && (
          <dl>
            <DetailRow label="ID">{selected.id}</DetailRow>
            <DetailRow label="Code">{selected.code}</DetailRow>
            <DetailRow label="Name">{selected.name}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={selected.status} />
            </DetailRow>
            <DetailRow label="Created by">{selected.createdBy ?? 'Unknown'}</DetailRow>
            <DetailRow label="Created at">{selected.createdAt ? formatDateTime(selected.createdAt) : 'Unknown'}</DetailRow>
            <DetailRow label="Updated by">{selected.updatedBy ?? 'Unknown'}</DetailRow>
            <DetailRow label="Updated at">{selected.updatedAt ? formatDateTime(selected.updatedAt) : 'Unknown'}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Treatment strategy action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.code}?` : 'Delete treatment strategy?'}
        description={
          deleteTarget
            ? `This will permanently delete the ${deleteTarget.name} treatment strategy. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete treatment strategy"
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
