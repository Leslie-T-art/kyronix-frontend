import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2Icon,
  DownloadIcon,
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  PlayIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  Trash2Icon,
  XCircleIcon
} from 'lucide-react';
import { ProcessFlowForm } from '../components/forms/ProcessFlowForm';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { DataTable, type Column } from '../components/shared/DataTable';
import { DetailDrawer, DetailRow } from '../components/shared/DetailDrawer';
import { EmptyState } from '../components/shared/States';
import { Field, TextArea } from '../components/ui/Field';
import { PageBanner } from '../components/shared/PageBanner';
import { RowActionsMenu, type RowActionItem } from '../components/shared/RowActionsMenu';
import { StatCard } from '../components/shared/StatCard';
import { StatusBadge } from '../components/shared/StatusBadge';
import { SuccessModal } from '../components/shared/SuccessModal';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import type { ApiError } from '../lib/api/errors';
import {
  approveProcessFlow,
  countProcessFlows,
  createProcessFlow,
  deleteProcessFlow,
  downloadProcessFlowDocument,
  getProcessFlow,
  listDepartments,
  listProcessFlows,
  rejectProcessFlow,
  returnProcessFlow,
  submitProcessFlow,
  updateProcessFlow
} from '../lib/api/client';
import { formatDate, formatDateTime } from '../utils/cn';
import type { Department, ProcessFlowPayload, ProcessFlowRecord, WorkflowCommentPayload } from '../types';

type ProcessFlowActionKey = 'submit' | 'return' | 'reject' | 'approve' | 'delete';

interface ProcessFlowActionConfig {
  key: ProcessFlowActionKey;
  label: string;
  icon: typeof PlayIcon;
  tone?: 'danger';
  needsComment?: boolean;
  description: string;
}

interface ProcessFlowListPayload {
  content?: ProcessFlowRecord[];
  totalElements?: number;
}

const PROCESS_FLOW_ACTIONS: Record<Exclude<ProcessFlowActionKey, 'delete'>, ProcessFlowActionConfig> = {
  submit: {
    key: 'submit',
    label: 'Submit process flow',
    icon: PlayIcon,
    description: 'Submit the draft process flow for approval.'
  },
  return: {
    key: 'return',
    label: 'Return for correction',
    icon: RotateCcwIcon,
    needsComment: true,
    description: 'Return the process flow to the inputter with a correction comment.'
  },
  reject: {
    key: 'reject',
    label: 'Reject process flow',
    icon: XCircleIcon,
    tone: 'danger',
    needsComment: true,
    description: 'Reject the process flow and record the reason.'
  },
  approve: {
    key: 'approve',
    label: 'Approve process flow',
    icon: CheckCircle2Icon,
    needsComment: true,
    description: 'Approve the process flow and complete the workflow.'
  }
};

function canManageProcessFlows(role?: string): boolean {
  return role === 'Admin' || role === 'RiskManager' || role === 'ProcessOwner';
}

function canAuthorizeProcessFlows(role?: string): boolean {
  return role === 'Admin' || role === 'Head';
}

function ActionPrompt({
  open,
  action,
  record,
  busy,
  error,
  onClose,
  onConfirm
}: {
  open: boolean;
  action: ProcessFlowActionConfig | null;
  record: ProcessFlowRecord | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (payload: WorkflowCommentPayload) => Promise<void>;
}) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) return;
    setComment('');
  }, [open, action?.key, record?.id]);

  if (!open || !action || !record) return null;

  return (
    <DetailDrawer
      open={open}
      title={action.label}
      subtitle={record.flowReference}
      onClose={onClose}
      width="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} type="button" disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={action.tone === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={() => void onConfirm({ comment })}
            disabled={busy || Boolean(action.needsComment && comment.trim() === '')}
            type="button"
          >
            {busy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : null}
            Confirm
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-zinc-600">{action.description}</p>
      {action.needsComment && (
        <Field label="Comment" htmlFor="process-flow-comment" required>
          <TextArea
            id="process-flow-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Provide the workflow comment"
          />
        </Field>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}
    </DetailDrawer>
  );
}

