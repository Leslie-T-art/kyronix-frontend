import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DownloadIcon,
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
import { DataTable, type Column, type ExportColumn } from '../components/shared/DataTable';
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
  listOltsConfigurationItems,
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
import type { Branch, Department, OltsConfigurationItem, OltsIncident, OltsIncidentPayload } from '../types';

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

const OLTS_EXPORT_COLUMNS: ExportColumn<OltsIncident>[] = [
  { key: 'id', header: 'id', value: (row) => row.id },
  { key: 'eventId', header: 'eventId', value: (row) => row.eventId },
  { key: 'eventTitle', header: 'eventTitle', value: (row) => row.eventTitle },
  { key: 'eventStatusId', header: 'eventStatusId', value: (row) => row.eventStatusId },
  { key: 'incidentDate', header: 'incidentDate', value: (row) => row.incidentDate },
  { key: 'incidentEndDate', header: 'incidentEndDate', value: (row) => row.incidentEndDate },
  { key: 'detectionDate', header: 'detectionDate', value: (row) => row.detectionDate },
  { key: 'departmentId', header: 'departmentId', value: (row) => row.departmentId },
  { key: 'departmentName', header: 'departmentName', value: (row) => row.departmentName },
  { key: 'branchId', header: 'branchId', value: (row) => row.branchId },
  { key: 'branchName', header: 'branchName', value: (row) => row.branchName },
  { key: 'processName', header: 'processName', value: (row) => row.processName },
  { key: 'productService', header: 'productService', value: (row) => row.productService },
  { key: 'baselEventCategoryId', header: 'baselEventCategoryId', value: (row) => row.baselEventCategoryId },
  { key: 'eventDescription', header: 'eventDescription', value: (row) => row.eventDescription },
  { key: 'immediateActionTaken', header: 'immediateActionTaken', value: (row) => row.immediateActionTaken },
  { key: 'rootCauseCategoryId', header: 'rootCauseCategoryId', value: (row) => row.rootCauseCategoryId },
  { key: 'rootCauseDescription', header: 'rootCauseDescription', value: (row) => row.rootCauseDescription },
  { key: 'controlId', header: 'controlId', value: (row) => row.controlId },
  { key: 'failedMissingControl', header: 'failedMissingControl', value: (row) => row.failedMissingControl },
  { key: 'currencyId', header: 'currencyId', value: (row) => row.currencyId },
  { key: 'grossLoss', header: 'grossLoss', value: (row) => row.grossLoss },
  {
    key: 'restitutionRemediationCost',
    header: 'restitutionRemediationCost',
    value: (row) => row.restitutionRemediationCost
  },
  { key: 'recoveryMethodId', header: 'recoveryMethodId', value: (row) => row.recoveryMethodId },
  { key: 'netLoss', header: 'netLoss', value: (row) => row.netLoss },
  { key: 'accountingGlReference', header: 'accountingGlReference', value: (row) => row.accountingGlReference },
  { key: 'dataSourceId', header: 'dataSourceId', value: (row) => row.dataSourceId },
  { key: 'nonFinancialImpactType', header: 'nonFinancialImpactType', value: (row) => row.nonFinancialImpactType },
  { key: 'nonFinancialImpactDetails', header: 'nonFinancialImpactDetails', value: (row) => row.nonFinancialImpactDetails },
  { key: 'overallEventSeverity', header: 'overallEventSeverity', value: (row) => row.overallEventSeverity },
  { key: 'correctiveAction', header: 'correctiveAction', value: (row) => row.correctiveAction },
  { key: 'actionOwner', header: 'actionOwner', value: (row) => row.actionOwner },
  { key: 'actionTargetDate', header: 'actionTargetDate', value: (row) => row.actionTargetDate },
  { key: 'actionStatusId', header: 'actionStatusId', value: (row) => row.actionStatusId },
  {
    key: 'preventiveControlImplemented',
    header: 'preventiveControlImplemented',
    value: (row) => row.preventiveControlImplemented
  },
  { key: 'validationEvidence', header: 'validationEvidence', value: (row) => row.validationEvidence },
  { key: 'closureValidationDate', header: 'closureValidationDate', value: (row) => row.closureValidationDate },
  { key: 'closureComment', header: 'closureComment', value: (row) => row.closureComment },
  { key: 'authorizationStatus', header: 'authorizationStatus', value: (row) => row.authorizationStatus },
  { key: 'status', header: 'status', value: (row) => row.status },
  { key: 'eventOwner', header: 'eventOwner', value: (row) => row.eventOwner },
  { key: 'reportedBy', header: 'reportedBy', value: (row) => row.reportedBy },
  { key: 'createdAt', header: 'createdAt', value: (row) => row.createdAt },
  { key: 'createdBy', header: 'createdBy', value: (row) => row.createdBy },
  { key: 'lastUpdatedBy', header: 'lastUpdatedBy', value: (row) => row.lastUpdatedBy },
  { key: 'lastUpdatedAt', header: 'lastUpdatedAt', value: (row) => row.lastUpdatedAt },
  { key: 'recordVersion', header: 'recordVersion', value: (row) => row.recordVersion }
];

