import type {
  AdminUserPayload,
  AdminUserRecord,
  AuthAuditEvent,
  Branch,
  BranchPayload,
  Department,
  DepartmentPayload,
  EventType,
  EventTypePayload,
  LossCategory,
  LossCategoryPayload,
  OltsConfigurationItem,
  OltsConfigurationItemPayload,
  InternalNotificationEventPayload,
  KriRecord,
  KriRecordPayload,
  NotificationPage,
  NotificationRecord,
  NotificationUnreadCount,
  OltsIncident,
  OltsIncidentPayload,
  RiskRecord,
  RiskRecordPayload,
  RoleConfig,
  RoleConfigPayload,
  Role
} from '../../types';
import { createApiError, createApiErrorWithMessage, type ApiError } from './errors';
import { resolveBffRoute } from './bffRoutes';
import { ENDPOINTS } from './endpoints';

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  meta: {correlationId: string;durationMs: number;};
}

export interface RequestContext {
  role: Role;
  unit: string;
  actor: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  correlationId: string;
}

interface ProblemDetailPayload {
  title?: string;
  detail?: string;
  status?: number;
  instance?: string;
  errorCode?: string;
  correlationId?: string;
  message?: string;
  success?: boolean;
  fieldErrors?: Record<string, string>;
}

export interface AuthPayload {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  issuedAt: string;
  expiresAt: string;
  userId: string;
  username: string;
  fullName: string;
  departmentId?: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
}

export interface AuthProfileReference {
  id: string;
  code: string;
  name: string;
}

export interface AuthProfileRole {
  code: string;
  name: string;
}

