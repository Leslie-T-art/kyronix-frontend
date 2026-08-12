import {
  ActivityIcon,
  BellIcon,
  Building2Icon,
  BuildingIcon,
  CalendarRangeIcon,
  CircleDollarSignIcon,
  ClipboardCheckIcon,
  CoinsIcon,
  DatabaseIcon,
  FileSearchIcon,
  GaugeIcon,
  KeyRoundIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TagsIcon,
  UsersIcon,
  WalletIcon,
  WorkflowIcon,
  WrenchIcon
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { EngineKey } from '../../types';

export interface NavItem {
  type: 'item';
  key: EngineKey;
  label: string;
  to: string;
  icon: ComponentType<{className?: string;}>;
}

export interface NavGroup {
  type: 'group';
  key: 'systemConfigurations';
  label: string;
  icon: ComponentType<{className?: string;}>;
  children: NavItem[];
}

export type NavigationEntry = NavItem | NavGroup;

export const SYSTEM_CONFIGURATION_ITEMS: NavItem[] = [
  { type: 'item', key: 'departments', label: 'Departments', to: '/departments', icon: Building2Icon },
  { type: 'item', key: 'branches', label: 'Branches', to: '/branches', icon: BuildingIcon },
  { type: 'item', key: 'events', label: 'Events', to: '/events', icon: CalendarRangeIcon },
  { type: 'item', key: 'lossCategories', label: 'Loss Categories', to: '/loss-categories', icon: CircleDollarSignIcon },
  { type: 'item', key: 'users', label: 'Users', to: '/users', icon: UsersIcon },
  { type: 'item', key: 'rolesConfig', label: 'Roles configuration', to: '/roles-configuration', icon: KeyRoundIcon },
  { type: 'item', key: 'eventStatuses', label: 'Event Status', to: '/system-configurations/event-statuses', icon: ListChecksIcon },
  { type: 'item', key: 'residualRisks', label: 'Residual Risk', to: '/system-configurations/residual-risks', icon: ShieldCheckIcon },
  { type: 'item', key: 'actionStatuses', label: 'Action Status', to: '/system-configurations/action-statuses', icon: TagsIcon },
  { type: 'item', key: 'recoveryMethods', label: 'Recovery Method', to: '/system-configurations/recovery-methods', icon: WrenchIcon },
  { type: 'item', key: 'rootCauses', label: 'Root Cause', to: '/system-configurations/root-causes', icon: WorkflowIcon },
  { type: 'item', key: 'baselEventCategories', label: 'Basel Event Categories', to: '/system-configurations/basel-event-categories', icon: LandmarkIcon },
  { type: 'item', key: 'dataSources', label: 'Data Source', to: '/system-configurations/data-sources', icon: DatabaseIcon },
  { type: 'item', key: 'validationResults', label: 'Validation Result', to: '/system-configurations/validation-results', icon: ShieldAlertIcon },
  { type: 'item', key: 'controls', label: 'Controls', to: '/system-configurations/controls', icon: ClipboardCheckIcon },
  { type: 'item', key: 'currencies', label: 'Currency', to: '/system-configurations/currencies', icon: CoinsIcon }
];

export const NAV_ITEMS: NavigationEntry[] = [
  { type: 'item', key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboardIcon },
  { type: 'item', key: 'notifications', label: 'Notifications', to: '/notifications', icon: BellIcon },
  {
    type: 'group',
    key: 'systemConfigurations',
    label: 'System configurations',
    icon: WalletIcon,
    children: SYSTEM_CONFIGURATION_ITEMS
  },
  { type: 'item', key: 'olts', label: 'OLTS', to: '/olts', icon: ActivityIcon },
  { type: 'item', key: 'audit', label: 'Audit', to: '/audit', icon: FileSearchIcon },
  { type: 'item', key: 'kri', label: 'KRI', to: '/kri', icon: GaugeIcon },
  { type: 'item', key: 'riskRegister', label: 'Risk Register', to: '/risk-register', icon: ShieldAlertIcon },
  { type: 'item', key: 'processFlows', label: 'Process Flows', to: '/process-flows', icon: WorkflowIcon },
  {
    type: 'item',
    key: 'selfAssessment',
    label: 'Self Assessment',
    to: '/self-assessment',
    icon: ClipboardCheckIcon
  }
];

export const NMB_LOGO = '/download_(1).png';
