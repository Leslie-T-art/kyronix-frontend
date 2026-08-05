import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { DepartmentForm } from '../components/forms/DepartmentForm';
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
import { createDepartment, deleteDepartment, listDepartments, updateDepartment } from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import type { Department, DepartmentPayload } from '../types';

export function Departments() {
  const { accessToken } = useAuth();
  const [rows, setRows] = useState<Department[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Department | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const loadDepartments = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listDepartments(accessToken);
    setRows(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken]);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  async function handleCreate(payload: DepartmentPayload) {
    if (!accessToken) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createDepartment(accessToken, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to create department.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Department ${response.data.code} created successfully.`);
    await loadDepartments();
  }

  async function handleUpdate(payload: DepartmentPayload) {
    if (!accessToken || !selected) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateDepartment(accessToken, selected.id, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to update department.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`Department ${response.data.code} updated successfully.`);
    await loadDepartments();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget) return;
    setDeleteBusy(true);
    const response = await deleteDepartment(accessToken, deleteTarget.id);
    setDeleteBusy(false);
    if (response.error) {
      setError(response.error);
      return;
    }

    if (selected?.id === deleteTarget.id) {
      setSelected(null);
      setDetailOpen(false);
    }
    setDeleteTarget(null);
    setSavedMessage(`Department ${deleteTarget.code} deleted successfully.`);
    await loadDepartments();
  }

  const columns = useMemo(() => {
    const base: Column<Department>[] = [
      {
        key: 'code',
        header: 'Code',
        value: (row) => row.code,
        render: (row) => <span className="font-medium text-navy">{row.code}</span>
      },
      {
        key: 'name',
        header: 'Name',
        value: (row) => row.name
      },
      {
        key: 'active',
        header: 'Status',
        filterable: true,
        value: (row) => (row.active ? 'Active' : 'Inactive'),
        render: (row) => <StatusBadge status={row.active ? 'Active' : 'Inactive'} />
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
              label: 'View department',
              icon: EyeIcon,
              onClick: () => {
                setSelected(row);
                setDetailOpen(true);
                setOpenMenuId(null);
              }
            },
            {
              key: 'edit',
              label: 'Update department',
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
              label: 'Delete department',
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
              ariaLabel={`Actions for ${row.code}`}
            />
          );
        }
      }
    ];

    return base;
  }, [openMenuId]);

  const activeCount = rows.filter((row) => row.active).length;
  const inactiveCount = rows.length - activeCount;

  return (
    <>
      <PageBanner
        title="Departments"
        subtitle="Admin-only department reference data managed through the centralized auth service"
        breadcrumb={['Kyronix', 'Departments']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadDepartments()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
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
              Create department
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total departments" value={String(rows.length)} tone="neutral" delta={0} />
        <StatCard label="Active" value={String(activeCount)} tone="success" delta={0} />
        <StatCard label="Inactive" value={String(inactiveCount)} tone="warning" delta={0} />
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to manage departments.
        </div>
      )}

      {accessToken && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void loadDepartments()}
          onRowClick={(row) => {
            setSelected(row);
            setDetailOpen(true);
          }}
          searchPlaceholder="Search department code or name"
          exportName="departments"
          pageSize={10}
        />
      )}

      <DepartmentForm
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
        title={selected?.code ?? 'Department detail'}
        subtitle="Admin department record"
        onClose={() => setDetailOpen(false)}
        width="md"
      >
        {!selected && <EmptyState description="Select a department to view its details." />}
        {selected && (
          <dl>
            <DetailRow label="ID">{selected.id}</DetailRow>
            <DetailRow label="Code">{selected.code}</DetailRow>
            <DetailRow label="Name">{selected.name}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={selected.active ? 'Active' : 'Inactive'} />
            </DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Department action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.code}?` : 'Delete department?'}
        description={
          deleteTarget
            ? `This will permanently delete the ${deleteTarget.name} department record. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete department"
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
