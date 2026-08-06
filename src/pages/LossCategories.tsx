import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { LossCategoryForm } from '../components/forms/LossCategoryForm';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState } from '../components/shared/States';
import { PageBanner } from '../components/shared/PageBanner';
import { RowActionsMenu, type RowActionItem } from '../components/shared/RowActionsMenu';
import { StatCard } from '../components/shared/StatCard';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  createLossCategory,
  deleteLossCategory,
  getLossCategory,
  listLossCategories,
  updateLossCategory
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import type { LossCategory, LossCategoryPayload } from '../types';

export function LossCategories() {
  const { user, accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<LossCategory[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<LossCategory | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LossCategory | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const canManage = user?.role === 'Admin';

  const loadLossCategories = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listLossCategories(accessToken);
    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    setRows(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, signOut]);

  useEffect(() => {
    void loadLossCategories();
  }, [loadLossCategories]);

  async function loadDetail(lossCategoryId: string) {
    if (!accessToken) return;
    setDetailBusy(true);
    const response = await getLossCategory(accessToken, lossCategoryId);
    setDetailBusy(false);

    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (response.error || !response.data) {
      setError(response.error);
      return;
    }

    setSelected(response.data);
    setDetailOpen(true);
  }

  async function handleCreate(payload: LossCategoryPayload) {
    if (!accessToken || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createLossCategory(accessToken, payload);
    setFormBusy(false);

    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to create loss category.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Loss category ${response.data.code} created successfully.`);
    await loadLossCategories();
  }

  async function handleUpdate(payload: LossCategoryPayload) {
    if (!accessToken || !selected || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateLossCategory(accessToken, selected.id, payload);
    setFormBusy(false);

    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to update loss category.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`Loss category ${response.data.code} updated successfully.`);
    await loadLossCategories();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget || !canManage) return;
    setDeleteBusy(true);
    const response = await deleteLossCategory(accessToken, deleteTarget.id);
    setDeleteBusy(false);

    if (response.error?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (response.error) {
      setError(response.error);
      return;
    }

    if (selected?.id === deleteTarget.id) {
      setSelected(null);
      setDetailOpen(false);
    }
    setDeleteTarget(null);
    setSavedMessage(`Loss category ${deleteTarget.code} deleted successfully.`);
    await loadLossCategories();
  }

  const columns = useMemo(() => {
    const base: Column<LossCategory>[] = [
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
        key: 'description',
        header: 'Description',
        value: (row) => row.description,
        render: (row) => <span className="block max-w-[420px] truncate">{row.description}</span>
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
              label: 'View loss category',
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
                    label: 'Update loss category',
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
                    label: 'Delete loss category',
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
  }, [canManage, openMenuId]);

  const descriptionCount = rows.filter((row) => row.description.trim() !== '').length;
  const uniqueCodes = new Set(rows.map((row) => row.code)).size;

  return (
    <>
      <PageBanner
        title="Loss Categories"
        subtitle="OLTS loss category reference data managed through the centralized OLTS service"
        breadcrumb={['Kyronix', 'Loss Categories']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadLossCategories()}>
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
                Create loss category
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total categories" value={String(rows.length)} tone="neutral" delta={0} />
        <StatCard label="With descriptions" value={String(descriptionCount)} tone="info" delta={0} />
        <StatCard label="Unique codes" value={String(uniqueCodes)} tone="success" delta={0} />
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to manage loss categories.
        </div>
      )}

      {accessToken && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void loadLossCategories()}
          onRowClick={(row) => void loadDetail(row.id)}
          searchPlaceholder="Search loss category code, name, or description"
          exportName="loss-categories"
          pageSize={10}
        />
      )}

      <LossCategoryForm
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
        title={selected?.code ?? 'Loss category detail'}
        subtitle="OLTS loss category record"
        onClose={() => setDetailOpen(false)}
        width="md"
      >
        {detailBusy && <EmptyState description="Loading loss category..." />}
        {!detailBusy && !selected && <EmptyState description="Select a loss category to view its details." />}
        {!detailBusy && selected && (
          <dl>
            <DetailRow label="ID">{selected.id}</DetailRow>
            <DetailRow label="Code">{selected.code}</DetailRow>
            <DetailRow label="Name">{selected.name}</DetailRow>
            <DetailRow label="Description">{selected.description}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Loss category action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.code}?` : 'Delete loss category?'}
        description={
          deleteTarget
            ? `This will permanently delete the ${deleteTarget.name} loss category. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete loss category"
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
