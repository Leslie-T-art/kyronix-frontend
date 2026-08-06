import type { RiskEntry } from '../types';

export const riskEntries: RiskEntry[] = [
{
  id: 'RSK-0142',
  title: 'Core banking outage during month-end processing',
  category: 'Technology',
  inherentRating: 'Critical',
  residualRating: 'High',
  controls: '6',
  owner: 'IT Operations',
  unit: 'Technology',
  reviewDate: '2026-09-15',
  status: 'Mitigating',
  likelihood: 3,
  impact: 5,
  description:
  'Extended unavailability of the core banking platform during high-volume month-end runs, disrupting settlement and customer channels.'
},
{
  id: 'RSK-0138',
  title: 'Sanctions screening false negative on outward payments',
  category: 'Compliance',
  inherentRating: 'Critical',
  residualRating: 'High',
  controls: '4',
  owner: 'Financial Crime',
  unit: 'Compliance',
  reviewDate: '2026-08-22',
  status: 'Open',
  likelihood: 2,
  impact: 5,
  description:
  'Screening engine fails to flag a listed counterparty, exposing the bank to regulatory penalty and correspondent banking withdrawal.'
},
{
  id: 'RSK-0131',
  title: 'Concentration exposure to agricultural sector lending',
  category: 'Credit',
  inherentRating: 'High',
  residualRating: 'Medium',
  controls: '5',
  owner: 'Credit Risk',
  unit: 'Corporate Banking',
  reviewDate: '2026-10-01',
  status: 'Monitoring',
  likelihood: 3,
  impact: 4,
  description:
  'Portfolio concentration in seasonal agricultural exposures amplifies default correlation during drought cycles.'
},
{
  id: 'RSK-0127',
  title: 'Teller fraud through suspense account manipulation',
  category: 'Fraud',
  inherentRating: 'High',
  residualRating: 'Medium',
  controls: '7',
  owner: 'Operations Risk',
  unit: 'Retail Banking',
  reviewDate: '2026-08-18',
  status: 'Mitigating',
  likelihood: 2,
  impact: 4,
  description:
  'Unauthorised postings routed through suspense accounts and cleared before daily reconciliation.'
},
{
  id: 'RSK-0119',
  title: 'Third-party data centre service degradation',
  category: 'Outsourcing',
  inherentRating: 'High',
  residualRating: 'Medium',
  controls: '3',
  owner: 'Vendor Management',
  unit: 'Technology',
  reviewDate: '2026-09-05',
  status: 'Monitoring',
  likelihood: 3,
  impact: 3,
  description:
  'Hosting provider fails to meet contracted availability, with limited contractual remedy and no tested exit plan.'
},
{
  id: 'RSK-0112',
  title: 'Foreign currency liquidity shortfall',
  category: 'Liquidity',
  inherentRating: 'Critical',
  residualRating: 'High',
  controls: '5',
  owner: 'Treasury',
  unit: 'Treasury',
  reviewDate: '2026-08-12',
  status: 'Open',
  likelihood: 4,
  impact: 5,
  description:
  'Inability to source sufficient hard currency to meet customer demand and nostro obligations.'
},
{
  id: 'RSK-0104',
  title: 'Loss of key personnel in specialised risk functions',
  category: 'People',
  inherentRating: 'Medium',
  residualRating: 'Low',
  controls: '4',
  owner: 'Human Capital',
  unit: 'Human Capital',
  reviewDate: '2026-11-02',
  status: 'Monitoring',
  likelihood: 2,
  impact: 2,
  description:
  'Departure of scarce quantitative and compliance skills without documented succession cover.'
},
{
  id: 'RSK-0098',
  title: 'Branch physical security breach',
  category: 'Physical Security',
  inherentRating: 'Medium',
  residualRating: 'Low',
  controls: '6',
  owner: 'Security Services',
  unit: 'Operations',
  reviewDate: '2026-12-01',
  status: 'Closed',
  likelihood: 1,
  impact: 3,
  description:
  'Forced entry or armed robbery at a branch resulting in cash loss and staff harm.'
},
{
  id: 'RSK-0091',
  title: 'Inaccurate regulatory returns to RBZ',
  category: 'Regulatory',
  inherentRating: 'High',
  residualRating: 'Medium',
  controls: '4',
  owner: 'Finance',
  unit: 'Finance',
  reviewDate: '2026-08-29',
  status: 'Mitigating',
  likelihood: 3,
  impact: 4,
  description:
  'Manual consolidation steps in prudential returns introduce misstatement risk and regulatory censure.'
},
{
  id: 'RSK-0085',
  title: 'Mobile banking credential stuffing attack',
  category: 'Technology',
  inherentRating: 'High',
  residualRating: 'Medium',
  controls: '5',
  owner: 'Information Security',
  unit: 'Technology',
  reviewDate: '2026-09-20',
  status: 'Monitoring',
  likelihood: 4,
  impact: 3,
  description:
  'Reused customer credentials exploited at scale against the mobile channel authentication endpoint.'
}];