function downloadOltsIncidentCsv(rows: OltsIncident[], filename: string) {
  const header = OLTS_EXPORT_COLUMNS.map((column) => column.header).join(',');
  const body = rows
    .map((row) =>
      OLTS_EXPORT_COLUMNS.map((column) => `"${String(column.value(row) ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatBoolean(value: boolean) {
  return value ? 'true' : 'false';
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
  }, [open, action?.key, incident?.eventId]);

  if (!open || !action || !incident) return null;

  return (
    <DetailDrawer
      open={open}
      title={action.label}
      subtitle={incident.eventId}
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
  const [eventStatuses, setEventStatuses] = useState<OltsConfigurationItem[]>([]);
  const [baselEventCategories, setBaselEventCategories] = useState<OltsConfigurationItem[]>([]);
  const [rootCauses, setRootCauses] = useState<OltsConfigurationItem[]>([]);
  const [controls, setControls] = useState<OltsConfigurationItem[]>([]);
  const [currencies, setCurrencies] = useState<OltsConfigurationItem[]>([]);
  const [recoveryMethods, setRecoveryMethods] = useState<OltsConfigurationItem[]>([]);
  const [dataSources, setDataSources] = useState<OltsConfigurationItem[]>([]);
  const [actionStatuses, setActionStatuses] = useState<OltsConfigurationItem[]>([]);
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
  const isDepartmentScoped = user ? shouldRestrictOltsToDepartment(user.backendRoles) : false;
  const canApprove = Boolean(user?.backendRoles.includes('HEAD') || user?.backendRoles.includes('DEPARTMENT_HEAD'));

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
    const [
      branchesResponse,
      departmentsResponse,
      eventStatusesResponse,
      baselEventCategoriesResponse,
      rootCausesResponse,
      controlsResponse,
      currenciesResponse,
      recoveryMethodsResponse,
      dataSourcesResponse,
      actionStatusesResponse
    ] = await Promise.all([
      listBranches(accessToken),
      listDepartments(accessToken),
      listOltsConfigurationItems(accessToken, 'event-statuses'),
      listOltsConfigurationItems(accessToken, 'basel-event-categories'),
      listOltsConfigurationItems(accessToken, 'root-causes'),
      listOltsConfigurationItems(accessToken, 'controls'),
      listOltsConfigurationItems(accessToken, 'currencies'),
      listOltsConfigurationItems(accessToken, 'recovery-methods'),
      listOltsConfigurationItems(accessToken, 'data-sources'),
      listOltsConfigurationItems(accessToken, 'action-statuses')
    ]);

    if (
      branchesResponse.error?.code === 'UNAUTHORIZED' ||
      departmentsResponse.error?.code === 'UNAUTHORIZED' ||
      eventStatusesResponse.error?.code === 'UNAUTHORIZED' ||
      baselEventCategoriesResponse.error?.code === 'UNAUTHORIZED' ||
      rootCausesResponse.error?.code === 'UNAUTHORIZED' ||
      controlsResponse.error?.code === 'UNAUTHORIZED' ||
      currenciesResponse.error?.code === 'UNAUTHORIZED' ||
      recoveryMethodsResponse.error?.code === 'UNAUTHORIZED' ||
      dataSourcesResponse.error?.code === 'UNAUTHORIZED' ||
      actionStatusesResponse.error?.code === 'UNAUTHORIZED'
    ) {
      signOut();
      return;
    }

    if (branchesResponse.data) setBranches(branchesResponse.data);
    if (departmentsResponse.data) setDepartments(departmentsResponse.data);
    if (eventStatusesResponse.data) setEventStatuses(eventStatusesResponse.data);
    if (baselEventCategoriesResponse.data) setBaselEventCategories(baselEventCategoriesResponse.data);
    if (rootCausesResponse.data) setRootCauses(rootCausesResponse.data);
    if (controlsResponse.data) setControls(controlsResponse.data);
    if (currenciesResponse.data) setCurrencies(currenciesResponse.data);
    if (recoveryMethodsResponse.data) setRecoveryMethods(recoveryMethodsResponse.data);
    if (dataSourcesResponse.data) setDataSources(dataSourcesResponse.data);
    if (actionStatusesResponse.data) setActionStatuses(actionStatusesResponse.data);
  }, [accessToken, signOut]);

  useEffect(() => {
    void loadIncidents();
    void loadReferenceData();
  }, [loadIncidents, loadReferenceData]);

  async function loadIncidentDetail(eventId: string, openDrawer = true): Promise<OltsIncident | null> {
    if (!accessToken) return null;
    setDetailBusy(true);
    setDetailError(null);
    if (openDrawer) setDetailOpen(true);

    const response = await getOltsIncident(accessToken, eventId);
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
    setSavedMessage(`Incident ${response.data.eventId} created successfully.`);
    await loadIncidents();
  }

  async function handleUpdate(payload: OltsIncidentPayload) {
    if (!accessToken || !formIncident) return;
    setFormBusy(true);
    setFormError(null);
    const response = await updateOltsIncident(accessToken, formIncident.eventId, payload);
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
    setSavedMessage(`Incident ${response.data.eventId} updated successfully.`);
    await loadIncidents();
    if (detailOpen) {
      await loadIncidentDetail(formIncident.eventId, false);
    }
  }

  async function beginEdit(incident: OltsIncident) {
    const detail = await loadIncidentDetail(incident.eventId, false);
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
      response = await deleteOltsIncident(accessToken, actionIncident.eventId);
    } else {
      response = await requester[actionConfig.key](accessToken, actionIncident.eventId, payload);
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
    setSavedMessage(`${actionConfig.label} completed for ${actionIncident.eventId}.`);
    await loadIncidents();
    if (detailOpen) {
      await loadIncidentDetail(actionIncident.eventId, false);
    }
  }

  const columns = useMemo(() => {
    const base: Column<OltsIncident>[] = [
      {
        key: 'eventId',
        header: 'Incident',
        value: (row) => row.eventId,
        render: (row) => <span className="font-medium text-navy">{row.eventId}</span>
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
        key: 'overallEventSeverity',
        header: 'Severity',
        filterable: true,
        value: (row) => row.overallEventSeverity,
        render: (row) => <StatusBadge status={row.overallEventSeverity} />
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
        render: (row) => formatCurrency(row.grossLoss)
      },
      {
        key: 'incidentDate',
        header: 'Incident date',
        value: (row) => row.incidentDate,
        render: (row) => formatDate(row.incidentDate)
      },
      {
        key: 'actionOwner',
        header: 'Action owner',
        value: (row) => row.actionOwner
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
            ariaLabel={`Actions for ${row.eventId}`}
            actions={[
              {
                key: 'view',
                label: 'View incident',
                icon: EyeIcon,
                onClick: () => {
                  void loadIncidentDetail(row.eventId);
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
              ...ACTIONS.filter((action) => action.key !== 'approve' || canApprove).map<RowActionItem>((action) => ({
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
  }, [canApprove, canSeeActions, openMenuId]);

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
          onRowClick={(row) => void loadIncidentDetail(row.eventId)}
          searchPlaceholder="Search incident, branch, department, event title"
          exportName="olts-incidents"
          exportColumns={OLTS_EXPORT_COLUMNS}
          pageSize={10}
        />
      )}

      <OltsIncidentForm
        open={formOpen}
        mode={formMode}
        initialValues={formIncident}
        branches={branches}
        departments={departments}
        eventStatuses={eventStatuses}
        baselEventCategories={baselEventCategories}
        rootCauses={rootCauses}
        controls={controls}
        currencies={currencies}
        recoveryMethods={recoveryMethods}
        dataSources={dataSources}
        actionStatuses={actionStatuses}
        defaultBranchId={user?.branchId}
        defaultDepartmentId={user?.departmentId}
        isSubmitting={formBusy}
        submitError={formError}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => (formMode === 'create' ? handleCreate(payload) : handleUpdate(payload))}
      />

      <DetailDrawer
        open={detailOpen}
        title={selectedIncident?.eventId ?? 'Incident detail'}
        subtitle="Incident details"
        onClose={() => setDetailOpen(false)}
        headerActions={
          selectedIncident ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadOltsIncidentCsv([selectedIncident], `olts-incident-${selectedIncident.eventId}.csv`)}
              type="button"
            >
              <DownloadIcon className="h-3.5 w-3.5" />
              Export
            </Button>
          ) : null
        }
        width="lg"
      >
        {detailBusy && <LoadingState rows={4} />}
        {!detailBusy && detailError && (
          <ErrorState
            title="Unable to load incident"
            description={detailError.message}
            correlationId={detailError.correlationId}
            onRetry={() => selectedIncident && void loadIncidentDetail(selectedIncident.eventId)}
          />
        )}
        {!detailBusy && !detailError && !selectedIncident && (
          <EmptyState description="Select an incident to load its details." />
        )}
        {!detailBusy && !detailError && selectedIncident && (
          <dl>
            <DetailRow label="ID">{selectedIncident.id}</DetailRow>
            <DetailRow label="Incident ID">{selectedIncident.eventId}</DetailRow>
            <DetailRow label="Event title">{selectedIncident.eventTitle}</DetailRow>
            <DetailRow label="Event status ID">{selectedIncident.eventStatusId}</DetailRow>
            <DetailRow label="Incident date">{formatDate(selectedIncident.incidentDate)}</DetailRow>
            <DetailRow label="Incident end date">{formatDate(selectedIncident.incidentEndDate)}</DetailRow>
            <DetailRow label="Detection date">{formatDate(selectedIncident.detectionDate)}</DetailRow>
            <DetailRow label="Department ID">{selectedIncident.departmentId}</DetailRow>
            <DetailRow label="Branch">{selectedIncident.branchName ?? selectedIncident.branchId}</DetailRow>
            <DetailRow label="Branch ID">{selectedIncident.branchId}</DetailRow>
            <DetailRow label="Department">{selectedIncident.departmentName ?? selectedIncident.departmentId}</DetailRow>
            <DetailRow label="Process name">{selectedIncident.processName}</DetailRow>
            <DetailRow label="Product / service">{selectedIncident.productService}</DetailRow>
            <DetailRow label="Basel event category ID">{selectedIncident.baselEventCategoryId}</DetailRow>
            <DetailRow label="Event description">{selectedIncident.eventDescription}</DetailRow>
            <DetailRow label="Immediate action taken">{selectedIncident.immediateActionTaken}</DetailRow>
            <DetailRow label="Root cause category ID">{selectedIncident.rootCauseCategoryId}</DetailRow>
            <DetailRow label="Root cause description">{selectedIncident.rootCauseDescription}</DetailRow>
            <DetailRow label="Control ID">{selectedIncident.controlId}</DetailRow>
            <DetailRow label="Failed / missing control">{formatBoolean(selectedIncident.failedMissingControl)}</DetailRow>
            <DetailRow label="Currency ID">{selectedIncident.currencyId}</DetailRow>
            <DetailRow label="Severity">
              <StatusBadge status={selectedIncident.overallEventSeverity} />
            </DetailRow>
            <DetailRow label="Status">
              <StatusBadge status={selectedIncident.status} />
            </DetailRow>
            <DetailRow label="Authorization">
              <StatusBadge status={selectedIncident.authorizationStatus} />
            </DetailRow>
            <DetailRow label="Gross loss">{formatCurrency(selectedIncident.grossLoss)}</DetailRow>
            <DetailRow label="Restitution / remediation">{formatCurrency(selectedIncident.restitutionRemediationCost)}</DetailRow>
            <DetailRow label="Recovery method ID">{selectedIncident.recoveryMethodId}</DetailRow>
            <DetailRow label="Net loss">{formatCurrency(selectedIncident.netLoss)}</DetailRow>
            <DetailRow label="Accounting GL reference">{selectedIncident.accountingGlReference}</DetailRow>
            <DetailRow label="Data source ID">{selectedIncident.dataSourceId}</DetailRow>
            <DetailRow label="Non-financial impact type">{selectedIncident.nonFinancialImpactType}</DetailRow>
            <DetailRow label="Non-financial impact details">{selectedIncident.nonFinancialImpactDetails}</DetailRow>
            <DetailRow label="Action status ID">{selectedIncident.actionStatusId}</DetailRow>
            <DetailRow label="Action owner">{selectedIncident.actionOwner}</DetailRow>
            <DetailRow label="Action target date">{formatDate(selectedIncident.actionTargetDate)}</DetailRow>
            <DetailRow label="Preventive control implemented">{formatBoolean(selectedIncident.preventiveControlImplemented)}</DetailRow>
            <DetailRow label="Validation evidence">{selectedIncident.validationEvidence}</DetailRow>
            <DetailRow label="Closure validation date">{formatDate(selectedIncident.closureValidationDate)}</DetailRow>
            <DetailRow label="Closure comment">{selectedIncident.closureComment}</DetailRow>
            <DetailRow label="Reported by">{selectedIncident.reportedBy}</DetailRow>
            <DetailRow label="Event owner">{selectedIncident.eventOwner}</DetailRow>
            <DetailRow label="Created by">{selectedIncident.createdBy}</DetailRow>
            <DetailRow label="Created at">{formatDateTime(selectedIncident.createdAt)}</DetailRow>
            <DetailRow label="Last updated by">{selectedIncident.lastUpdatedBy}</DetailRow>
            <DetailRow label="Last updated at">{formatDateTime(selectedIncident.lastUpdatedAt)}</DetailRow>
            <DetailRow label="Record version">{selectedIncident.recordVersion}</DetailRow>
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
