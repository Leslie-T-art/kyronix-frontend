import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EyeIcon,
  Loader2Icon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  Trash2Icon,
  Undo2Icon,
  XCircleIcon
} from 'lucide-react';
import { OltsIncidentForm } from '../components/forms/OltsIncidentForm';
import { AlertBanner } from '../components/shared/AlertBanner';
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
import { Field, TextArea } from '../components/ui/Field';
import { useAuth } from '../contexts/AuthContext';
import {
  approveOltsIncident,
  createOltsIncident,
  deleteOltsIncident,
  getOltsIncident,
  listBranches,
  listDepartments,
  listEventTypes,
  listLossCategories,
  listOltsIncidents,
  rejectOltsIncident,
  returnOltsIncidentForCorrection,
  startOltsAuthorization,
  submitOltsIncident,
  updateOltsIncident,
  type WorkflowReasonPayload
} from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';
import { formatCurrency, formatDate, formatDateTime } from '../utils/cn';
import type { Branch, Department, EventType, LossCategory, OltsIncident, OltsIncidentPayload } from '../types';

type WorkflowActionKey =
  | 'submit'
  | 'start-authorization'
  | 'return'
  | 'reject'
  | 'approve'
  | 'delete';

interface ActionConfig {
  key: WorkflowActionKey;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  tone?: 'danger' | 'default';
  needsReason?: boolean;
  description: string;
}

const ACTIONS: ActionConfig[] = [
  {
    key: 'submit',
    label: 'Submit incident',
    icon: PlayIcon,
    needsReason: true,
    description: 'Submit the draft incident for workflow processing.'
  },
  {
    key: 'start-authorization',
    label: 'Start authorization',
    icon: ShieldCheckIcon,
    needsReason: true,
    description: 'Begin authorization on the selected incident.'
  },
  {
    key: 'return',
    label: 'Return for correction',
    icon: Undo2Icon,
    needsReason: true,
    description: 'Send the incident back for amendment with a reason.'
  },
  {
    key: 'reject',
    label: 'Reject incident',
    icon: XCircleIcon,
    tone: 'danger',
    needsReason: true,
    description: 'Reject the selected incident with an audit reason.'
  },
  {
    key: 'approve',
    label: 'Approve incident',
    icon: ShieldCheckIcon,
    needsReason: true,
    description: 'Approve the incident in the authorization workflow.'
  },
  {
    key: 'delete',
    label: 'Delete incident',
    icon: Trash2Icon,
    tone: 'danger',
    description: 'Remove the incident permanently.'
  }
];

function canManageOltsActions(backendRoles: string[]): boolean {
  return (
    backendRoles.includes('HEAD') ||
    backendRoles.includes('DEPARTMENT_HEAD') ||
    backendRoles.includes('SYSTEM_ADMIN') ||
    backendRoles.includes('ADMIN')
  );
}

function shouldRestrictOltsToDepartment(backendRoles: string[]): boolean {
  return backendRoles.includes('INPUTTER') || backendRoles.includes('DEPARTMENT_HEAD');
}

function ActionPrompt({
  open,
  action,
  incident,
  busy,
  error,
  onClose,
  onConfirm
}: {
  open: boolean;
  action: ActionConfig | null;
  incident: OltsIncident | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (payload: WorkflowReasonPayload) => Promise<void>;
}) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason('');
  }, [open, action?.key, incident?.id]);

  if (!open || !action || !incident) return null;

  return (
    <DetailDrawer
      open={open}
      title={action.label}
      subtitle={incident.incidentId}
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
            onClick={() => void onConfirm({ reason })}
            disabled={busy || (action.needsReason && reason.trim() === '')}
            type="button"
          >
            {busy ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : null}
            Confirm
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-zinc-600">{action.description}</p>
      {action.needsReason && (
        <Field label="Reason" htmlFor="workflow-reason" required>
          <TextArea
            id="workflow-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Provide the workflow reason"
          />
        </Field>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}
      {!action.needsReason && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          This action cannot be undone.
        </div>
      )}
    </DetailDrawer>
  );
}

