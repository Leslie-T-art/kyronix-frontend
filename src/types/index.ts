export type Role = 'Admin' | 'RiskManager' | 'Auditor' | 'ProcessOwner' | 'Staff';

export type EngineKey =
'dashboard' |
'notifications' |
'olts' |
'audit' |
'kri' |
'riskRegister' |
'processFlows' |
'selfAssessment';

export type SemanticTone = 'critical' | 'warning' | 'success' | 'info' | 'neutral';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  unit: string;
  initials: string;
}

export interface OltsException {
  id: string;
  reference: string;
  branch: string;
  transactionType: string;
  amount: number;
  currency: string;
  exceptionReason: string;
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved';
  raisedDate: string;
  owner: string;
}

export interface Kri {
  id: string;
  name: string;
  category: string;
  owner: string;
  unit: string;
  currentValue: number;
  target: number;
  amberThreshold: number;
  redThreshold: number;
  unitLabel: string;
  trend: number[];
  breachStatus: 'Green' | 'Amber' | 'Red';
  lastUpdated: string;
}

export interface RiskEntry {
  id: string;
  title: string;
  category: string;
  inherentRating: 'Low' | 'Medium' | 'High' | 'Critical';
  residualRating: 'Low' | 'Medium' | 'High' | 'Critical';
  controls: number;
  owner: string;
  unit: string;
  reviewDate: string;
  status: 'Open' | 'Mitigating' | 'Monitoring' | 'Closed';
  likelihood: number;
  impact: number;
  description: string;
}

export interface ProcessFlow {
  id: string;
  name: string;
  department: string;
  owner: string;
  version: string;
  lastReviewed: string;
  linkedRisks: number;
  status: 'Draft' | 'In Review' | 'Approved' | 'Expired';
  steps: {name: string;actor: string;control: string;}[];
}

export interface SelfAssessment {
  id: string;
  name: string;
  unit: string;
  period: string;
  completion: number;
  dueDate: string;
  assessor: string;
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue';
}

export interface AuditEvent {
  id: string;
  actor: string;
  role: Role;
  engine: string;
  action: string;
  entity: string;
  change: string;
  ip: string;
  correlationId: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  engine: string;
  tone: SemanticTone;
  time: string;
  unread: boolean;
}

export interface DashboardSummary {
  stats: {
    key: string;
    label: string;
    value: string;
    delta: number;
    tone: SemanticTone;
    roles: Role[];
  }[];
  heatmap: {likelihood: number;impact: number;count: number;}[];
  exposureTrend: {month: string;inherent: number;residual: number;}[];
  attention: {
    id: string;
    title: string;
    engine: string;
    due: string;
    tone: SemanticTone;
  }[];
  activity: {id: string;actor: string;action: string;time: string;}[];
}