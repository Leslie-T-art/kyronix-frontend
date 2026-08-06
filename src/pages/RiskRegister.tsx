import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  Trash2Icon
} from 'lucide-react';
import { RiskForm } from '../components/forms/RiskForm';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState, ErrorState, LoadingState } from '../components/shared/States';
import { PageBanner } from '../components/shared/PageBanner';
import { RowActionsMenu, type RowActionItem } from '../components/shared/RowActionsMenu';
import { RoleGate } from '../components/shared/RoleGate';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  createRiskRecord,
  deleteRiskRecord,
  getRiskRecord,
  listRiskRecords,
  updateRiskRecord
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { formatDate, formatDateTime } from '../utils/cn';
import type { RiskEntry, RiskRecord, RiskRecordPayload } from '../types';

function toEntry(record: RiskRecord): RiskEntry {
  return {
    id: record.riskId,
    title: record.riskTitle,
    category: record.category,
    inherentRating: record.inherentRating,
    residualRating: record.residualRating,
    controls: record.controlsMapped,
    owner: record.owner,
    unit: record.businessUnit,
    reviewDate: record.nextReviewDate,
    status: record.status,
    likelihood: record.likelihood,
    impact: record.impact,
    description: record.description
  };
}

function canManageRiskRegister(role: string): boolean {
  return ['Admin', 'Head', 'RiskManager', 'ProcessOwner', 'Inputter'].includes(role);
}

