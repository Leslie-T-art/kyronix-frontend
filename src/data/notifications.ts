import type { AppNotification } from '../types';

export const notifications: AppNotification[] = [
{
  id: 'ntf-1',
  title: 'KRI red breach: Overdue AML alerts',
  body: 'Overdue AML alerts reached 46 against a red threshold of 40. Financial Crime has been notified.',
  engine: 'KRI',
  tone: 'critical',
  time: '12 minutes ago',
  unread: true
},
{
  id: 'ntf-2',
  title: 'OLTS exception escalated',
  body: 'OLTS-2026-04411 (Borrowdale, RTGS Outward) was escalated by S. Ndlovu and needs resolution within 48 hours.',
  engine: 'OLTS',
  tone: 'critical',
  time: '1 hour ago',
  unread: true
},
{
  id: 'ntf-3',
  title: 'Self-assessment overdue',
  body: 'Information security controls RCSA is 11 days past its due date at 18% completion.',
  engine: 'Self Assessment',
  tone: 'warning',
  time: '3 hours ago',
  unread: true
},
{
  id: 'ntf-4',
  title: 'Risk review due next week',
  body: 'RSK-0112 Foreign currency liquidity shortfall is scheduled for review on 12 Aug.',
  engine: 'Risk Register',
  tone: 'warning',
  time: 'Yesterday',
  unread: true
},
{
  id: 'ntf-5',
  title: 'Process document submitted for review',
  body: 'A. Marufu submitted PRC-014 RTGS outward payment processing v3.5 for approval.',
  engine: 'Process Flows',
  tone: 'info',
  time: 'Yesterday',
  unread: false
},
{
  id: 'ntf-6',
  title: 'Audit trail exported',
  body: 'N. Chapfika exported 2,418 July audit records to CSV.',
  engine: 'Audit',
  tone: 'info',
  time: '2 days ago',
  unread: false
},
{
  id: 'ntf-7',
  title: 'Treasury RCSA submitted',
  body: 'P. Chirwa submitted the Treasury dealing room RCSA for H2 2026 at 100% completion.',
  engine: 'Self Assessment',
  tone: 'success',
  time: '2 days ago',
  unread: false
}];