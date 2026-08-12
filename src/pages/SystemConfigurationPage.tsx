import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { OltsConfigurationItemForm } from '../components/forms/OltsConfigurationItemForm';
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
  createOltsConfigurationItem,
  deleteOltsConfigurationItem,
  getOltsConfigurationItem,
  listOltsConfigurationItems,
  updateOltsConfigurationItem
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import type { EngineKey, OltsConfigurationItem, OltsConfigurationItemPayload } from '../types';
import { formatDateTime } from '../utils/cn';

interface SystemConfigurationDefinition {
  key: EngineKey;
  resource: string;
  title: string;
  singular: string;
}

const DEFINITIONS: Record<
  | 'eventStatuses'
  | 'residualRisks'
  | 'actionStatuses'
  | 'recoveryMethods'
  | 'rootCauses'
  | 'baselEventCategories'
  | 'dataSources'
  | 'validationResults'
  | 'controls'
  | 'currencies',
  SystemConfigurationDefinition
> = {
  eventStatuses: {
    key: 'eventStatuses',
    resource: 'event-statuses',
    title: 'Event Status',
    singular: 'event status'
  },
  residualRisks: {
    key: 'residualRisks',
    resource: 'residual-risks',
    title: 'Residual Risk',
    singular: 'residual risk'
  },
  actionStatuses: {
    key: 'actionStatuses',
    resource: 'action-statuses',
    title: 'Action Status',
    singular: 'action status'
  },
  recoveryMethods: {
    key: 'recoveryMethods',
    resource: 'recovery-methods',
    title: 'Recovery Method',
    singular: 'recovery method'
  },
  rootCauses: {
    key: 'rootCauses',
    resource: 'root-causes',
    title: 'Root Cause',
    singular: 'root cause'
  },
  baselEventCategories: {
    key: 'baselEventCategories',
    resource: 'basel-event-categories',
    title: 'Basel Event Categories',
    singular: 'Basel event category'
  },
  dataSources: {
    key: 'dataSources',
    resource: 'data-sources',
    title: 'Data Source',
    singular: 'data source'
  },
  validationResults: {
    key: 'validationResults',
    resource: 'validation-results',
    title: 'Validation Result',
    singular: 'validation result'
  },
  controls: {
    key: 'controls',
    resource: 'controls',
    title: 'Controls',
    singular: 'control'
  },
  currencies: {
    key: 'currencies',
    resource: 'currencies',
    title: 'Currency',
    singular: 'currency'
  }
};

