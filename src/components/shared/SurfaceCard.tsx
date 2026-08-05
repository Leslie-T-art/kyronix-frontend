import React from 'react';
import { cn } from '../../utils/cn';

interface SurfaceCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** The one generic content card. Border + background only — never elevation. */
export function SurfaceCard({
  title,
  description,
  action,
  footer,
  className,
  bodyClassName,
  children
}: SurfaceCardProps) {
  return (
    <section className={cn('rounded-xl border border-zinc-200 bg-white', className)}>
      {(title || action) &&
      <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-4">
          <div>
            {title && <h2 className="text-sm font-semibold text-navy">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-zinc-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      }
      <div className={cn('p-5', bodyClassName)}>{children}</div>
      {footer && <footer className="border-t border-zinc-200 px-5 py-3">{footer}</footer>}
    </section>);

}