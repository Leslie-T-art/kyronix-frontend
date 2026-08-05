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
  OltsIncident,
  OltsIncidentPayload,
  RoleConfig,
  RoleConfigPayload,
  Role
} from '../../types';
import { createApiError, type ApiError } from './errors';
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

function mapStatusToError(status: number, correlationId: string, message?: string): ApiError {
  if (status === 401) return { code: 'UNAUTHORIZED', correlationId, message: message ?? 'Invalid username or password.' };
  if (status === 403) return { code: 'FORBIDDEN', correlationId, message: message ?? 'Your role does not grant access to this action.' };
  return { code: 'UPSTREAM', correlationId, message: message ?? 'The authentication service is temporarily unavailable.' };
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
    const payload = await response.json() as Partial<ApiEnvelope<T>> & ProblemDetailPayload;
    const correlation = payload.correlationId ?? response.headers.get('x-correlation-id') ?? id;
    const message = payload.detail ?? payload.message ?? payload.title;

    if (!response.ok || !payload.success) {
      return {
        data: null,
        error: mapStatusToError(response.status, correlation, message),
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

export function authMe(token: string): Promise<ApiResponse<AuthPayload>> {
  return authRequest<AuthPayload>(ENDPOINTS.auth.me, {
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
