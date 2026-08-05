import type { Role } from '../../types';
import { ENDPOINTS } from './endpoints';
import { oltsExceptions } from '../../data/olts';
import { kris } from '../../data/kri';
import { riskEntries } from '../../data/riskRegister';
import { processFlows } from '../../data/processFlows';
import { selfAssessments } from '../../data/selfAssessment';
import { auditEvents } from '../../data/auditTrail';
import { dashboardSummary } from '../../data/dashboard';
import { notifications } from '../../data/notifications';

interface BffContext {
  role: Role;
  unit: string;
  actor: string;
}

interface BffRoute {
  engine: string;
  roles: Role[];
  handler: (context: BffContext) => unknown;
}

const ALL: Role[] = ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Staff'];

/** Data scoping applied at the BFF boundary — never in the browser. */
function scopeByUnit<T extends {unit?: string;}>(rows: T[], context: BffContext): T[] {
  if (context.role === 'ProcessOwner') {
    const scoped = rows.filter((row) => row.unit === context.unit);
    return scoped.length > 0 ? scoped : rows.slice(0, 3);
  }
  if (context.role === 'Staff') return rows.slice(0, 4);
  return rows;
}

const ROUTES: Record<string, BffRoute> = {
  [ENDPOINTS.dashboard.summary]: {
    engine: 'Dashboard',
    roles: ALL,
    handler: (context) => ({
      ...dashboardSummary,
      stats: dashboardSummary.stats.filter((stat) => stat.roles.includes(context.role)),
      attention:
      context.role === 'Staff' ?
      dashboardSummary.attention.slice(0, 2) :
      dashboardSummary.attention
    })
  },
  [ENDPOINTS.notifications.list]: {
    engine: 'Notifications',
    roles: ALL,
    handler: (context) =>
    context.role === 'Staff' ?
    notifications.filter((item) => item.engine !== 'Audit') :
    notifications
  },
  [ENDPOINTS.olts.list]: {
    engine: 'OLTS',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner'],
    handler: (context) =>
    context.role === 'ProcessOwner' ? oltsExceptions.slice(0, 8) : oltsExceptions
  },
  [ENDPOINTS.audit.trail]: {
    engine: 'Audit',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor'],
    handler: () => auditEvents
  },
  [ENDPOINTS.kri.list]: {
    engine: 'KRI',
    roles: ALL,
    handler: (context) => scopeByUnit(kris, context)
  },
  [ENDPOINTS.riskRegister.list]: {
    engine: 'Risk Register',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner'],
    handler: (context) => scopeByUnit(riskEntries, context)
  },
  [ENDPOINTS.processFlows.list]: {
    engine: 'Process Flows',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner'],
    handler: () => processFlows
  },
  [ENDPOINTS.selfAssessment.list]: {
    engine: 'Self Assessment',
    roles: ['Admin', 'Head', 'RiskManager', 'ProcessOwner', 'Staff'],
    handler: (context) =>
    context.role === 'Staff' ? selfAssessments.slice(0, 4) : selfAssessments
  }
};

export function resolveBffRoute(path: string): BffRoute | undefined {
  return ROUTES[path];
}
