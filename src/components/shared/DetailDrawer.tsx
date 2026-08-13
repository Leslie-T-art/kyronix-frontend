import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';

type DrawerWidth = 'md' | 'lg' | 'xl';

const WIDTHS: Record<DrawerWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl'
};

interface DetailDrawerProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  width?: DrawerWidth;
  children: React.ReactNode;
}

export function DetailDrawer({
  open,
  title,
  subtitle,
  onClose,
  headerActions,
  footer,
  width = 'md',
  children
}: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-navy-900/40"
        onClick={onClose}
        aria-hidden="true" />
      
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative m-3 flex h-[calc(100%-1.5rem)] w-full ${WIDTHS[width]} animate-[slideIn_180ms_ease-out] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white`}>
        
        <header className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-navy">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-xl p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
              
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="border-t border-zinc-200 px-5 py-3">{footer}</footer>}
      </aside>
    </div>);

}

export function DetailRow({ label, children }: {label: string;children: React.ReactNode;}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 py-2.5 last:border-0">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="text-right text-xs font-medium text-navy">{children}</dd>
    </div>);

}
