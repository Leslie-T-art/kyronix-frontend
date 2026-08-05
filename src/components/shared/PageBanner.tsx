import React from 'react';
import { cn } from '../../utils/cn';

interface PageBannerProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
  action?: React.ReactNode;
  variant?: 'navy' | 'gold' | 'plain';
}

/** Every page opens with this banner. No page renders its own header markup. */
export function PageBanner({
  title,
  subtitle,
  breadcrumb,
  action,
  variant = 'navy'
}: PageBannerProps) {
  const isSolid = variant === 'navy' || variant === 'gold';

  return (
    <header
      className={cn(
        'flex flex-col gap-4 rounded-xl border px-6 py-5 sm:flex-row sm:items-center sm:justify-between',
        variant === 'navy' && 'border-navy bg-navy text-white',
        variant === 'gold' && 'border-gold bg-gold text-white',
        variant === 'plain' && 'border-zinc-200 bg-white text-navy'
      )}>
      
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length > 0 &&
        <nav aria-label="Breadcrumb" className="mb-1">
            <ol className="flex flex-wrap items-center gap-1 text-xs">
              {breadcrumb.map((crumb, index) =>
            <li key={crumb} className="flex items-center gap-1">
                  {index > 0 &&
              <span className={isSolid ? 'text-white/40' : 'text-zinc-300'}>/</span>
              }
                  <span className={isSolid ? 'text-white/70' : 'text-zinc-500'}>{crumb}</span>
                </li>
            )}
            </ol>
          </nav>
        }
        <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
        {subtitle &&
        <p className={cn('mt-1 text-sm', isSolid ? 'text-white/70' : 'text-zinc-500')}>
            {subtitle}
          </p>
        }
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>);

}