export function Olts() {
  const { user, accessToken, signOut } = useAuth();
  const [rows, setRows] = useState<OltsIncident[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [lossCategories, setLossCategories] = useState<LossCategory[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formIncident, setFormIncident] = useState<OltsIncident | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<OltsIncident | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailBusy, setDetailBusy] = useState(false);
  const [detailError, setDetailError] = useState<ApiError | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionIncident, setActionIncident] = useState<OltsIncident | null>(null);
  const [actionConfig, setActionConfig] = useState<ActionConfig | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const canSeeActions = user ? canManageOltsActions(user.backendRoles) : false;
  const hasAdminOltsParity = user ? canManageOltsActions(user.backendRoles) : false;
  const isDepartmentScoped = user ? shouldRestrictOltsToDepartment(user.backendRoles) : false;

  function handleApiError(nextError: ApiError | null) {
    if (nextError?.code === 'UNAUTHORIZED') {
      signOut();
      return;
    }
    setError(nextError);
  }

  const loadIncidents = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const response = await listOltsIncidents(accessToken);
    setRows(response.data ?? []);
    handleApiError(response.error);
    setIsLoading(false);
  }, [accessToken, signOut]);

  const loadReferenceData = useCallback(async () => {
    if (!accessToken) return;
    const [branchesResponse, departmentsResponse, lossCategoriesResponse, eventTypesResponse] = await Promise.all([
      listBranches(accessToken),
      listDepartments(accessToken),
      listLossCategories(accessToken),
      listEventTypes(accessToken)
    ]);

    if (
      branchesResponse.error?.code === 'UNAUTHORIZED' ||
      departmentsResponse.error?.code === 'UNAUTHORIZED' ||
      lossCategoriesResponse.error?.code === 'UNAUTHORIZED' ||
      eventTypesResponse.error?.code === 'UNAUTHORIZED'
    ) {
      signOut();
      return;
    }

    if (branchesResponse.data) setBranches(branchesResponse.data);
    if (departmentsResponse.data) setDepartments(departmentsResponse.data);
    if (lossCategoriesResponse.data) setLossCategories(lossCategoriesResponse.data);
    if (eventTypesResponse.data) setEventTypes(eventTypesResponse.data.filter((eventType) => eventType.active));
  }, [accessToken, signOut]);

  useEffect(() => {
    void loadIncidents();
    void loadReferenceData();
  }, [loadIncidents, loadReferenceData]);

  async function loadIncidentDetail(incidentId: string, openDrawer = true): Promise<OltsIncident | null> {
    if (!accessToken) return null;
    setDetailBusy(true);
    setDetailError(null);
    if (openDrawer) setDetailOpen(true);

    const response = await getOltsIncident(accessToken, incidentId);
    setDetailBusy(false);
    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return null;
      }
      setDetailError(response.error);
      return null;
    }

    setSelectedIncident(response.data);
    return response.data;
  }

  async function handleCreate(payload: OltsIncidentPayload) {
    if (!accessToken) return;
    setFormBusy(true);
    setFormError(null);
    const response = await createOltsIncident(accessToken, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setFormError(response.error?.message ?? 'Unable to create incident.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Incident ${response.data.incidentId} created successfully.`);
    await loadIncidents();
  }

  async function handleUpdate(payload: OltsIncidentPayload) {
    if (!accessToken || !formIncident) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateOltsIncident(accessToken, formIncident.incidentId, payload);
    setFormBusy(false);

    if (response.error || !response.data) {
      if (response.error?.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setFormError(response.error?.message ?? 'Unable to update incident.');
      return;
    }

    setFormOpen(false);
    setSavedMessage(`Incident ${response.data.incidentId} updated successfully.`);
    await loadIncidents();
    if (detailOpen) {
      await loadIncidentDetail(formIncident.incidentId, false);
    }
  }

  async function beginEdit(incident: OltsIncident) {
    const detail = await loadIncidentDetail(incident.incidentId, false);
    setFormIncident(detail ?? incident);
    setFormMode('edit');
    setFormError(null);
    setFormOpen(true);
  }

  async function runAction(payload: WorkflowReasonPayload) {
    if (!accessToken || !actionConfig || !actionIncident) return;
    setActionBusy(true);
    setActionError(null);

    const requester = {
      submit: submitOltsIncident,
      'start-authorization': startOltsAuthorization,
      return: returnOltsIncidentForCorrection,
      reject: rejectOltsIncident,
      approve: approveOltsIncident
    } as const;

    let response;
    if (actionConfig.key === 'delete') {
      response = await deleteOltsIncident(accessToken, actionIncident.incidentId);
    } else {
      response = await requester[actionConfig.key](accessToken, actionIncident.incidentId, payload);
    }

    setActionBusy(false);
    if (response.error) {
      if (response.error.code === 'UNAUTHORIZED') {
        signOut();
        return;
      }
      setActionError(response.error.message);
      setError(response.error);
      return;
    }

    setActionError(null);
    setActionConfig(null);
    setActionIncident(null);
    setOpenMenuId(null);
    setSavedMessage(`${actionConfig.label} completed for ${actionIncident.incidentId}.`);
    await loadIncidents();
    if (detailOpen) {
      await loadIncidentDetail(actionIncident.incidentId, false);
    }
  }

  const columns = useMemo(() => {
    const base: Column<OltsIncident>[] = [
      {
        key: 'incidentId',
        header: 'Incident',
        value: (row) => row.incidentId,
        render: (row) => <span className="font-medium text-navy">{row.incidentId}</span>
      },
      {
        key: 'branchId',
        header: 'Branch',
        value: (row) => row.branchName ?? row.branchId,
        render: (row) => <span className="block max-w-[180px] truncate">{row.branchName ?? row.branchId}</span>
      },
      {
        key: 'departmentId',
        header: 'Department',
        value: (row) => row.departmentName ?? row.departmentId,
        render: (row) => <span className="block max-w-[180px] truncate">{row.departmentName ?? row.departmentId}</span>
      },
      {
        key: 'severity',
        header: 'Severity',
        filterable: true,
        value: (row) => row.severity,
        render: (row) => <StatusBadge status={row.severity} />
      },
      {
        key: 'status',
        header: 'Status',
        filterable: true,
        value: (row) => row.status,
        render: (row) => <StatusBadge status={row.status} />
      },
      {
        key: 'authorizationStatus',
        header: 'Authorization',
        filterable: true,
        value: (row) => row.authorizationStatus,
        render: (row) => <StatusBadge status={row.authorizationStatus} />
      },
      {
        key: 'grossLoss',
        header: 'Gross loss',
        align: 'right',
        value: (row) => row.grossLoss,
        render: (row) => formatCurrency(row.grossLoss, row.currencyCode ?? 'USD')
      },
      {
        key: 'incidentDate',
        header: 'Incident date',
        value: (row) => row.incidentDate,
        render: (row) => formatDate(row.incidentDate)
      },
      {
        key: 'responsiblePersonName',
        header: 'Responsible',
        value: (row) => row.responsiblePersonName
      }
    ];

    if (!canSeeActions) return base;

    return [
      ...base,
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        value: () => 'Actions',
        render: (row) => (
          <RowActionsMenu
            open={openMenuId === row.id}
            onToggle={() => setOpenMenuId((current) => (current === row.id ? null : row.id))}
            ariaLabel={`Actions for ${row.incidentId}`}
            actions={[
              {
                key: 'view',
                label: 'View incident',
                icon: EyeIcon,
                onClick: () => {
                  void loadIncidentDetail(row.incidentId);
                  setOpenMenuId(null);
                }
              },
              {
                key: 'edit',
                label: 'Update incident',
                icon: PencilIcon,
                onClick: () => {
                  void beginEdit(row);
                  setOpenMenuId(null);
                }
              },
              ...ACTIONS.map<RowActionItem>((action) => ({
                key: action.key,
                label: action.label,
                icon: action.icon,
                tone: action.tone === 'danger' ? 'danger' : 'default',
                onClick: () => {
                  setActionConfig(action);
                  setActionIncident(row);
                  setOpenMenuId(null);
                }
              }))
            ]}
          />
        )
      }
    ];
  }, [canSeeActions, openMenuId]);

  const visibleRows = useMemo(() => {
    if (!user) return rows;
    if (!isDepartmentScoped || !user.departmentId) return rows;
    return rows.filter((row) => row.departmentId === user.departmentId);
  }, [isDepartmentScoped, rows, user]);

  const draftCount = visibleRows.filter((row) => row.status === 'DRAFT').length;
  const pendingCount = visibleRows.filter((row) => row.authorizationStatus !== 'DRAFT').length;
  const exposure = visibleRows.reduce((total, row) => total + row.netLoss, 0);

  return (
    <>
      <PageBanner
        title="OLTS"
        subtitle="Operational loss incidents loaded from the live OLTS service"
        breadcrumb={['Kyronix', 'OLTS']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadIncidents()}>
              <RefreshCwIcon className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <RoleGate allow={['Admin', 'Head', 'RiskManager', 'ProcessOwner', 'Inputter']}>
              <Button
                variant="accent"
                size="sm"
                onClick={() => {
                  setFormMode('create');
                  setFormIncident(null);
                  setFormError(null);
                  setFormOpen(true);
                }}
              >
                <PlusIcon className="h-3.5 w-3.5" />
                Create incident
              </Button>
            </RoleGate>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard label="Draft incidents" value={String(draftCount)} tone="warning" delta={0} />
        <StatCard label="In workflow" value={String(pendingCount)} tone="info" delta={0} />
        <StatCard label="Net exposure" value={formatCurrency(exposure)} tone="neutral" delta={0} />
      </div>

      {!accessToken && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No access token is available. Sign in again to use the OLTS APIs.
        </div>
      )}

      {accessToken && (
        <DataTable
          columns={columns}
          rows={visibleRows}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          error={error}
          onRetry={() => void loadIncidents()}
          onRowClick={(row) => void loadIncidentDetail(row.incidentId)}
          searchPlaceholder="Search incident, branch, department, responsible person"
          exportName="olts-incidents"
          pageSize={10}
        />
      )}

      <OltsIncidentForm
        open={formOpen}
        mode={formMode}
        initialValues={formIncident}
        isSystemAdmin={hasAdminOltsParity}
        branches={branches}
        departments={departments}
        lossCategories={lossCategories}
        eventTypes={eventTypes}
        currentBranch={user?.branchId ? { id: user.branchId, code: user.branchCode ?? user.branchId, name: user.branchName ?? user.branchId } : null}
        currentDepartment={
          user?.departmentId
            ? { id: user.departmentId, code: user.departmentCode ?? user.departmentId, name: user.departmentName ?? user.departmentId }
            : null
        }
        defaultBranchId={user?.branchId}
        defaultDepartmentId={user?.departmentId}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <DetailDrawer
        open={detailOpen}
        title={selectedIncident?.incidentId ?? 'Incident detail'}
        subtitle="Incident details"
        onClose={() => setDetailOpen(false)}
        width="lg"
      >
        {detailBusy && <LoadingState rows={4} />}
        {!detailBusy && detailError && (
          <ErrorState
            title="Unable to load incident"
            description={detailError.message}
            correlationId={detailError.correlationId}
            onRetry={() => selectedIncident && void loadIncidentDetail(selectedIncident.id)}
          />
        )}
        {!detailBusy && !detailError && !selectedIncident && (
          <EmptyState description="Select an incident to load its details." />
        )}
        {!detailBusy && !detailError && selectedIncident && (
          <dl>
            <DetailRow label="Incident ID">{selectedIncident.incidentId}</DetailRow>
            <DetailRow label="Incident date">{formatDate(selectedIncident.incidentDate)}</DetailRow>
            <DetailRow label="Discovery date">{formatDate(selectedIncident.discoveryDate)}</DetailRow>
            <DetailRow label="Branch">{selectedIncident.branchName ?? selectedIncident.branchId}</DetailRow>
            <DetailRow label="Department">{selectedIncident.departmentName ?? selectedIncident.departmentId}</DetailRow>
            <DetailRow label="Severity">
              <StatusBadge status={selectedIncident.severity} />
            </DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={selectedIncident.status} />
            </DetailRow>
            <DetailRow label="Authorization">
              <StatusBadge status={selectedIncident.authorizationStatus} />
            </DetailRow>
            <DetailRow label="Gross loss">{formatCurrency(selectedIncident.grossLoss, selectedIncident.currencyCode ?? 'USD')}</DetailRow>
            <DetailRow label="Recoveries">{formatCurrency(selectedIncident.recoveries, selectedIncident.currencyCode ?? 'USD')}</DetailRow>
            <DetailRow label="Net loss">{formatCurrency(selectedIncident.netLoss, selectedIncident.currencyCode ?? 'USD')}</DetailRow>
            <DetailRow label="Potential loss">{formatCurrency(selectedIncident.potentialLoss, selectedIncident.currencyCode ?? 'USD')}</DetailRow>
            <DetailRow label="Responsible person">{selectedIncident.responsiblePersonName}</DetailRow>
            <DetailRow label="Inputter user">{selectedIncident.inputterUserId}</DetailRow>
            <DetailRow label="Created by">{selectedIncident.createdBy}</DetailRow>
            <DetailRow label="Created at">{formatDateTime(selectedIncident.createdAt)}</DetailRow>
          </dl>
        )}
      </DetailDrawer>

      <ActionPrompt
        open={Boolean(actionConfig && actionIncident)}
        action={actionConfig}
        incident={actionIncident}
        busy={actionBusy}
        error={actionError}
        onClose={() => {
          if (actionBusy) return;
          setActionError(null);
          setActionConfig(null);
          setActionIncident(null);
        }}
        onConfirm={runAction}
      />

      <SuccessModal
        open={Boolean(savedMessage)}
        title="OLTS action completed"
        description={savedMessage ?? undefined}
        onClose={() => setSavedMessage(null)}
      />
    </>
  );
}
