import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  OctagonAlertIcon,
  XIcon } from
'lucide-react';
import { cn } from '../../utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  action?: React.ReactNode;
  dismissible?: boolean;
}

const STYLES: Record<AlertVariant, {wrap: string;icon: string;}> = {
  info: { wrap: 'border-navy-200 bg-navy-50 text-navy-800', icon: 'text-navy' },
  success: { wrap: 'border-green-200 bg-green-50 text-green-800', icon: 'text-green-700' },
  warning: { wrap: 'border-amber-200 bg-amber-50 text-amber-800', icon: 'text-amber-600' },
  error: { wrap: 'border-red-200 bg-red-50 text-red-800', icon: 'text-red-700' }
};

const ICONS: Record<AlertVariant, React.ComponentType<{className?: string;}>> = {
  info: InfoIcon,
  success: CheckCircle2Icon,
  warning: AlertTriangleIcon,
  error: OctagonAlertIcon
};

export function AlertBanner({
  variant = 'info',
  title,
  description,
  action,
  dismissible = false
}: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const Icon = ICONS[variant];
  const styles = STYLES[variant];

  return (
    <div
      role="status"
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3', styles.wrap)}>
      
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', styles.icon)} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-0.5 text-xs opacity-80">{description}</p>}
      </div>
      {action}
      {dismissible &&
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss notification"
        className="rounded-xl p-1 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
        
          <XIcon className="h-3.5 w-3.5" />
        </button>
      }
    </div>);

}