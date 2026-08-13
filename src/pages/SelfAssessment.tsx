import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { EyeIcon, PencilIcon, PlusIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import { SelfAssessmentForm } from '../components/forms/SelfAssessmentForm';
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
import {
  countSelfAssessments,
  createSelfAssessment,
  deleteSelfAssessment,
  getSelfAssessment,
  listDepartments,
  listSelfAssessments,
  updateSelfAssessment
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { formatDate, formatDateTime } from '../utils/cn';
import type { Department, SelfAssessment, SelfAssessmentPayload } from '../types';

interface SelfAssessmentListPayload {
  content?: SelfAssessment[];
  totalElements?: number;
}

function score(impact: number, likelihood: number): number {
  return (impact || 0) * (likelihood || 0);
}

function statusForAssessment(record: SelfAssessment): string {
  if (record.businessReviewStatus) return record.businessReviewStatus;
  if (new Date(record.nextReviewDate).getTime() < Date.now()) return 'Overdue';
  return 'In Progress';
}

export function SelfAssessmentPage() {
  const { user, accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<SelfAssessment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<SelfAssessment | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SelfAssessment | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const canManage = user?.role === 'Admin' || user?.role === 'RiskManager';

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

  const loadDepartmentsData = useCallback(async () => {
    if (!accessToken) return;
    const response = await listDepartments(accessToken);
    if (handleUnauthorized(response.error)) return;
    setDepartments(response.data ?? []);
  }, [accessToken, handleUnauthorized]);

  const loadAssessments = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listSelfAssessments(accessToken);
    if (handleUnauthorized(response.error)) return;
    const payload = response.data as SelfAssessment[] | SelfAssessmentListPayload | null;
    const nextRows = Array.isArray(payload) ? payload : payload?.content ?? [];
    setRows(nextRows);
    if (!Array.isArray(payload) && typeof payload?.totalElements === 'number') {
      setCount(payload.totalElements);
    }
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, handleUnauthorized]);

  const loadCount = useCallback(async () => {
    if (!accessToken || !user?.departmentId) return;
    const response = await countSelfAssessments(accessToken, user.departmentId);
    if (handleUnauthorized(response.error)) return;
    setCount(response.data ?? null);
  }, [accessToken, handleUnauthorized, user?.departmentId]);

  useEffect(() => {
    void loadAssessments();
    void loadDepartmentsData();
    void loadCount();
  }, [loadAssessments, loadCount, loadDepartmentsData]);

  async function loadDetail(id: string | number) {
    if (!accessToken) return;
    setDetailBusy(true);
    const response = await getSelfAssessment(accessToken, id);
    setDetailBusy(false);
    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setError(response.error);
      return;
    }

    setSelected(response.data);
    setDetailOpen(true);
  }

  async function handleCreate(payload: SelfAssessmentPayload) {
    if (!accessToken || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createSelfAssessment(accessToken, payload);
    setFormBusy(false);
    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to launch self assessment.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Self assessment ${response.data.rcsaId} launched successfully.`);
    await loadAssessments();
    await loadCount();
  }

  async function handleUpdate(payload: SelfAssessmentPayload) {
    if (!accessToken || !selected || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateSelfAssessment(accessToken, selected.id, payload);
    setFormBusy(false);
    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to update self assessment.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`Self assessment ${response.data.rcsaId} updated successfully.`);
    await loadAssessments();
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget || !canManage) return;
    setDeleteBusy(true);
    const response = await deleteSelfAssessment(accessToken, deleteTarget.id);
    setDeleteBusy(false);
    if (handleUnauthorized(response.error)) return;
    if (response.error) {
      setError(response.error);
      return;
    }

    setDeleteTarget(null);
    setSavedMessage(`Self assessment ${deleteTarget.rcsaId} deleted successfully.`);
    await loadAssessments();
    await loadCount();
  }

  const columns = useMemo(() => {
    const base: Column<SelfAssessment>[] = [
      {
        key: 'rcsaId',
        header: 'Assessment',
        value: (row) => row.rcsaId,
        render: (row) => (
          <div>
            <p className="font-medium text-navy">{row.rcsaId}</p>
            <p className="text-[11px] text-zinc-400">{row.processName}</p>
          </div>
        )
      },
      {
        key: 'assessmentPeriod',
        header: 'Period',
        filterable: true,
        value: (row) => row.assessmentPeriod
      },
      {
        key: 'inherentRiskRating',
        header: 'Inherent rating',
        filterable: true,
        value: (row) => row.inherentRiskRating,
        render: (row) => <StatusBadge status={row.inherentRiskRating} />
      },
      {
        key: 'residualRiskRating',
        header: 'Residual rating',
        filterable: true,
        value: (row) => row.residualRiskRating,
        render: (row) => <StatusBadge status={row.residualRiskRating} />
      },
      {
        key: 'businessReviewStatus',
        header: 'Review status',
        filterable: true,
        value: (row) => statusForAssessment(row),
        render: (row) => <StatusBadge status={statusForAssessment(row)} />
      },
      {
        key: 'nextReviewDate',
        header: 'Next review',
        value: (row) => row.nextReviewDate,
        render: (row) => formatDate(row.nextReviewDate)
      }
    ];

    if (!canManage) return base;

    return [
      ...base,
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        value: () => 'Actions',
        render: (row) => {
          const actions: RowActionItem[] = [
            {
              key: 'view',
              label: 'View self assessment',
              icon: EyeIcon,
              onClick: () => {
                void loadDetail(row.id);
                setOpenMenuId(null);
              }
            },
            {
              key: 'edit',
              label: 'Update self assessment',
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
              label: 'Delete self assessment',
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
              open={openMenuId === String(row.id)}
              onToggle={() => setOpenMenuId((current) => (current === String(row.id) ? null : String(row.id)))}
              actions={actions}
              ariaLabel={`Actions for ${row.rcsaId}`}
            />
          );
        }
      }
    ];
  }, [canManage, openMenuId]);

  const overdueCount = rows.filter((row) => new Date(row.nextReviewDate).getTime() < Date.now()).length;
  const actionRequiredCount = rows.filter((row) => row.actionRequired).length;

  return (
    <>
      <PageBanner
        title="Self Assessment"
        subtitle="Risk and control self-assessments loaded from the live self assessment service"
        breadcrumb={['Kyronix', 'Self Assessment']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadAssessments()}>
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
                Launch assessment
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total assessments" value={String(count ?? rows.length)} tone="neutral" delta={0} />
        <StatCard label="Overdue reviews" value={String(overdueCount)} tone="critical" delta={0} />
        <StatCard label="Action required" value={String(actionRequiredCount)} tone="warning" delta={0} />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => String(row.id)}
        isLoading={isLoading}
        error={error}
        onRetry={() => void loadAssessments()}
        onRowClick={(row) => void loadDetail(row.id)}
        searchPlaceholder="Search self assessments"
        exportName="self-assessments"
      />

      <SelfAssessmentForm
        open={formOpen}
        mode={formMode}
        departments={departments}
        initialValues={selected}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <DetailDrawer
        open={detailOpen}
        title={selected?.rcsaId ?? 'Self assessment detail'}
        subtitle="Self assessment details"
        onClose={() => setDetailOpen(false)}
        width="lg"
      >
        {detailBusy && <EmptyState description="Loading self assessment..." />}
        {!detailBusy && !selected && <EmptyState description="Select a self assessment to view its details." />}
        {!detailBusy && selected && (
          <dl>
            <DetailRow label="RCSA ID">{selected.rcsaId}</DetailRow>
            <DetailRow label="Assessment period">{selected.assessmentPeriod}</DetailRow>
            <DetailRow label="Department ID">{selected.departmentId}</DetailRow>
            <DetailRow label="Process name">{selected.processName}</DetailRow>
            <DetailRow label="Risk register risk">{selected.riskRegisterRisk}</DetailRow>
            <DetailRow label="Inherent risk">{`${selected.inherentRiskRating} (${score(selected.inherentImpact, selected.inherentLikelihood)})`}</DetailRow>
            <DetailRow label="Residual risk">{`${selected.residualRiskRating} (${score(selected.residualImpact, selected.residualLikelihood)})`}</DetailRow>
            <DetailRow label="Business review status">{selected.businessReviewStatus}</DetailRow>
            <DetailRow label="Risk review verification">{selected.riskReviewVerification}</DetailRow>
            <DetailRow label="Date of last review">{formatDate(selected.dateOfLastReview)}</DetailRow>
            <DetailRow label="Next review date">{formatDate(selected.nextReviewDate)}</DetailRow>
            <DetailRow label="Created by">{selected.createdBy}</DetailRow>
            <DetailRow label="Created at">{formatDateTime(selected.createdAt)}</DetailRow>
            <DetailRow label="Updated by">{selected.updatedBy}</DetailRow>
            <DetailRow label="Updated at">{formatDateTime(selected.updatedAt)}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Self assessment action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.rcsaId}?` : 'Delete self assessment?'}
        description={
          deleteTarget
            ? `This will permanently delete self assessment ${deleteTarget.rcsaId}. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete self assessment"
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
