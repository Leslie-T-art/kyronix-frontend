import React from 'react';
import { cn } from '../../utils/cn';
import type { SemanticTone } from '../../types';

/**
 * Single source of truth for status → colour. Red / amber / green are reserved
 * for error, warning and success. Everything else is navy or zinc.
 */
const STATUS_TONE: Record<string, SemanticTone> = {
  // shared
  Open: 'warning',
  Closed: 'success',
  Resolved: 'success',
  Escalated: 'critical',
  'Under Review': 'info',
  Mitigating: 'info',
  Monitoring: 'neutral',
  // ratings
  Low: 'success',
  Medium: 'warning',
  High: 'critical',
  Critical: 'critical',
  // KRI
  Green: 'success',
  Amber: 'warning',
  Red: 'critical',
  // process flows
  Draft: 'neutral',
  DRAFT: 'neutral',
  'In Review': 'info',
  PENDING_AUTHORIZATION: 'warning',
  Approved: 'success',
  APPROVED: 'success',
  REJECTED: 'critical',
  RETURNED_FOR_CORRECTION: 'warning',
  Expired: 'critical',
  // self assessment
  'Not Started': 'neutral',
  'In Progress': 'info',
  Submitted: 'success',
  Overdue: 'critical',
  Active: 'success',
  Inactive: 'neutral',
  Locked: 'critical',
  Unlocked: 'success'
};

const TONE_CLASS: Record<SemanticTone, string> = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  info: 'bg-navy-50 text-navy-700 border-navy-200',
  neutral: 'bg-zinc-100 text-zinc-600 border-zinc-200'
};

const DOT_CLASS: Record<SemanticTone, string> = {
  critical: 'bg-red-600',
  warning: 'bg-amber-500',
  success: 'bg-green-600',
  info: 'bg-navy',
  neutral: 'bg-zinc-400'
};

interface StatusBadgeProps {
  status: string;
  tone?: SemanticTone;
  withDot?: boolean;
}

export function StatusBadge({ status, tone, withDot = true }: StatusBadgeProps) {
  const resolved: SemanticTone = tone ?? STATUS_TONE[status] ?? 'neutral';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-medium',
        TONE_CLASS[resolved]
      )}>
      
      {withDot && <span className={cn('h-1.5 w-1.5 rounded-full', DOT_CLASS[resolved])} />}
      {status}
    </span>);

}
