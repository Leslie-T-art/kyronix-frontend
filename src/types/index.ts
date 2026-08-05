export type Role = 'Admin' | 'Head' | 'RiskManager' | 'Auditor' | 'ProcessOwner' | 'Staff';

export type EngineKey =
'dashboard' |
'notifications' |
'departments' |
'branches' |
'users' |
'rolesConfig' |
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
  username: string;
  role: Role;
  unit: string;
  initials: string;
  backendRoles: string[];
  permissions: string[];
  departmentId?: string;
  branchId?: string;
  issuedAt?: string;
  expiresAt?: string;
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

export interface OltsIncident {
  id: string;
  incidentId: string;
  departmentId: string;
  branchId: string;
  incidentDate: string;
  discoveryDate: string;
  severity: string;
  authorizationStatus: string;
  status: string;
  grossLoss: number;
  recoveries: number;
  netLoss: number;
  potentialLoss: number;
  inputterUserId: string;
  responsiblePersonId: string;
  responsiblePersonName: string;
  createdAt: string;
  createdBy: string;
  lossCategory?: string;
  eventType?: string;
  description?: string;
  currencyCode?: string;
}

export interface OltsIncidentPayload {
  incidentDate: string;
  discoveryDate: string;
  branchId: string;
  departmentId: string;
  lossCategory: string;
  eventType: string;
  severity: string;
  description: string;
  currencyCode: string;
  grossLoss: number;
  recoveries: number;
  potentialLoss: number;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface DepartmentPayload {
  code: string;
  name: string;
  active: boolean;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface BranchPayload {
  code: string;
  name: string;
  active: boolean;
}

export interface RoleConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface RoleConfigPayload {
  code: string;
  name: string;
  description: string;
  active: boolean;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  fullName: string;
  active: boolean;
  locked: boolean;
  departmentId: string;
  branchId: string;
  roles: string[];
  permissions: string[];
  password?: string;
}

export interface AdminUserPayload {
  username: string;
  fullName: string;
  password: string;
  active: boolean;
  locked: boolean;
  departmentId: string;
  branchId: string;
  roles: string[];
  permissions: string[];
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
