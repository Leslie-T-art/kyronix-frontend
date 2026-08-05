import type { EngineKey, Role } from '../../types';

/** Declarative access matrix. Nav, widgets, columns and actions all read from here. */
export const NAV_ACCESS: Record<EngineKey, Role[]> = {
  dashboard: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Staff'],
  notifications: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Staff'],
  departments: ['Admin'],
  branches: ['Admin'],
  users: ['Admin'],
  rolesConfig: ['Admin'],
  olts: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner'],
  audit: ['Admin', 'RiskManager', 'Auditor'],
  kri: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Staff'],
  riskRegister: ['Admin', 'RiskManager', 'Auditor', 'ProcessOwner'],
  processFlows: ['Admin', 'RiskManager', 'Auditor', 'ProcessOwner'],
  selfAssessment: ['Admin', 'RiskManager', 'ProcessOwner', 'Staff']
};

export type Action = 'create' | 'edit' | 'approve' | 'close' | 'export';

export const ACTION_ACCESS: Record<Action, Role[]> = {
  create: ['Admin', 'Head', 'RiskManager', 'ProcessOwner'],
  edit: ['Admin', 'Head', 'RiskManager', 'ProcessOwner'],
  approve: ['Admin', 'Head', 'RiskManager'],
  close: ['Admin', 'Head', 'RiskManager'],
  export: ['Admin', 'Head', 'RiskManager', 'Auditor']
};

export function canAccess(role: Role, engine: EngineKey): boolean {
  return NAV_ACCESS[engine].includes(role);
}

export function can(role: Role, action: Action): boolean {
  return ACTION_ACCESS[action].includes(role);
}

/** Data scope applied server-side by the BFF; mirrored client-side for labelling only. */
export function scopeLabel(role: Role, unit: string): string {
  if (role === 'Admin' || role === 'Head' || role === 'RiskManager') return 'Bank-wide';
  if (role === 'Auditor') return 'Assurance view';
  if (role === 'ProcessOwner') return unit;
  return 'Personal view';
}
