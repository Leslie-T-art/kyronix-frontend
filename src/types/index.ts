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
'eventStatuses' |
'residualRisks' |
'actionStatuses' |
'recoveryMethods' |
'rootCauses' |
'baselEventCategories' |
'dataSources' |
'validationResults' |
'controls' |
'currencies' |
'kriCategories' |
'treatmentStrategies' |
'unitsOfMeasure' |
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
  eventId: string;
  eventTitle: string;
  eventStatusId: number;
  incidentDate: string;
  incidentEndDate: string;
  detectionDate: string;
  departmentId: string | number;
  departmentName?: string | null;
  branchId: string | number;
  branchName?: string | null;
  processName: string;
  productService: string;
  baselEventCategoryId: number;
  eventDescription: string;
  immediateActionTaken: string;
  rootCauseCategoryId: number;
  rootCauseDescription: string;
  controlId: number;
  failedMissingControl: boolean;
  currencyId: number;
  grossLoss: number;
  restitutionRemediationCost: number;
  recoveryMethodId: number;
  netLoss: number;
  accountingGlReference: string;
  dataSourceId: number;
  nonFinancialImpactType: string;
  nonFinancialImpactDetails: string;
  overallEventSeverity: string;
  correctiveAction: string;
  actionOwner: string;
  actionTargetDate: string;
  actionStatusId: number;
  preventiveControlImplemented: boolean;
  validationEvidence: string;
  closureValidationDate: string;
  closureComment: string;
  authorizationStatus: string;
  status: string;
  eventOwner: string;
  reportedBy: string;
  createdAt: string;
  createdBy: string;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
  recordVersion: number;
}

export interface OltsIncidentPayload {
  eventTitle: string;
  eventStatusId: number;
  incidentDate: string;
  incidentEndDate: string;
  detectionDate: string;
  branchId: number;
  departmentId: number;
  processName: string;
  productService: string;
  baselEventCategoryId: number;
  eventDescription: string;
  immediateActionTaken: string;
  rootCauseCategoryId: number;
  rootCauseDescription: string;
  controlId: number;
  failedMissingControl: boolean;
  currencyId: number;
  grossLoss: number;
  restitutionRemediationCost: number;
  recoveryMethodId: number;
  accountingGlReference: string;
  dataSourceId: number;
  nonFinancialImpactType: string;
  nonFinancialImpactDetails: string;
  overallEventSeverity: string;
  correctiveAction: string;
  actionOwner: string;
  actionTargetDate: string;
  actionStatusId: number;
  preventiveControlImplemented: boolean;
  validationEvidence: string;
  closureValidationDate: string;
  closureComment: string;
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

export interface OltsConfigurationItem {
  id: string | number;
  code: string;
  name: string;
  description: string;
  displayOrder: number;
  createdBy?: string | number;
  createdAt?: string;
  updatedBy?: string | number;
  updatedAt?: string;
}

export interface OltsConfigurationItemPayload {
  code: string;
  name: string;
  description: string;
  displayOrder: number;
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

export interface TreatmentStrategy {
  id: string | number;
  code: string;
  name: string;
  status: string;
  createdAt?: string;
  createdBy?: string | number;
  updatedAt?: string;
  updatedBy?: string | number;
}

export interface TreatmentStrategyPayload {
  code: string;
  name: string;
  status: string;
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
  inherentRating: string;
  residualRating: string;
  controls: string;
  owner: string;
  unit: string;
  reviewDate: string;
  status: string;
  likelihood: number;
  impact: number;
  description: string;
}

export interface RiskRecord {
  riskId: string;
  riskTitle: string;
  category: string;
  owner: string;
  businessUnit: string;
  description: string;
  likelihood: number;
  impact: number;
  inherentRating: string;
  controlsMapped: string;
  controlEffectiveness: string;
  residualRating: string;
  treatmentStrategy: string;
  status: string;
  nextReviewDate: string;
  linkedProcess: string;
  linkedKri: string;
  actionPlan: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RiskRecordPayload {
  riskTitle: string;
  category: string;
  owner: string;
  businessUnit: string;
  description: string;
  likelihood: number;
  impact: number;
  inherentRating: string;
  controlsMapped: string;
  controlEffectiveness: string;
  residualRating: string;
  treatmentStrategy: string;
  status: string;
  nextReviewDate: string;
  linkedProcess: string;
  linkedKri: string;
  actionPlan: string;
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

export interface ProcessFlowRecord {
  id: string | number;
  flowReference: string;
  processFlowName: string;
  departmentId: string | number;
  description: string;
  validFromDate: string;
  validToDate: string;
  workflowStatus: string;
  originalFileName?: string;
  contentType?: string;
  fileSize?: number;
  bucketName?: string;
  objectKey?: string;
  inputterUserId?: string | number;
  inputterUsername?: string;
  authorizerUserId?: string | number;
  authorizerUsername?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ProcessFlowPayload {
  processFlowName: string;
  departmentId: number;
  description: string;
  validFromDate: string;
  validToDate: string;
  document?: File | null;
}

export interface WorkflowCommentPayload {
  comment: string;
}

export interface SelfAssessment {
  id: string | number;
  rcsaId: string;
  assessmentPeriod: string;
  departmentId: string | number;
  processName: string;
  riskRegisterRisk: string;
  riskScenario: string;
  cause: string;
  consequenceImpact: string;
  inherentImpact: number;
  inherentLikelihood: number;
  inherentRiskScore: number;
  inherentRiskRating: string;
  linkedControls: string[];
  controlDesignEffectiveness: string;
  controlOperatingEffectiveness: string;
  overallControlEffectiveness: string;
  residualImpact: number;
  residualLikelihood: number;
  residualRiskScore: number;
  residualRiskRating: string;
  riskResponse: string;
  actionRequired: boolean;
  linkedAction: string;
  linkedKris: string[];
  linkedOltsEvents: string[];
  linkedIssuesFindings: string[];
  businessReviewStatus: string;
  riskReviewVerification: string;
  riskReviewComment: string;
  dateOfLastReview: string;
  nextReviewDate: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface SelfAssessmentPayload {
  assessmentPeriod: string;
  departmentId: number;
  processName: string;
  riskRegisterRisk: string;
  riskScenario: string;
  cause: string;
  consequenceImpact: string;
  inherentImpact: number;
  inherentLikelihood: number;
  linkedControls: string[];
  controlDesignEffectiveness: string;
  controlOperatingEffectiveness: string;
  overallControlEffectiveness: string;
  residualImpact: number;
  residualLikelihood: number;
  riskResponse: string;
  actionRequired: boolean;
  linkedAction: string;
  linkedKris: string[];
  linkedOltsEvents: string[];
  linkedIssuesFindings: string[];
  businessReviewStatus: string;
  riskReviewVerification: string;
  riskReviewComment: string;
  dateOfLastReview: string;
  nextReviewDate: string;
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
