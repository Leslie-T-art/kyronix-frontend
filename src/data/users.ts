import type { User } from '../types';

/** Directory accounts returned by the Entra ID tenant after SSO. */
export const directoryUsers: User[] = [
{
  id: 'u-1',
  name: 'Tendai Mabhena',
  email: 'tmabhena@nmbbank.co.zw',
  role: 'RiskManager',
  unit: 'Operational Risk',
  initials: 'TM'
},
{
  id: 'u-2',
  name: 'Kudzai Mutasa',
  email: 'kmutasa@nmbbank.co.zw',
  role: 'Admin',
  unit: 'Technology',
  initials: 'KM'
},
{
  id: 'u-3',
  name: 'Nyasha Chapfika',
  email: 'nchapfika@nmbbank.co.zw',
  role: 'Auditor',
  unit: 'Internal Audit',
  initials: 'NC'
},
{
  id: 'u-4',
  name: 'Rutendo Chikafu',
  email: 'rchikafu@nmbbank.co.zw',
  role: 'ProcessOwner',
  unit: 'Retail Banking',
  initials: 'RC'
},
{
  id: 'u-5',
  name: 'Farai Zhou',
  email: 'fzhou@nmbbank.co.zw',
  role: 'Staff',
  unit: 'Kwekwe Branch',
  initials: 'FZ'
}];