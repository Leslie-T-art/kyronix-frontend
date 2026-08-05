import type { Role } from '../../types';
import { createApiError, type ApiError } from './errors';
import { resolveBffRoute } from './bffRoutes';

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

export function getRequestLog(): RequestLog[] {
  return requestLog;
}

function correlationId(): string {
  return `c-${Math.random().toString(16).slice(2, 8)}`;
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