function SystemConfigurationPage({ definition }: {definition: SystemConfigurationDefinition;}) {
  const { user, accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<OltsConfigurationItem[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<OltsConfigurationItem | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OltsConfigurationItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
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

  const loadItems = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listOltsConfigurationItems(accessToken, definition.resource);
    if (handleUnauthorized(response.error)) return;
    setRows(response.data ?? []);
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, definition.resource, handleUnauthorized]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function loadDetail(itemId: string | number) {
    if (!accessToken) return;
    setDetailBusy(true);
    const response = await getOltsConfigurationItem(accessToken, definition.resource, itemId);
    setDetailBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setError(response.error);
      return;
    }

    setSelected(response.data);
    setDetailOpen(true);
  }

  async function handleCreate(payload: OltsConfigurationItemPayload) {
    if (!accessToken || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createOltsConfigurationItem(accessToken, definition.resource, payload);
    setFormBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? `Unable to create ${definition.singular}.`);
      return;
    }

    setFormOpen(false);
    setSavedMessage(`${definition.title} ${response.data.code} created successfully.`);
    await loadItems();
  }

  async function handleUpdate(payload: OltsConfigurationItemPayload) {
    if (!accessToken || !selected || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateOltsConfigurationItem(accessToken, definition.resource, selected.id, payload);
    setFormBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? `Unable to update ${definition.singular}.`);
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`${definition.title} ${response.data.code} updated successfully.`);
    await loadItems();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget || !canManage) return;
    setDeleteBusy(true);
    const response = await deleteOltsConfigurationItem(accessToken, definition.resource, deleteTarget.id);
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
    setSavedMessage(`${definition.title} ${deleteTarget.code} deleted successfully.`);
    await loadItems();
  }

  const columns = useMemo(() => {
    const base: Column<OltsConfigurationItem>[] = [
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
        key: 'displayOrder',
        header: 'Display order',
        align: 'right',
        value: (row) => row.displayOrder
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
              label: `View ${definition.singular}`,
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
                    label: `Update ${definition.singular}`,
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
                    label: `Delete ${definition.singular}`,
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
    ];

    return base;
  }, [canManage, definition.singular, openMenuId]);

  const describedCount = rows.filter((row) => row.description.trim() !== '').length;
  const maxDisplayOrder = rows.reduce((max, row) => Math.max(max, row.displayOrder), 0);

  return (
    <>
      <PageBanner
        title={definition.title}
        subtitle="OLTS system configuration managed through the centralized OLTS service"
        breadcrumb={['Kyronix', 'System configurations', definition.title]}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadItems()}>
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
                Create {definition.singular}
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label={`Total ${definition.title.toLowerCase()}`} value={String(rows.length)} tone="neutral" delta={0} />
        <StatCard label="With descriptions" value={String(describedCount)} tone="info" delta={0} />
        <StatCard label="Max display order" value={String(maxDisplayOrder)} tone="success" delta={0} />
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to view {definition.title.toLowerCase()}.
        </div>
      )}

      {accessToken && (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => String(row.id)}
          isLoading={isLoading}
          error={error}
          onRetry={() => void loadItems()}
          onRowClick={(row) => void loadDetail(row.id)}
          searchPlaceholder={`Search ${definition.singular} code, name, or description`}
          exportName={definition.resource}
          pageSize={10}
        />
      )}

      <OltsConfigurationItemForm
        open={formOpen}
        mode={formMode}
        entityLabel={definition.singular}
        initialValues={selected}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <DetailDrawer
        open={detailOpen}
        title={selected?.code ?? `${definition.title} detail`}
        subtitle="OLTS configuration record"
        onClose={() => setDetailOpen(false)}
        width="md"
      >
        {detailBusy && <EmptyState description={`Loading ${definition.singular}...`} />}
        {!detailBusy && !selected && <EmptyState description={`Select a ${definition.singular} to view its details.`} />}
        {!detailBusy && selected && (
          <dl>
            <DetailRow label="ID">{selected.id}</DetailRow>
            <DetailRow label="Code">{selected.code}</DetailRow>
            <DetailRow label="Name">{selected.name}</DetailRow>
            <DetailRow label="Description">{selected.description || 'Not provided'}</DetailRow>
            <DetailRow label="Display order">{selected.displayOrder}</DetailRow>
            <DetailRow label="Created by">{selected.createdBy ?? 'Unknown'}</DetailRow>
            <DetailRow label="Created at">{selected.createdAt ? formatDateTime(selected.createdAt) : 'Unknown'}</DetailRow>
            <DetailRow label="Updated by">{selected.updatedBy ?? 'Unknown'}</DetailRow>
            <DetailRow label="Updated at">{selected.updatedAt ? formatDateTime(selected.updatedAt) : 'Unknown'}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Configuration action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.code}?` : `Delete ${definition.singular}?`}
        description={
          deleteTarget
            ? `This will permanently delete the ${deleteTarget.name} ${definition.singular}. This action cannot be undone.`
            : undefined
        }
        confirmLabel={`Delete ${definition.singular}`}
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

export function EventStatuses() {
  return <SystemConfigurationPage definition={DEFINITIONS.eventStatuses} />;
}

export function ResidualRisks() {
  return <SystemConfigurationPage definition={DEFINITIONS.residualRisks} />;
}

export function ActionStatuses() {
  return <SystemConfigurationPage definition={DEFINITIONS.actionStatuses} />;
}

export function RecoveryMethods() {
  return <SystemConfigurationPage definition={DEFINITIONS.recoveryMethods} />;
}

export function RootCauses() {
  return <SystemConfigurationPage definition={DEFINITIONS.rootCauses} />;
}

export function BaselEventCategories() {
  return <SystemConfigurationPage definition={DEFINITIONS.baselEventCategories} />;
}

export function DataSources() {
  return <SystemConfigurationPage definition={DEFINITIONS.dataSources} />;
}

export function ValidationResults() {
  return <SystemConfigurationPage definition={DEFINITIONS.validationResults} />;
}

export function Controls() {
  return <SystemConfigurationPage definition={DEFINITIONS.controls} />;
}

export function Currencies() {
  return <SystemConfigurationPage definition={DEFINITIONS.currencies} />;
}
