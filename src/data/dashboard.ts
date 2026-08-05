import type { DashboardSummary } from '../types';

export const dashboardSummary: DashboardSummary = {
  stats: [
  {
    key: 'open-risks',
    label: 'Open risks',
    value: '42',
    delta: 8,
    tone: 'warning',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Staff']
  },
  {
    key: 'kri-breached',
    label: 'KRIs breached',
    value: '3',
    delta: 50,
    tone: 'critical',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner', 'Staff']
  },
  {
    key: 'overdue-actions',
    label: 'Overdue actions',
    value: '17',
    delta: -12,
    tone: 'critical',
    roles: ['Admin', 'Head', 'RiskManager', 'ProcessOwner']
  },
  {
    key: 'audit-findings',
    label: 'Audit findings',
    value: '28',
    delta: -5,
    tone: 'info',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor']
  },
  {
    key: 'rcsa-due',
    label: 'Self-assessments due',
    value: '6',
    delta: 20,
    tone: 'warning',
    roles: ['Admin', 'Head', 'RiskManager', 'ProcessOwner', 'Staff']
  },
  {
    key: 'olts-exceptions',
    label: 'OLTS exceptions',
    value: '124',
    delta: 3,
    tone: 'neutral',
    roles: ['Admin', 'Head', 'RiskManager', 'Auditor', 'ProcessOwner']
  }],

  heatmap: [
  { likelihood: 1, impact: 1, count: 2 },
  { likelihood: 1, impact: 2, count: 1 },
  { likelihood: 1, impact: 3, count: 3 },
  { likelihood: 1, impact: 4, count: 0 },
  { likelihood: 1, impact: 5, count: 1 },
  { likelihood: 2, impact: 1, count: 1 },
  { likelihood: 2, impact: 2, count: 4 },
  { likelihood: 2, impact: 3, count: 2 },
  { likelihood: 2, impact: 4, count: 3 },
  { likelihood: 2, impact: 5, count: 2 },
  { likelihood: 3, impact: 1, count: 0 },
  { likelihood: 3, impact: 2, count: 2 },
  { likelihood: 3, impact: 3, count: 5 },
  { likelihood: 3, impact: 4, count: 4 },
  { likelihood: 3, impact: 5, count: 2 },
  { likelihood: 4, impact: 1, count: 1 },
  { likelihood: 4, impact: 2, count: 0 },
  { likelihood: 4, impact: 3, count: 3 },
  { likelihood: 4, impact: 4, count: 2 },
  { likelihood: 4, impact: 5, count: 1 },
  { likelihood: 5, impact: 1, count: 0 },
  { likelihood: 5, impact: 2, count: 1 },
  { likelihood: 5, impact: 3, count: 1 },
  { likelihood: 5, impact: 4, count: 2 },
  { likelihood: 5, impact: 5, count: 1 }],

  exposureTrend: [
  { month: 'Mar', inherent: 340, residual: 210 },
  { month: 'Apr', inherent: 352, residual: 205 },
  { month: 'May', inherent: 361, residual: 198 },
  { month: 'Jun', inherent: 348, residual: 186 },
  { month: 'Jul', inherent: 372, residual: 194 },
  { month: 'Aug', inherent: 385, residual: 201 }],

  attention: [
  {
    id: 'att-1',
    title: 'Overdue AML alerts breached red threshold (46)',
    engine: 'KRI',
    due: 'Immediate',
    tone: 'critical'
  },
  {
    id: 'att-2',
    title: 'Information security controls RCSA overdue',
    engine: 'Self Assessment',
    due: '11 days overdue',
    tone: 'critical'
  },
  {
    id: 'att-3',
    title: 'Foreign currency liquidity shortfall review due',
    engine: 'Risk Register',
    due: 'Due 12 Aug',
    tone: 'warning'
  },
  {
    id: 'att-4',
    title: 'Vendor onboarding process document expired',
    engine: 'Process Flows',
    due: 'Expired',
    tone: 'warning'
  },
  {
    id: 'att-5',
    title: '3 OLTS exceptions escalated beyond 48 hours',
    engine: 'OLTS',
    due: 'Due today',
    tone: 'warning'
  }],

  activity: [
  { id: 'act-1', actor: 'T. Mabhena', action: 'updated residual rating on RSK-0142', time: '09:42' },
  { id: 'act-2', actor: 'S. Ndlovu', action: 'escalated OLTS-2026-04411', time: '09:05' },
  { id: 'act-3', actor: 'K. Mutasa', action: 'amended a KRI threshold', time: '08:31' },
  { id: 'act-4', actor: 'R. Chikafu', action: 'saved a draft RCSA response', time: '08:12' },
  { id: 'act-5', actor: 'N. Chapfika', action: 'exported the July audit trail', time: 'Yesterday' }]

};
