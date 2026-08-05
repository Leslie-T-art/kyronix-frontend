import React from 'react';
import type { Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface RoleGateProps {
  allow: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/** UX-only gate. Authorisation is always re-checked at the BFF boundary. */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}