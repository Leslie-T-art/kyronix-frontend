import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { Role, User } from '../types';
import { directoryUsers } from '../data/users';
import { useScreenInit } from '../useScreenInit.js';

type AuthStatus = 'signed-out' | 'redirecting' | 'mfa-pending' | 'signed-in';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signIn: (role: Role) => Promise<void>;
  signOut: () => void;
  switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const screenInit = useScreenInit() as {authRole?: Role;};
  const seededUser =
  directoryUsers.find((candidate) => candidate.role === screenInit.authRole) ?? null;

  const [user, setUser] = useState<User | null>(seededUser);
  const [status, setStatus] = useState<AuthStatus>(seededUser ? 'signed-in' : 'signed-out');

  const signIn = useCallback(async (role: Role) => {
    setStatus('redirecting');
    await new Promise((resolve) => setTimeout(resolve, 700));
    setStatus('mfa-pending');
    await new Promise((resolve) => setTimeout(resolve, 800));
    const account = directoryUsers.find((candidate) => candidate.role === role) ?? directoryUsers[0];
    setUser(account);
    setStatus('signed-in');
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setStatus('signed-out');
  }, []);

  const switchRole = useCallback((role: Role) => {
    const account = directoryUsers.find((candidate) => candidate.role === role);
    if (account) setUser(account);
  }, []);

  const value = useMemo(
    () => ({ user, status, signIn, signOut, switchRole }),
    [user, status, signIn, signOut, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}