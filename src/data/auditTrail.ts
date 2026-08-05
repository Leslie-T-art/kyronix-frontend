import type { AuditEvent } from '../types';

export const auditEvents: AuditEvent[] = [
{
  id: 'aud-1',
  actor: 'T. Mabhena',
  role: 'RiskManager',
  engine: 'Risk Register',
  action: 'Updated residual rating',
  entity: 'RSK-0142',
  change: 'Residual rating High → Medium',
  ip: '10.24.8.51',
  correlationId: 'c-9f1a4d',
  timestamp: '2026-08-05T09:42:00'
},
{
  id: 'aud-2',
  actor: 'S. Ndlovu',
  role: 'ProcessOwner',
  engine: 'OLTS',
  action: 'Escalated exception',
  entity: 'OLTS-2026-04411',
  change: 'Status Under Review → Escalated',
  ip: '10.24.9.14',
  correlationId: 'c-3b77e2',
  timestamp: '2026-08-05T09:05:00'
},
{
  id: 'aud-3',
  actor: 'K. Mutasa',
  role: 'Admin',
  engine: 'KRI',
  action: 'Amended threshold',
  entity: 'kri-8',
  change: 'Red threshold 12 → 10',
  ip: '10.24.4.90',
  correlationId: 'c-77ac10',
  timestamp: '2026-08-05T08:31:00'
},
{
  id: 'aud-4',
  actor: 'R. Chikafu',
  role: 'ProcessOwner',
  engine: 'Self Assessment',
  action: 'Saved draft response',
  entity: 'RCSA-2026-31',
  change: 'Completion 68% → 72%',
  ip: '10.24.11.7',
  correlationId: 'c-51de88',
  timestamp: '2026-08-05T08:12:00'
},
{
  id: 'aud-5',
  actor: 'N. Chapfika',
  role: 'Auditor',
  engine: 'Audit',
  action: 'Exported audit trail',
  entity: 'trail:2026-07',
  change: '2,418 records exported to CSV',
  ip: '10.24.2.33',
  correlationId: 'c-a0b4c9',
  timestamp: '2026-08-04T16:58:00'
},
{
  id: 'aud-6',
  actor: 'A. Marufu',
  role: 'ProcessOwner',
  engine: 'Process Flows',
  action: 'Submitted for review',
  entity: 'PRC-014',
  change: 'Status Approved → In Review (v3.5)',
  ip: '10.24.6.22',
  correlationId: 'c-6612fa',
  timestamp: '2026-08-04T15:20:00'
},
{
  id: 'aud-7',
  actor: 'M. Sibanda',
  role: 'RiskManager',
  engine: 'Risk Register',
  action: 'Created risk',
  entity: 'RSK-0142',
  change: 'New entry logged under Technology',
  ip: '10.24.7.61',
  correlationId: 'c-2ef930',
  timestamp: '2026-08-04T11:44:00'
},
{
  id: 'aud-8',
  actor: 'System',
  role: 'Admin',
  engine: 'KRI',
  action: 'Automated breach alert',
  entity: 'kri-5',
  change: 'Overdue AML alerts crossed red threshold (46)',
  ip: '—',
  correlationId: 'c-be4471',
  timestamp: '2026-08-04T06:00:00'
},
{
  id: 'aud-9',
  actor: 'P. Chirwa',
  role: 'ProcessOwner',
  engine: 'Self Assessment',
  action: 'Submitted assessment',
  entity: 'RCSA-2026-29',
  change: 'Status In Progress → Submitted',
  ip: '10.24.5.18',
  correlationId: 'c-cd7183',
  timestamp: '2026-08-03T17:10:00'
},
{
  id: 'aud-10',
  actor: 'F. Zhou',
  role: 'Staff',
  engine: 'OLTS',
  action: 'Viewed exception',
  entity: 'OLTS-2026-04270',
  change: 'Read-only access',
  ip: '10.24.12.44',
  correlationId: 'c-1a99b6',
  timestamp: '2026-08-03T14:02:00'
},
{
  id: 'aud-11',
  actor: 'N. Chapfika',
  role: 'Auditor',
  engine: 'Risk Register',
  action: 'Added assurance note',
  entity: 'RSK-0112',
  change: 'Assurance opinion attached',
  ip: '10.24.2.33',
  correlationId: 'c-40e5d1',
  timestamp: '2026-08-03T10:36:00'
},
{
  id: 'aud-12',
  actor: 'G. Nyathi',
  role: 'ProcessOwner',
  engine: 'Process Flows',
  action: 'Created draft',
  entity: 'PRC-003',
  change: 'Branch cash management v3.0 drafted',
  ip: '10.24.10.9',
  correlationId: 'c-83f2aa',
  timestamp: '2026-08-02T13:25:00'
}];


export const auditVolume = [
{ day: '30 Jul', events: 182 },
{ day: '31 Jul', events: 214 },
{ day: '01 Aug', events: 168 },
{ day: '02 Aug', events: 97 },
{ day: '03 Aug', events: 241 },
{ day: '04 Aug', events: 276 },
{ day: '05 Aug', events: 143 }];