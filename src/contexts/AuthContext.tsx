import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Role, User } from '../types';
import { authLogin, authMe, type AuthPayload } from '../lib/api/client';
import type { ApiError } from '../lib/api/errors';

type AuthStatus = 'bootstrapping' | 'signed-out' | 'signing-in' | 'signed-in';

interface StoredSession {
  accessToken: string;
  tokenType: string;
  issuedAt?: string;
  expiresAt?: string;
  roles: string[];
  permissions: string[];
}

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  error: ApiError | null;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEYS = {
  token: 'kyronix.auth.accessToken',
  roles: 'kyronix.auth.roles',
  permissions: 'kyronix.auth.permissions',
  session: 'kyronix.auth.session'
} as const;

function mapBackendRole(roles: string[], permissions: string[]): Role {
  if (roles.includes('SYSTEM_ADMIN') || roles.includes('ADMIN') || permissions.some((value) => value.startsWith('ADMIN_'))) {
    return 'Admin';
  }
  if (roles.includes('HEAD')) return 'Head';
  if (roles.includes('RISK_MANAGER')) return 'RiskManager';
  if (roles.includes('AUDITOR')) return 'Auditor';
  if (roles.includes('PROCESS_OWNER')) return 'ProcessOwner';
  return 'Staff';
}

function buildInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || 'NA';
}

function mapAuthPayloadToUser(payload: AuthPayload): User {
  const role = mapBackendRole(payload.roles, payload.permissions);
  const name = payload.fullName || payload.username;
  return {
    id: payload.userId,
    name,
    email: payload.username,
    username: payload.username,
    role,
    unit: payload.departmentId ?? payload.branchId ?? 'Bank-wide',
    initials: buildInitials(name),
    backendRoles: payload.roles,
    permissions: payload.permissions,
    departmentId: payload.departmentId,
    branchId: payload.branchId,
    issuedAt: payload.issuedAt,
    expiresAt: payload.expiresAt
  };
}

function persistSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEYS.token, session.accessToken);
  window.localStorage.setItem(STORAGE_KEYS.roles, JSON.stringify(session.roles));
  window.localStorage.setItem(STORAGE_KEYS.permissions, JSON.stringify(session.permissions));
  window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(STORAGE_KEYS.token);
  window.localStorage.removeItem(STORAGE_KEYS.roles);
  window.localStorage.removeItem(STORAGE_KEYS.permissions);
  window.localStorage.removeItem(STORAGE_KEYS.session);
}

function readSession(): StoredSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEYS.session);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    clearSession();
    return null;
  }
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [error, setError] = useState<ApiError | null>(null);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    setAccessToken(null);
    setError(null);
    setStatus('signed-out');
  }, []);

  const refreshProfile = useCallback(async () => {
    const session = readSession();
    if (!session?.accessToken) {
      signOut();
      return;
    }

    const response = await authMe(session.accessToken);
    if (response.error || !response.data) {
      setError(response.error);
      signOut();
      return;
    }

    persistSession({
      accessToken: session.accessToken,
      tokenType: response.data.tokenType || session.tokenType,
      issuedAt: response.data.issuedAt,
      expiresAt: response.data.expiresAt,
      roles: response.data.roles,
      permissions: response.data.permissions
    });
    setAccessToken(session.accessToken);
    setUser(mapAuthPayloadToUser(response.data));
    setError(null);
    setStatus('signed-in');
  }, [signOut]);

  const signIn = useCallback(async (username: string, password: string) => {
    setStatus('signing-in');
    setError(null);

    const response = await authLogin({ username, password });
    if (response.error || !response.data) {
      setUser(null);
      setAccessToken(null);
      setStatus('signed-out');
      setError(response.error);
      throw response.error ?? new Error('Authentication failed.');
    }

    persistSession({
      accessToken: response.data.accessToken,
      tokenType: response.data.tokenType,
      issuedAt: response.data.issuedAt,
      expiresAt: response.data.expiresAt,
      roles: response.data.roles,
      permissions: response.data.permissions
    });
    setAccessToken(response.data.accessToken);
    setUser(mapAuthPayloadToUser(response.data));
    setStatus('signed-in');
    setError(null);
  }, []);

  useEffect(() => {
    const session = readSession();
    if (!session?.accessToken) {
      setStatus('signed-out');
      return;
    }

    setAccessToken(session.accessToken);
    authMe(session.accessToken).then((response) => {
      if (response.error || !response.data) {
        signOut();
        return;
      }

      persistSession({
        accessToken: session.accessToken,
        tokenType: response.data.tokenType || session.tokenType,
        issuedAt: response.data.issuedAt,
        expiresAt: response.data.expiresAt,
        roles: response.data.roles,
        permissions: response.data.permissions
      });
      setUser(mapAuthPayloadToUser(response.data));
      setError(null);
      setStatus('signed-in');
    });
  }, [signOut]);

  const value = useMemo(
    () => ({ user, accessToken, status, error, signIn, signOut, refreshProfile }),
    [user, accessToken, status, error, signIn, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
