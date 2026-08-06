export type Role = 'Admin' | 'Head' | 'RiskManager' | 'Auditor' | 'ProcessOwner' | 'Inputter' | 'Staff';

export type EngineKey =
'dashboard' |
'notifications' |
'departments' |
'branches' |
'events' |
'lossCategories' |
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
  backendRoleNames: string[];
  permissions: string[];
  active?: boolean;
  locked?: boolean;
  departmentId?: string;
  departmentCode?: string;
  departmentName?: string;
  branchId?: string;
  branchCode?: string;
  branchName?: string;
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
  departmentName?: string | null;
  branchId: string;
  branchName?: string | null;
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

export interface EventType {
  id: string;
  code: string;
  name: string;
  active: boolean;
}

export interface EventTypePayload {
  code: string;
  name: string;
  active: boolean;
}

export interface LossCategory {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface LossCategoryPayload {
  code: string;
  name: string;
  description: string;
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

export interface KriRecord {
  id: string;
  kriId: string;
  indicatorName: string;
  category: string;
  owner: string;
  businessUnit: string;
  measurementFrequency: string;
  description: string;
  unitOfMeasure: string;
  target: number;
  direction: string;
  greenUpperBound: number;
  amberThreshold: number;
  redThreshold: number;
  currentValue: number;
  dataSource: string;
  nextReviewDate: string;
  linkedRisk: string;
  escalateTo: string;
  escalationTrigger: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface KriRecordPayload {
  indicatorName: string;
  category: string;
  owner: string;
  businessUnit: string;
  measurementFrequency: string;
  description: string;
  unitOfMeasure: string;
  target: number;
  direction: string;
  greenUpperBound: number;
  amberThreshold: number;
  redThreshold: number;
  currentValue: number;
  dataSource: string;
  nextReviewDate: string;
  linkedRisk: string;
  escalateTo: string;
  escalationTrigger: string;
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

export interface AuthAuditEvent {
  id: string;
  eventType: string;
  action: string;
  serviceName: string;
  entityType: string;
  entityId: string | null;
  businessReference: string | null;
  userId: string | null;
  username: string | null;
  roles: string | null;
  permissions: string | null;
  result: string;
  failureReason: string | null;
  requestMethod: string;
  requestPath: string;
  sourceIp: string;
  userAgent: string;
  correlationId: string;
  oldValues: string | null;
  newValues: string | null;
  occurredAt: string;
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

export interface NotificationRecord {
  id: string;
  type?: string | null;
  priority?: string | null;
  title: string;
  message: string;
  sourceService?: string | null;
  eventType?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  businessReference?: string | null;
  readState?: string | null;
  state?: string | null;
  occurredAt: string;
  readAt?: string | null;
  archivedAt?: string | null;
  correlationId?: string | null;
}

export interface NotificationPage {
  content: NotificationRecord[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface NotificationUnreadCount {
  unreadCount: number;
}

export interface InternalNotificationEventPayload {
  eventId: string;
  eventType: string;
  sourceService: string;
  entityType: string;
  entityId: string;
  businessReference: string;
  recipientUserIds: string[];
  departmentId: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  occurredAt: string;
  correlationId: string;
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
