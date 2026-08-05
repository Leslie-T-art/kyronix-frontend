import React from 'react';
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { SemanticTone } from '../../types';

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  tone?: SemanticTone;
  sparkline?: number[];
  caption?: string;
}

const TONE_BAR: Record<SemanticTone, string> = {
  critical: 'bg-red-600',
  warning: 'bg-amber-500',
  success: 'bg-green-600',
  info: 'bg-navy',
  neutral: 'bg-zinc-300'
};

function Sparkline({ points, tone }: {points: number[];tone: SemanticTone;}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const path = points.
  map((point, index) => {
    const x = index / (points.length - 1) * 100;
    const y = 24 - (point - min) / range * 20;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).
  join(' ');

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-20" aria-hidden="true">
      <path
        d={path}
        fill="none"
        strokeWidth={2}
        className={cn(
          tone === 'critical' && 'stroke-red-600',
          tone === 'warning' && 'stroke-amber-500',
          tone === 'success' && 'stroke-green-600',
          (tone === 'info' || tone === 'neutral') && 'stroke-navy'
        )} />
      
    </svg>);

}

export function StatCard({ label, value, delta, tone = 'neutral', sparkline, caption }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  const DeltaIcon = positive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className={cn('h-1 w-full', TONE_BAR[tone])} />
      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <p className="tabular text-2xl font-semibold text-navy">{value}</p>
          {sparkline && <Sparkline points={sparkline} tone={tone} />}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {typeof delta === 'number' &&
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              positive ? 'text-red-700' : 'text-green-700'
            )}>
            
              <DeltaIcon className="h-3.5 w-3.5" />
              {Math.abs(delta)}%
            </span>
          }
          <span className="text-xs text-zinc-500">{caption ?? 'vs last month'}</span>
        </div>
      </div>
    </article>);

}