export interface AuthProfilePayload {
  id: string;
  username: string;
  fullName: string;
  active: boolean;
  locked: boolean;
  department?: AuthProfileReference;
  branch?: AuthProfileReference;
  roles: AuthProfileRole[];
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface WorkflowReasonPayload {
  reason: string;
}

/** Server-side audit sink. Every BFF request is written here before it returns. */
export interface RequestLog {
  actor: string;
  role: Role;
  engine: string;
  action: string;
  entityId: string;
  correlationId: string;
  timestamp: string;
}

const requestLog: RequestLog[] = [];
const AUTH_BASE_URL = trimTrailingSlash(import.meta.env.AUTH_BASE_URL);
const OLTS_BASE_URL = trimTrailingSlash(import.meta.env.OLTS_BASE_URL);
const KRI_BASE_URL = trimTrailingSlash(import.meta.env.KRI_BASE_URL);
const NOTIFICATIONS_BASE_URL = trimTrailingSlash(import.meta.env.NOTIFICATIONS_BASE_URL);
const RISK_REGISTER_BASE_URL = trimTrailingSlash(import.meta.env.RISK_REGISTER_BASE_URL);

export function getRequestLog(): RequestLog[] {
  return requestLog;
}

function correlationId(): string {
  return `c-${Math.random().toString(16).slice(2, 8)}`;
}

function trimTrailingSlash(value?: string): string {
  return (value ?? '').replace(/\/+$/, '');
}

function resolveAuthUrl(path: string): string | null {
  if (!AUTH_BASE_URL) return null;
  return `${AUTH_BASE_URL}${path}`;
}

function resolveOltsUrl(path: string): string | null {
  if (!OLTS_BASE_URL) return null;
  return `${OLTS_BASE_URL}${path}`;
}

function resolveKriUrl(path: string): string | null {
  if (!KRI_BASE_URL) return null;
  return `${KRI_BASE_URL}${path}`;
}

function resolveNotificationsUrl(path: string): string | null {
  if (!NOTIFICATIONS_BASE_URL) return null;
  return `${NOTIFICATIONS_BASE_URL}${path}`;
}

function resolveRiskRegisterUrl(path: string): string | null {
  if (!RISK_REGISTER_BASE_URL) return null;
  return `${RISK_REGISTER_BASE_URL}${path}`;
}

function formatFieldErrors(fieldErrors?: Record<string, string>): string | undefined {
  if (!fieldErrors) return undefined;
  const entries = Object.entries(fieldErrors).filter(([, value]) => Boolean(value));
  if (entries.length === 0) return undefined;
  return entries.map(([field, value]) => `${field}: ${value}`).join('\n');
}

function mapStatusToError(
  status: number,
  correlationId: string,
  message?: string,
  fieldErrors?: Record<string, string>
): ApiError {
  if (status === 400) {
    return createApiErrorWithMessage('VALIDATION', correlationId, formatFieldErrors(fieldErrors) ?? message);
  }
  if (status === 401) return createApiErrorWithMessage('UNAUTHORIZED', correlationId, message ?? 'Invalid username or password.');
  if (status === 403) return createApiErrorWithMessage('FORBIDDEN', correlationId, message ?? 'Your role does not grant access to this action.');
  if (status === 404) return createApiErrorWithMessage('NOT_FOUND', correlationId, message);
  return createApiErrorWithMessage('UPSTREAM', correlationId, message ?? 'The authentication service is temporarily unavailable.');
}

async function authRequest<T>(path: string, init: RequestInit): Promise<ApiResponse<T>> {
  return serviceRequest<T>(resolveAuthUrl(path), 'AUTH_BASE_URL is not configured for this environment.', init);
}

async function serviceRequest<T>(
  url: string | null,
  misconfigurationMessage: string,
  init: RequestInit
): Promise<ApiResponse<T>> {
  const started = Date.now();
  const id = correlationId();

  if (!url) {
    return {
      data: null,
      error: {
        code: 'UPSTREAM',
        correlationId: id,
        message: misconfigurationMessage
      },
      meta: { correlationId: id, durationMs: Date.now() - started }
    };
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        accept: '*/*',
        ...(init.headers ?? {})
      }
    });
    const raw = await response.text();
    const payload = raw ? JSON.parse(raw) as Partial<ApiEnvelope<T>> & ProblemDetailPayload : {};
    const correlation = payload.correlationId ?? response.headers.get('x-correlation-id') ?? id;
    const message = payload.detail ?? payload.message ?? payload.title;
    const explicitFailure = payload.success === false;

    if (!response.ok || explicitFailure) {
      return {
        data: null,
        error: mapStatusToError(response.status, correlation, message, payload.fieldErrors),
        meta: { correlationId: correlation, durationMs: Date.now() - started }
      };
    }

    return {
      data: payload.data ?? null,
      error: null,
      meta: { correlationId: correlation, durationMs: Date.now() - started }
    };
  } catch {
    return {
      data: null,
      error: createApiError('UPSTREAM', id),
      meta: { correlationId: id, durationMs: Date.now() - started }
    };
  }
}

/**
 * The single typed gateway used by the whole app. Callers never build URLs,
 * never see upstream hosts and never receive a raw payload — the BFF route
 * resolves the upstream engine, applies role scoping and validates the shape
 * before anything reaches the UI.
 */
export async function apiFetch<T>(
path: string,
context: RequestContext)
: Promise<ApiResponse<T>> {
  const id = correlationId();
  const started = Date.now();

  const route = resolveBffRoute(path);
  if (!route) {
    return {
      data: null,
      error: createApiError('NOT_FOUND', id),
      meta: { correlationId: id, durationMs: Date.now() - started }
    };
  }

  if (!route.roles.includes(context.role)) {
    return {
      data: null,
      error: createApiError('FORBIDDEN', id),
      meta: { correlationId: id, durationMs: Date.now() - started }
    };
  }

  await new Promise((resolve) => setTimeout(resolve, 320));

  requestLog.push({
    actor: context.actor,
    role: context.role,
    engine: route.engine,
    action: 'read',
    entityId: route.engine,
    correlationId: id,
    timestamp: new Date().toISOString()
  });

  try {
    const data = route.handler(context) as T;
    return {
      data,
      error: null,
      meta: { correlationId: id, durationMs: Date.now() - started }
    };
  } catch {
    return {
      data: null,
      error: createApiError('UPSTREAM', id),
      meta: { correlationId: id, durationMs: Date.now() - started }
    };
  }
}

