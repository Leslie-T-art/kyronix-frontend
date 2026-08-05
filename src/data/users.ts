import type { User } from '../types';

/** Directory accounts returned by the Entra ID tenant after SSO. */
export const directoryUsers: User[] = [
{
  id: 'u-1',
  name: 'Tendai Mabhena',
  email: 'tmabhena@nmbbank.co.zw',
  username: 'tmabhena',
  role: 'RiskManager',
  unit: 'Operational Risk',
  initials: 'TM',
  backendRoles: ['RISK_MANAGER'],
  permissions: []
},
{
  id: 'u-2',
  name: 'Kudzai Mutasa',
  email: 'kmutasa@nmbbank.co.zw',
  username: 'kmutasa',
  role: 'Admin',
  unit: 'Technology',
  initials: 'KM',
  backendRoles: ['SYSTEM_ADMIN'],
  permissions: ['ADMIN_REFERENCE_DATA', 'ADMIN_USERS']
},
{
  id: 'u-2a',
  name: 'Anesu Head',
  email: 'ahead@nmbbank.co.zw',
  username: 'ahead',
  role: 'Head',
  unit: 'Risk Oversight',
  initials: 'AH',
  backendRoles: ['HEAD'],
  permissions: []
},
{
  id: 'u-3',
  name: 'Nyasha Chapfika',
  email: 'nchapfika@nmbbank.co.zw',
  username: 'nchapfika',
  role: 'Auditor',
  unit: 'Internal Audit',
  initials: 'NC',
  backendRoles: ['AUDITOR'],
  permissions: []
},
{
  id: 'u-4',
  name: 'Rutendo Chikafu',
  email: 'rchikafu@nmbbank.co.zw',
  username: 'rchikafu',
  role: 'ProcessOwner',
  unit: 'Retail Banking',
  initials: 'RC',
  backendRoles: ['PROCESS_OWNER'],
  permissions: []
},
{
  id: 'u-5',
  name: 'Farai Zhou',
  email: 'fzhou@nmbbank.co.zw',
  username: 'fzhou',
  role: 'Staff',
  unit: 'Kwekwe Branch',
  initials: 'FZ',
  backendRoles: ['STAFF'],
  permissions: []
}];
