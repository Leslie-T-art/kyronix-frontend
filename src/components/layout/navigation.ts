import {
  ClipboardCheckIcon,
  FileSearchIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  ShieldAlertIcon,
  ActivityIcon,
  WorkflowIcon,
  BellIcon } from
'lucide-react';
import type { ComponentType } from 'react';
import type { EngineKey } from '../../types';

export interface NavItem {
  key: EngineKey;
  label: string;
  to: string;
  icon: ComponentType<{className?: string;}>;
}

export const NAV_ITEMS: NavItem[] = [
{ key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboardIcon },
{ key: 'notifications', label: 'Notifications', to: '/notifications', icon: BellIcon },
{ key: 'olts', label: 'OLTS', to: '/olts', icon: ActivityIcon },
{ key: 'audit', label: 'Audit', to: '/audit', icon: FileSearchIcon },
{ key: 'kri', label: 'KRI', to: '/kri', icon: GaugeIcon },
{ key: 'riskRegister', label: 'Risk Register', to: '/risk-register', icon: ShieldAlertIcon },
{ key: 'processFlows', label: 'Process Flows', to: '/process-flows', icon: WorkflowIcon },
{
  key: 'selfAssessment',
  label: 'Self Assessment',
  to: '/self-assessment',
  icon: ClipboardCheckIcon
}];


export const NMB_LOGO = "/download_(1).png";