export function authLogin(payload: LoginRequest): Promise<ApiResponse<AuthPayload>> {
  return authRequest<AuthPayload>(ENDPOINTS.auth.login, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function authMe(token: string): Promise<ApiResponse<AuthProfilePayload>> {
  return authRequest<AuthProfilePayload>(ENDPOINTS.auth.me, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function listAuthAuditEvents(token: string): Promise<ApiResponse<AuthAuditEvent[]>> {
  return authServiceRequest<AuthAuditEvent[]>(token, '/auth/audit-events', { method: 'GET' });
}

function authServiceRequest<T>(token: string, path: string, init: RequestInit): Promise<ApiResponse<T>> {
  return serviceRequest<T>(resolveAuthUrl(path), 'AUTH_BASE_URL is not configured for this environment.', {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });
}

export function listDepartments(token: string): Promise<ApiResponse<Department[]>> {
  return authServiceRequest<Department[]>(token, '/admin/departments', { method: 'GET' });
}

export function createDepartment(token: string, payload: DepartmentPayload): Promise<ApiResponse<Department>> {
  return authServiceRequest<Department>(token, '/admin/departments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateDepartment(
  token: string,
  id: string,
  payload: DepartmentPayload
): Promise<ApiResponse<Department>> {
  return authServiceRequest<Department>(token, `/admin/departments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteDepartment(token: string, id: string): Promise<ApiResponse<null>> {
  return authServiceRequest<null>(token, `/admin/departments/${id}`, { method: 'DELETE' });
}

export function listBranches(token: string): Promise<ApiResponse<Branch[]>> {
  return authServiceRequest<Branch[]>(token, '/admin/branches', { method: 'GET' });
}

export function createBranch(token: string, payload: BranchPayload): Promise<ApiResponse<Branch>> {
  return authServiceRequest<Branch>(token, '/admin/branches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateBranch(
  token: string,
  id: string,
  payload: BranchPayload
): Promise<ApiResponse<Branch>> {
  return authServiceRequest<Branch>(token, `/admin/branches/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteBranch(token: string, id: string): Promise<ApiResponse<null>> {
  return authServiceRequest<null>(token, `/admin/branches/${id}`, { method: 'DELETE' });
}

export function listEventTypes(token: string): Promise<ApiResponse<EventType[]>> {
  return authServiceRequest<EventType[]>(token, '/admin/event-types', { method: 'GET' });
}

export function createEventType(token: string, payload: EventTypePayload): Promise<ApiResponse<EventType>> {
  return authServiceRequest<EventType>(token, '/admin/event-types', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateEventType(
  token: string,
  id: string,
  payload: EventTypePayload
): Promise<ApiResponse<EventType>> {
  return authServiceRequest<EventType>(token, `/admin/event-types/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteEventType(token: string, id: string): Promise<ApiResponse<null>> {
  return authServiceRequest<null>(token, `/admin/event-types/${id}`, { method: 'DELETE' });
}

export function listLossCategories(token: string): Promise<ApiResponse<LossCategory[]>> {
  return oltsRequest<LossCategory[]>(token, '/olts/loss-categories', { method: 'GET' });
}

export function getLossCategory(token: string, lossCategoryId: string): Promise<ApiResponse<LossCategory>> {
  return oltsRequest<LossCategory>(token, `/olts/loss-categories/${lossCategoryId}`, { method: 'GET' });
}

export function createLossCategory(token: string, payload: LossCategoryPayload): Promise<ApiResponse<LossCategory>> {
  return oltsRequest<LossCategory>(token, '/olts/loss-categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateLossCategory(
  token: string,
  lossCategoryId: string,
  payload: LossCategoryPayload
): Promise<ApiResponse<LossCategory>> {
  return oltsRequest<LossCategory>(token, `/olts/loss-categories/${lossCategoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteLossCategory(token: string, lossCategoryId: string): Promise<ApiResponse<null>> {
  return oltsRequest<null>(token, `/olts/loss-categories/${lossCategoryId}`, { method: 'DELETE' });
}

function oltsConfigCollectionPath(resource: string): string {
  return `/olts/config/${resource}`;
}

function oltsConfigItemPath(resource: string, id: string | number): string {
  return `${oltsConfigCollectionPath(resource)}/${id}`;
}

export function listOltsConfigurationItems(
  token: string,
  resource: string
): Promise<ApiResponse<OltsConfigurationItem[]>> {
  return oltsRequest<OltsConfigurationItem[]>(token, oltsConfigCollectionPath(resource), { method: 'GET' });
}

export function getOltsConfigurationItem(
  token: string,
  resource: string,
  id: string | number
): Promise<ApiResponse<OltsConfigurationItem>> {
  return oltsRequest<OltsConfigurationItem>(token, oltsConfigItemPath(resource, id), { method: 'GET' });
}

export function createOltsConfigurationItem(
  token: string,
  resource: string,
  payload: OltsConfigurationItemPayload
): Promise<ApiResponse<OltsConfigurationItem>> {
  return oltsRequest<OltsConfigurationItem>(token, oltsConfigCollectionPath(resource), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateOltsConfigurationItem(
  token: string,
  resource: string,
  id: string | number,
  payload: OltsConfigurationItemPayload
): Promise<ApiResponse<OltsConfigurationItem>> {
  return oltsRequest<OltsConfigurationItem>(token, oltsConfigItemPath(resource, id), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteOltsConfigurationItem(
  token: string,
  resource: string,
  id: string | number
): Promise<ApiResponse<null>> {
  return oltsRequest<null>(token, oltsConfigItemPath(resource, id), { method: 'DELETE' });
}

export function listRoles(token: string): Promise<ApiResponse<RoleConfig[]>> {
  return authServiceRequest<RoleConfig[]>(token, '/admin/roles', { method: 'GET' });
}

export function createRole(token: string, payload: RoleConfigPayload): Promise<ApiResponse<RoleConfig>> {
  return authServiceRequest<RoleConfig>(token, '/admin/roles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateRole(
  token: string,
  id: string,
  payload: RoleConfigPayload
): Promise<ApiResponse<RoleConfig>> {
  return authServiceRequest<RoleConfig>(token, `/admin/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteRole(token: string, id: string): Promise<ApiResponse<null>> {
  return authServiceRequest<null>(token, `/admin/roles/${id}`, { method: 'DELETE' });
}

export function listAdminUsers(token: string): Promise<ApiResponse<AdminUserRecord[]>> {
  return authServiceRequest<AdminUserRecord[]>(token, '/admin/users', { method: 'GET' });
}

export function createAdminUser(
  token: string,
  payload: AdminUserPayload
): Promise<ApiResponse<AdminUserRecord>> {
  return authServiceRequest<AdminUserRecord>(token, '/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateAdminUser(
  token: string,
  id: string,
  payload: AdminUserPayload
): Promise<ApiResponse<AdminUserRecord>> {
  return authServiceRequest<AdminUserRecord>(token, `/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteAdminUser(token: string, id: string): Promise<ApiResponse<null>> {
  return authServiceRequest<null>(token, `/admin/users/${id}`, { method: 'DELETE' });
}

function kriRequest<T>(token: string, path: string, init: RequestInit): Promise<ApiResponse<T>> {
  return serviceRequest<T>(resolveKriUrl(path), 'KRI_BASE_URL is not configured for this environment.', {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });
}

function riskRegisterRequest<T>(token: string, path: string, init: RequestInit): Promise<ApiResponse<T>> {
  return serviceRequest<T>(
    resolveRiskRegisterUrl(path),
    'RISK_REGISTER_BASE_URL is not configured for this environment.',
    {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.headers ?? {})
      }
    }
  );
}

export function listKriRecords(token: string): Promise<ApiResponse<KriRecord[]>> {
  return kriRequest<KriRecord[]>(token, '/kri/records', { method: 'GET' });
}

export function createKriRecord(token: string, payload: KriRecordPayload): Promise<ApiResponse<KriRecord>> {
  return kriRequest<KriRecord>(token, '/kri/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateKriRecord(
  token: string,
  kriId: string,
  payload: KriRecordPayload
): Promise<ApiResponse<KriRecord>> {
  return kriRequest<KriRecord>(token, `/kri/records/${kriId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteKriRecord(token: string, kriId: string): Promise<ApiResponse<null>> {
  return kriRequest<null>(token, `/kri/records/${kriId}`, { method: 'DELETE' });
}

export function listRiskRecords(token: string): Promise<ApiResponse<RiskRecord[]>> {
  return riskRegisterRequest<RiskRecord[]>(token, '/risk-register/risks', { method: 'GET' });
}

export function getRiskRecord(token: string, riskId: string): Promise<ApiResponse<RiskRecord>> {
  return riskRegisterRequest<RiskRecord>(token, `/risk-register/risks/${riskId}`, { method: 'GET' });
}

export function createRiskRecord(token: string, payload: RiskRecordPayload): Promise<ApiResponse<RiskRecord>> {
  return riskRegisterRequest<RiskRecord>(token, '/risk-register/risks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateRiskRecord(
  token: string,
  riskId: string,
  payload: RiskRecordPayload
): Promise<ApiResponse<RiskRecord>> {
  return riskRegisterRequest<RiskRecord>(token, `/risk-register/risks/${riskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteRiskRecord(token: string, riskId: string): Promise<ApiResponse<null>> {
  return riskRegisterRequest<null>(token, `/risk-register/risks/${riskId}`, { method: 'DELETE' });
}

function notificationsRequest<T>(token: string, path: string, init: RequestInit): Promise<ApiResponse<T>> {
  return serviceRequest<T>(resolveNotificationsUrl(path), 'NOTIFICATIONS_BASE_URL is not configured for this environment.', {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });
}

export interface NotificationListQuery {
  type?: string;
  priority?: string;
  readState?: string;
  state?: string;
  sourceService?: string;
  page?: number;
  size?: number;
}

function toQueryString(query: NotificationListQuery): string {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.priority) params.set('priority', query.priority);
  if (query.readState) params.set('readState', query.readState);
  if (query.state) params.set('state', query.state);
  if (query.sourceService) params.set('sourceService', query.sourceService);
  params.set('page', String(query.page ?? 0));
  params.set('size', String(query.size ?? 20));
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function listNotifications(
  token: string,
  query: NotificationListQuery = {}
): Promise<ApiResponse<NotificationPage>> {
  return notificationsRequest<NotificationPage>(token, `/notifications${toQueryString(query)}`, {
    method: 'GET'
  });
}

export function getNotification(token: string, id: string): Promise<ApiResponse<NotificationRecord>> {
  return notificationsRequest<NotificationRecord>(token, `/notifications/${id}`, { method: 'GET' });
}

export function getNotificationUnreadCount(token: string): Promise<ApiResponse<NotificationUnreadCount>> {
  return notificationsRequest<NotificationUnreadCount>(token, '/notifications/unread-count', {
    method: 'GET'
  });
}

export function markNotificationRead(token: string, id: string): Promise<ApiResponse<NotificationRecord>> {
  return notificationsRequest<NotificationRecord>(token, `/notifications/${id}/read`, {
    method: 'PATCH'
  });
}

export function markNotificationUnread(token: string, id: string): Promise<ApiResponse<NotificationRecord>> {
  return notificationsRequest<NotificationRecord>(token, `/notifications/${id}/unread`, {
    method: 'PATCH'
  });
}

export function dismissNotification(token: string, id: string): Promise<ApiResponse<NotificationRecord>> {
  return notificationsRequest<NotificationRecord>(token, `/notifications/${id}/dismiss`, {
    method: 'PATCH'
  });
}

export function archiveNotification(token: string, id: string): Promise<ApiResponse<NotificationRecord>> {
  return notificationsRequest<NotificationRecord>(token, `/notifications/${id}/archive`, {
    method: 'PATCH'
  });
}

export function markAllNotificationsRead(token: string): Promise<ApiResponse<null>> {
  return notificationsRequest<null>(token, '/notifications/read-all', {
    method: 'POST'
  });
}

export function archiveAllReadNotifications(token: string): Promise<ApiResponse<null>> {
  return notificationsRequest<null>(token, '/notifications/archive-all-read', {
    method: 'POST'
  });
}

export function deleteNotification(token: string, id: string): Promise<ApiResponse<null>> {
  return notificationsRequest<null>(token, `/notifications/${id}`, { method: 'DELETE' });
}

export function publishInternalNotificationEvent(
  token: string,
  payload: InternalNotificationEventPayload
): Promise<ApiResponse<null>> {
  return notificationsRequest<null>(token, '/internal/notifications/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export async function openNotificationsStream(
  token: string,
  onMessage: (data: string) => void,
  onError: (error: Error) => void,
  signal: AbortSignal
): Promise<void> {
  const url = resolveNotificationsUrl('/notifications/stream');
  if (!url) {
    onError(new Error('NOTIFICATIONS_BASE_URL is not configured for this environment.'));
    return;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'text/event-stream',
        Authorization: `Bearer ${token}`
      },
      signal
    });

    if (!response.ok || !response.body) {
      onError(new Error(`Notifications stream failed with status ${response.status}.`));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const chunk = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const dataLines = chunk
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.replace(/^data:\s?/, ''))
          .join('\n');
        if (dataLines) onMessage(dataLines);
        boundary = buffer.indexOf('\n\n');
      }
    }
  } catch (error) {
    if (signal.aborted) return;
    onError(error instanceof Error ? error : new Error('Notifications stream failed.'));
  }
}

function oltsRequest<T>(token: string, path: string, init: RequestInit): Promise<ApiResponse<T>> {
  return serviceRequest<T>(resolveOltsUrl(path), 'OLTS_BASE_URL is not configured for this environment.', {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {})
    }
  });
}

export function listOltsIncidents(token: string): Promise<ApiResponse<OltsIncident[]>> {
  return oltsRequest<OltsIncident[]>(token, '/olts/incidents', { method: 'GET' });
}

export function getOltsIncident(token: string, incidentId: string): Promise<ApiResponse<OltsIncident>> {
  return oltsRequest<OltsIncident>(token, `/olts/incidents/${incidentId}`, { method: 'GET' });
}

export function createOltsIncident(token: string, payload: OltsIncidentPayload): Promise<ApiResponse<OltsIncident>> {
  return oltsRequest<OltsIncident>(token, '/olts/incidents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function updateOltsIncident(
  token: string,
  incidentId: string,
  payload: OltsIncidentPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsRequest<OltsIncident>(token, `/olts/incidents/${incidentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteOltsIncident(token: string, incidentId: string): Promise<ApiResponse<null>> {
  return oltsRequest<null>(token, `/olts/incidents/${incidentId}`, { method: 'DELETE' });
}

export function submitOltsIncident(
  token: string,
  incidentId: string,
  payload: WorkflowReasonPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsRequest<OltsIncident>(token, `/olts/incidents/${incidentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

function oltsAuthorizationAction(
  token: string,
  incidentId: string,
  action: 'start' | 'return' | 'reject' | 'approve',
  payload: WorkflowReasonPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsRequest<OltsIncident>(token, `/olts/incidents/${incidentId}/authorization/${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function startOltsAuthorization(
  token: string,
  incidentId: string,
  payload: WorkflowReasonPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsAuthorizationAction(token, incidentId, 'start', payload);
}

export function returnOltsIncidentForCorrection(
  token: string,
  incidentId: string,
  payload: WorkflowReasonPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsAuthorizationAction(token, incidentId, 'return', payload);
}

export function rejectOltsIncident(
  token: string,
  incidentId: string,
  payload: WorkflowReasonPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsAuthorizationAction(token, incidentId, 'reject', payload);
}

export function approveOltsIncident(
  token: string,
  incidentId: string,
  payload: WorkflowReasonPayload
): Promise<ApiResponse<OltsIncident>> {
  return oltsAuthorizationAction(token, incidentId, 'approve', payload);
}
