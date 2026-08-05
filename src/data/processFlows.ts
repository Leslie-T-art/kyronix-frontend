import type { ProcessFlow } from '../types';

export const processFlows: ProcessFlow[] = [
{
  id: 'PRC-021',
  name: 'Retail account opening',
  department: 'Retail Banking',
  owner: 'N. Dube',
  version: 'v4.2',
  lastReviewed: '2026-06-14',
  linkedRisks: 5,
  status: 'Approved',
  steps: [
  { name: 'Capture customer application', actor: 'Branch Consultant', control: 'Mandatory field validation' },
  { name: 'KYC document verification', actor: 'Branch Consultant', control: 'Four-eyes document check' },
  { name: 'Sanctions & PEP screening', actor: 'Financial Crime', control: 'Automated screening engine' },
  { name: 'Account creation in core', actor: 'Operations', control: 'Maker-checker posting' },
  { name: 'Welcome pack issuance', actor: 'Branch Consultant', control: 'Issuance register sign-off' }]

},
{
  id: 'PRC-018',
  name: 'Corporate credit origination',
  department: 'Corporate Banking',
  owner: 'M. Sibanda',
  version: 'v6.0',
  lastReviewed: '2026-05-02',
  linkedRisks: 9,
  status: 'Approved',
  steps: [
  { name: 'Client proposal intake', actor: 'Relationship Manager', control: 'Deal screening checklist' },
  { name: 'Credit analysis & rating', actor: 'Credit Analyst', control: 'Rating model governance' },
  { name: 'Credit committee approval', actor: 'Credit Committee', control: 'Quorum and minuted decision' },
  { name: 'Security perfection', actor: 'Legal', control: 'Collateral registry confirmation' },
  { name: 'Disbursement', actor: 'Operations', control: 'Conditions precedent verification' }]

},
{
  id: 'PRC-014',
  name: 'RTGS outward payment processing',
  department: 'Operations',
  owner: 'A. Marufu',
  version: 'v3.5',
  lastReviewed: '2026-07-11',
  linkedRisks: 7,
  status: 'In Review',
  steps: [
  { name: 'Instruction capture', actor: 'Payments Clerk', control: 'Mandate signature verification' },
  { name: 'Limit and balance check', actor: 'System', control: 'Automated limit enforcement' },
  { name: 'Dual authorisation', actor: 'Payments Supervisor', control: 'Segregation of duties' },
  { name: 'Submission to RBZ', actor: 'System', control: 'Message integrity checks' },
  { name: 'Confirmation & reconciliation', actor: 'Reconciliations', control: 'Same-day nostro match' }]

},
{
  id: 'PRC-011',
  name: 'Foreign currency dealing',
  department: 'Treasury',
  owner: 'P. Chirwa',
  version: 'v2.8',
  lastReviewed: '2026-04-19',
  linkedRisks: 6,
  status: 'Approved',
  steps: [
  { name: 'Client rate request', actor: 'Dealer', control: 'Rate tolerance band' },
  { name: 'Deal capture', actor: 'Dealer', control: 'Time-stamped blotter' },
  { name: 'Middle office validation', actor: 'Middle Office', control: 'Independent rate check' },
  { name: 'Settlement instruction', actor: 'Back Office', control: 'Standard settlement instructions' }]

},
{
  id: 'PRC-009',
  name: 'Incident and loss event reporting',
  department: 'Operational Risk',
  owner: 'T. Mabhena',
  version: 'v5.1',
  lastReviewed: '2026-07-28',
  linkedRisks: 4,
  status: 'Approved',
  steps: [
  { name: 'Event identification', actor: 'Any staff member', control: 'Mandatory 24-hour reporting' },
  { name: 'Triage and categorisation', actor: 'Operational Risk', control: 'Basel event taxonomy' },
  { name: 'Root cause analysis', actor: 'Process Owner', control: 'Documented RCA template' },
  { name: 'Remediation tracking', actor: 'Operational Risk', control: 'Action plan due-date monitoring' }]

},
{
  id: 'PRC-006',
  name: 'Vendor onboarding and due diligence',
  department: 'Procurement',
  owner: 'B. Chigumba',
  version: 'v1.9',
  lastReviewed: '2025-11-30',
  linkedRisks: 3,
  status: 'Expired',
  steps: [
  { name: 'Vendor request', actor: 'Business Unit', control: 'Business case approval' },
  { name: 'Due diligence assessment', actor: 'Procurement', control: 'Risk-tiered questionnaire' },
  { name: 'Contract negotiation', actor: 'Legal', control: 'Standard clause library' },
  { name: 'Vendor activation', actor: 'Finance', control: 'Bank detail verification call-back' }]

},
{
  id: 'PRC-003',
  name: 'Branch cash management',
  department: 'Operations',
  owner: 'G. Nyathi',
  version: 'v3.0',
  lastReviewed: '2026-03-08',
  linkedRisks: 5,
  status: 'Draft',
  steps: [
  { name: 'Cash forecast', actor: 'Branch Manager', control: 'Holding limit thresholds' },
  { name: 'Cash-in-transit request', actor: 'Branch Manager', control: 'Dual custody handover' },
  { name: 'Vault reconciliation', actor: 'Head Teller', control: 'Daily independent count' }]

}];