export function ProcessFlowsPage() {
  const { user, accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<ProcessFlowRecord[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [count, setCount] = useState<number | null>(null);
  const [selected, setSelected] = useState<ProcessFlowRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProcessFlowRecord | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionRecord, setActionRecord] = useState<ProcessFlowRecord | null>(null);
  const [actionConfig, setActionConfig] = useState<ProcessFlowActionConfig | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canManage = canManageProcessFlows(user?.role);
  const canAuthorize = canAuthorizeProcessFlows(user?.role);

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
    const response = await listProcessFlows(accessToken);
    if (handleUnauthorized(response.error)) return;
    const payload = response.data as ProcessFlowRecord[] | ProcessFlowListPayload | null;
    const nextRows = Array.isArray(payload) ? payload : payload?.content ?? [];
    setRows(nextRows);
    if (!Array.isArray(payload) && typeof payload?.totalElements === 'number') {
      setCount(payload.totalElements);
    }
    setError(response.error);
    setIsLoading(false);
  }, [accessToken, handleUnauthorized]);

  const loadCount = useCallback(async () => {
    if (!accessToken) return;
    const response = await countProcessFlows(accessToken);
    if (handleUnauthorized(response.error)) return;
    setCount(response.data ?? null);
  }, [accessToken, handleUnauthorized]);

  const loadDepartmentsData = useCallback(async () => {
    if (!accessToken) return;
    const response = await listDepartments(accessToken);
    if (handleUnauthorized(response.error)) return;
    setDepartments(response.data ?? []);
  }, [accessToken, handleUnauthorized]);

  useEffect(() => {
    void refetch();
    void loadCount();
    void loadDepartmentsData();
  }, [loadCount, loadDepartmentsData, refetch]);

  async function loadDetail(id: string | number, openDrawer = true): Promise<ProcessFlowRecord | null> {
    if (!accessToken) return null;
    setDetailBusy(true);
    if (openDrawer) setDetailOpen(true);

    const response = await getProcessFlow(accessToken, id);
    setDetailBusy(false);
    if (handleUnauthorized(response.error)) return null;
    if (response.error || !response.data) {
      setError(response.error);
      return null;
    }

    setSelected(response.data);
    return response.data;
  }

  async function handleCreate(payload: ProcessFlowPayload) {
    if (!accessToken || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createProcessFlow(accessToken, payload);
    setFormBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to create process flow.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Process flow ${response.data.flowReference} created successfully.`);
    await refetch();
    await loadCount();
  }

  async function handleUpdate(payload: ProcessFlowPayload) {
    if (!accessToken || !selected || !canManage) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateProcessFlow(accessToken, selected.id, payload);
    setFormBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setFormError(response.error?.message ?? 'Unable to update process flow.');
      return;
    }

    setSelected(response.data);
    setFormOpen(false);
    setSavedMessage(`Process flow ${response.data.flowReference} updated successfully.`);
    await refetch();
    if (detailOpen) {
      await loadDetail(response.data.id, false);
    }
  }

  async function beginEdit(record: ProcessFlowRecord) {
    const detail = await loadDetail(record.id, false);
    setSelected(detail ?? record);
    setFormMode('edit');
    setFormError(null);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!accessToken || !deleteTarget || !canManage) return;
    setDeleteBusy(true);
    const response = await deleteProcessFlow(accessToken, deleteTarget.id);
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
    setSavedMessage(`Process flow ${deleteTarget.flowReference} deleted successfully.`);
    setDeleteTarget(null);
    await refetch();
    await loadCount();
  }

  async function runAction(payload: WorkflowCommentPayload) {
    if (!accessToken || !actionConfig || !actionRecord) return;
    setActionBusy(true);
    setActionError(null);

    const requester = {
      submit: submitProcessFlow,
      return: returnProcessFlow,
      reject: rejectProcessFlow,
      approve: approveProcessFlow
    } as const;

    const response = await requester[actionConfig.key](accessToken, actionRecord.id, payload);
    setActionBusy(false);

    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setActionError(response.error?.message ?? `Unable to ${actionConfig.label.toLowerCase()}.`);
      setError(response.error);
      return;
    }

    setActionConfig(null);
    setActionRecord(null);
    setOpenMenuId(null);
    setSavedMessage(`${actionConfig.label} completed for ${response.data.flowReference}.`);
    await refetch();
    if (detailOpen) {
      await loadDetail(response.data.id, false);
    }
  }

  async function handleDownloadDocument(record: ProcessFlowRecord) {
    if (!accessToken) return;
    const response = await downloadProcessFlowDocument(accessToken, record.id);
    if (handleUnauthorized(response.error)) return;
    if (response.error || !response.data) {
      setError(response.error);
      return;
    }

    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = record.originalFileName || `${record.flowReference}-document`;
    link.click();
    window.URL.revokeObjectURL(blobUrl);
  }

  const departmentLookup = useMemo(
    () => new Map(departments.map((department) => [String(department.id), `${department.code} - ${department.name}`])),
    [departments]
  );

  const columns = useMemo<Column<ProcessFlowRecord>[]>(() => [
    {
      key: 'flowReference',
      header: 'Reference',
      value: (row) => row.flowReference,
      render: (row) => (
        <div>
          <p className="font-medium text-navy">{row.flowReference}</p>
          <p className="text-[11px] text-zinc-400">{row.processFlowName}</p>
        </div>
      )
    },
    {
      key: 'departmentId',
      header: 'Department',
      filterable: true,
      value: (row) => departmentLookup.get(String(row.departmentId)) ?? String(row.departmentId)
    },
    {
      key: 'workflowStatus',
      header: 'Status',
      filterable: true,
      value: (row) => row.workflowStatus,
      render: (row) => <StatusBadge status={row.workflowStatus} />
    },
    {
      key: 'validToDate',
      header: 'Valid to',
      value: (row) => row.validToDate,
      render: (row) => formatDate(row.validToDate)
    },
    {
      key: 'updatedAt',
      header: 'Updated',
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
            label: 'View process flow',
            icon: EyeIcon,
            onClick: () => {
              void loadDetail(row.id);
              setOpenMenuId(null);
            }
          },
          {
            key: 'download',
            label: 'Download document',
            icon: DownloadIcon,
            onClick: () => {
              void handleDownloadDocument(row);
              setOpenMenuId(null);
            }
          },
          ...(canManage
            ? [
                {
                  key: 'edit',
                  label: 'Update process flow',
                  icon: PencilIcon,
                  onClick: () => {
                    void beginEdit(row);
                    setOpenMenuId(null);
                  }
                },
                {
                  key: 'submit',
                  label: 'Submit process flow',
                  icon: PlayIcon,
                  onClick: () => {
                    setActionRecord(row);
                    setActionConfig(PROCESS_FLOW_ACTIONS.submit);
                    setActionError(null);
                    setOpenMenuId(null);
                  }
                },
                {
                  key: 'delete',
                  label: 'Delete process flow',
                  icon: Trash2Icon,
                  tone: 'danger' as const,
                  onClick: () => {
                    setDeleteTarget(row);
                    setOpenMenuId(null);
                  }
                }
              ]
            : []),
          ...(canAuthorize
            ? [
                {
                  key: 'return',
                  label: 'Return for correction',
                  icon: RotateCcwIcon,
                  onClick: () => {
                    setActionRecord(row);
                    setActionConfig(PROCESS_FLOW_ACTIONS.return);
                    setActionError(null);
                    setOpenMenuId(null);
                  }
                },
                {
                  key: 'reject',
                  label: 'Reject process flow',
                  icon: XCircleIcon,
                  tone: 'danger' as const,
                  onClick: () => {
                    setActionRecord(row);
                    setActionConfig(PROCESS_FLOW_ACTIONS.reject);
                    setActionError(null);
                    setOpenMenuId(null);
                  }
                },
                {
                  key: 'approve',
                  label: 'Approve process flow',
                  icon: CheckCircle2Icon,
                  onClick: () => {
                    setActionRecord(row);
                    setActionConfig(PROCESS_FLOW_ACTIONS.approve);
                    setActionError(null);
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
            ariaLabel={`Actions for ${row.flowReference}`}
          />
        );
      }
    }
  ], [canAuthorize, canManage, departmentLookup, openMenuId]);

  const draftCount = rows.filter((row) => row.workflowStatus === 'DRAFT').length;
  const approvedCount = rows.filter((row) => row.workflowStatus === 'APPROVED').length;
  const expiredCount = rows.filter((row) => new Date(row.validToDate).getTime() < Date.now()).length;

  return (
    <>
      <PageBanner
        title="Process Flows"
        subtitle="Live process flow records managed through the centralized process flow service"
        breadcrumb={['Kyronix', 'Process Flows']}
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
                <PlayIcon className="h-3.5 w-3.5" />
                New process flow
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Total process flows" value={String(count ?? rows.length)} tone="neutral" delta={0} />
        <StatCard label="Draft records" value={String(draftCount)} tone="warning" delta={0} />
        <StatCard label="Approved records" value={String(approvedCount)} tone="success" delta={0} />
      </div>

      {expiredCount > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {expiredCount} process flow document{expiredCount === 1 ? '' : 's'} past the valid-to date.
        </div>
      )}

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to view process flows.
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
          searchPlaceholder="Search process flow reference, name, department, or status"
          exportName="process-flows"
        />
      )}

      <DetailDrawer
        open={detailOpen}
        title={selected?.flowReference ?? 'Process flow detail'}
        subtitle={selected ? `${selected.processFlowName} · ${selected.workflowStatus}` : 'Process flow details'}
        onClose={() => setDetailOpen(false)}
        width="lg"
        headerActions={
          selected?.originalFileName ? (
            <Button variant="outline" size="sm" onClick={() => void handleDownloadDocument(selected)} type="button">
              <DownloadIcon className="h-3.5 w-3.5" />
              Download
            </Button>
          ) : undefined
        }
      >
        {detailBusy && <EmptyState description="Loading process flow..." />}
        {!detailBusy && !selected && <EmptyState description="Select a process flow to view its details." />}
        {!detailBusy && selected && (
          <dl>
            <DetailRow label="ID">{selected.id}</DetailRow>
            <DetailRow label="Reference">{selected.flowReference}</DetailRow>
            <DetailRow label="Process flow name">{selected.processFlowName}</DetailRow>
            <DetailRow label="Department">{departmentLookup.get(String(selected.departmentId)) ?? selected.departmentId}</DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={selected.workflowStatus} />
            </DetailRow>
            <DetailRow label="Valid from">{formatDate(selected.validFromDate)}</DetailRow>
            <DetailRow label="Valid to">{formatDate(selected.validToDate)}</DetailRow>
            <DetailRow label="Description">{selected.description || 'Not provided'}</DetailRow>
            <DetailRow label="Document">{selected.originalFileName ?? 'No document uploaded'}</DetailRow>
            <DetailRow label="Content type">{selected.contentType ?? 'Unknown'}</DetailRow>
            <DetailRow label="File size">{typeof selected.fileSize === 'number' ? `${selected.fileSize} bytes` : 'Unknown'}</DetailRow>
            <DetailRow label="Inputter">{selected.inputterUsername ?? 'Unknown'}</DetailRow>
            <DetailRow label="Authorizer">{selected.authorizerUsername ?? 'Not assigned'}</DetailRow>
            <DetailRow label="Created by">{selected.createdBy ?? 'Unknown'}</DetailRow>
            <DetailRow label="Created at">{selected.createdAt ? formatDateTime(selected.createdAt) : 'Unknown'}</DetailRow>
            <DetailRow label="Updated by">{selected.updatedBy ?? 'Unknown'}</DetailRow>
            <DetailRow label="Updated at">{selected.updatedAt ? formatDateTime(selected.updatedAt) : 'Unknown'}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <ProcessFlowForm
        open={formOpen}
        mode={formMode}
        departments={departments}
        initialValues={selected}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <ActionPrompt
        open={Boolean(actionConfig && actionRecord)}
        action={actionConfig}
        record={actionRecord}
        busy={actionBusy}
        error={actionError}
        onClose={() => {
          if (actionBusy) return;
          setActionConfig(null);
          setActionRecord(null);
          setActionError(null);
        }}
        onConfirm={runAction}
      />

      <SuccessModal
        open={Boolean(savedMessage)}
        title="Process flow action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title={deleteTarget ? `Delete ${deleteTarget.flowReference}?` : 'Delete process flow?'}
        description={
          deleteTarget
            ? `This will permanently delete ${deleteTarget.processFlowName}. This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete process flow"
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