export function RiskRegister() {
  const { user, accessToken, signOut } = useAuth();
  const [records, setRecords] = useState<RiskRecord[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [detailError, setDetailError] = useState<ApiError | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formRisk, setFormRisk] = useState<RiskRecord | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RiskRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const rows = useMemo(() => records.map(toEntry), [records]);
  const canManage = user ? canManageRiskRegister(user.role) : false;

  const handleApiError = useCallback((nextError: ApiError | null, scope: 'page' | 'detail' = 'page') => {
    if (nextError?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }

    if (scope === 'detail') {
      setDetailError(nextError);
      return;
    }

    setError(nextError);
  }, [signOut]);

  const loadRisks = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listRiskRecords(accessToken);
    setRecords(response.data ?? []);
    handleApiError(response.error, 'page');
    setIsLoading(false);
  }, [accessToken, handleApiError]);

  useEffect(() => {
    void loadRisks();
  }, [loadRisks]);

  const openRiskDetail = useCallback(async (riskId: string) => {
    if (!accessToken) return;

    setDetailOpen(true);
    setDetailBusy(true);
    setDetailError(null);

    const response = await getRiskRecord(accessToken, riskId);
    if (response.data) {
      setSelectedRisk(response.data);
    }
    handleApiError(response.error, 'detail');
    setDetailBusy(false);
  }, [accessToken, handleApiError]);

  const startCreate = useCallback(() => {
    setFormMode('create');
    setFormRisk(null);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const startEdit = useCallback(async (riskId: string) => {
    if (!accessToken) return;

    setFormBusy(true);
    setFormError(null);
    const response = await getRiskRecord(accessToken, riskId);
    setFormBusy(false);

    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setFormError(response.error?.message ?? 'Unable to load the selected risk.');
      return;
    }

    setFormMode('edit');
    setFormRisk(response.data);
    setFormOpen(true);
  }, [accessToken, signOut]);

  async function handleFormSubmit(payload: RiskRecordPayload) {
    if (!accessToken) return;

    setFormBusy(true);
    setFormError(null);

    const response =
      formMode === 'create'
        ? await createRiskRecord(accessToken, payload)
        : await updateRiskRecord(accessToken, formRisk?.riskId ?? '', payload);

    setFormBusy(false);

    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setFormError(response.error?.message ?? 'Unable to save the risk record.');
      return;
    }

    setFormOpen(false);
    setFormRisk(null);
    setSavedMessage(
      formMode === 'create'
        ? `Risk ${response.data.riskId} created successfully.`
        : `Risk ${response.data.riskId} updated successfully.`
    );

    await loadRisks();

    if (selectedRisk?.riskId === response.data.riskId) {
      setSelectedRisk(response.data);
    }
  }

  async function handleDeleteConfirm() {
    if (!accessToken || !deleteTarget) return;

    setDeleteBusy(true);
    const response = await deleteRiskRecord(accessToken, deleteTarget.riskId);
    setDeleteBusy(false);

    if (response.error) {
      if (response.error.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setError(response.error);
      return;
    }

    const deletedRiskId = deleteTarget.riskId;
    setDeleteTarget(null);
    setSavedMessage(`Risk ${deletedRiskId} deleted successfully.`);
    setDetailOpen(false);
    setSelectedRisk(null);
    await loadRisks();
  }

  const columns = useMemo<Column<RiskEntry>[]>(() => {
    const base: Column<RiskEntry>[] = [
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
        header: 'Controls mapped',
        value: (row) => row.controls,
        render: (row) => <span className="block max-w-[220px] truncate">{row.controls || '—'}</span>
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
        roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Inputter'],
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
      }
    ];

    if (!canManage) return base;

    return [
      ...base,
      {
        key: 'actions',
        header: '',
        sortable: false,
        value: () => '',
        render: (row) => {
          const risk = records.find((item) => item.riskId === row.id);
          if (!risk) return null;

          const actions: RowActionItem[] = [
            {
              key: 'view',
              label: 'View risk',
              icon: EyeIcon,
              onClick: () => {
                setOpenMenuId(null);
                void openRiskDetail(risk.riskId);
              }
            },
            {
              key: 'edit',
              label: 'Edit risk',
              icon: PencilIcon,
              onClick: () => {
                setOpenMenuId(null);
                void startEdit(risk.riskId);
              }
            },
            {
              key: 'delete',
              label: 'Delete risk',
              icon: Trash2Icon,
              tone: 'danger',
              onClick: () => {
                setOpenMenuId(null);
                setDeleteTarget(risk);
              }
            }
          ];

          return (
            <RowActionsMenu
              open={openMenuId === risk.riskId}
              onToggle={() => setOpenMenuId((current) => current === risk.riskId ? null : risk.riskId)}
              actions={actions}
              ariaLabel={`Actions for ${risk.riskId}`}
            />
          );
        }
      }
    ];
  }, [canManage, openMenuId, openRiskDetail, records, startEdit]);

  return (
    <>
      <PageBanner
        title="Risk Register"
        subtitle="The bank's consolidated inventory of identified risks, controls and residual exposure"
        breadcrumb={['Kyronix', 'Risk Register']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadRisks()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <RoleGate allow={['Admin', 'Head', 'RiskManager', 'ProcessOwner', 'Inputter']}>
              <Button variant="accent" size="sm" onClick={startCreate}>
                <PlusIcon className="h-3.5 w-3.5" />
                New risk
              </Button>
            </RoleGate>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard
          label="Critical residual"
          value={String(rows.filter((row) => row.residualRating === 'Critical').length)}
          tone="critical"
          delta={0}
        />
        <StatCard
          label="High residual"
          value={String(rows.filter((row) => row.residualRating === 'High').length)}
          tone="warning"
          delta={0}
        />
        <StatCard
          label="Closed records"
          value={String(rows.filter((row) => row.status === 'Closed').length)}
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
        onRetry={() => void loadRisks()}
        onRowClick={(row) => void openRiskDetail(row.id)}
        searchPlaceholder="Search risks"
        exportName="risk-register"
      />

      <DetailDrawer
        open={detailOpen}
        title={selectedRisk?.riskTitle ?? 'Risk details'}
        subtitle={selectedRisk ? `${selectedRisk.riskId} · ${selectedRisk.category}` : undefined}
        onClose={() => {
          setDetailOpen(false);
          setSelectedRisk(null);
          setDetailError(null);
        }}
      >
        {detailBusy ? <LoadingState rows={6} /> : null}
        {!detailBusy && detailError ? (
          <ErrorState
            description={detailError.message}
            correlationId={detailError.correlationId}
            onRetry={() => selectedRisk ? void openRiskDetail(selectedRisk.riskId) : undefined}
          />
        ) : null}
        {!detailBusy && !detailError && !selectedRisk ? <EmptyState description="No risk details available." /> : null}
        {!detailBusy && !detailError && selectedRisk ? (
          <>
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs leading-relaxed text-zinc-600">
              {selectedRisk.description}
            </p>
            <dl className="mt-4">
              <DetailRow label="Inherent rating">
                <StatusBadge status={selectedRisk.inherentRating} withDot={false} />
              </DetailRow>
              <DetailRow label="Residual rating">
                <StatusBadge status={selectedRisk.residualRating} withDot={false} />
              </DetailRow>
              <DetailRow label="Likelihood × impact">
                {selectedRisk.likelihood} × {selectedRisk.impact}
              </DetailRow>
              <DetailRow label="Controls mapped">{selectedRisk.controlsMapped || '—'}</DetailRow>
              <DetailRow label="Control effectiveness">{selectedRisk.controlEffectiveness || '—'}</DetailRow>
              <DetailRow label="Owner">{selectedRisk.owner}</DetailRow>
              <DetailRow label="Business unit">{selectedRisk.businessUnit}</DetailRow>
              <DetailRow label="Treatment strategy">{selectedRisk.treatmentStrategy || '—'}</DetailRow>
              <DetailRow label="Linked process">{selectedRisk.linkedProcess || '—'}</DetailRow>
              <DetailRow label="Linked KRI">{selectedRisk.linkedKri || '—'}</DetailRow>
              <DetailRow label="Action plan">{selectedRisk.actionPlan || '—'}</DetailRow>
              <DetailRow label="Next review">{formatDate(selectedRisk.nextReviewDate)}</DetailRow>
              <DetailRow label="Status">
                <StatusBadge status={selectedRisk.status} />
              </DetailRow>
              <DetailRow label="Created at">{selectedRisk.createdAt ? formatDateTime(selectedRisk.createdAt) : '—'}</DetailRow>
              <DetailRow label="Updated at">{selectedRisk.updatedAt ? formatDateTime(selectedRisk.updatedAt) : '—'}</DetailRow>
            </dl>
          </>
        ) : null}
      </DetailDrawer>

      <RiskForm
        open={formOpen}
        mode={formMode}
        initialValue={formRisk}
        busy={formBusy}
        error={formError}
        onClose={() => {
          if (formBusy) return;
          setFormOpen(false);
          setFormRisk(null);
          setFormError(null);
        }}
        onSubmit={handleFormSubmit}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title={deleteTarget ? `Delete ${deleteTarget.riskId}?` : 'Delete risk?'}
        description="This will permanently remove the selected risk record."
        confirmLabel={deleteBusy ? 'Deleting...' : 'Delete risk'}
        busy={deleteBusy}
        tone="danger"
        onClose={() => {
          if (deleteBusy) return;
          setDeleteTarget(null);
        }}
        onConfirm={() => void handleDeleteConfirm()}
      />

      <SuccessModal
        open={savedMessage !== null}
        title="Risk register updated"
        description={savedMessage ?? ''}
        onClose={() => setSavedMessage(null)}
      />
    </>
  );
}
