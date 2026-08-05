import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MoreHorizontalIcon } from 'lucide-react';
import { createPortal } from 'react-dom';

export interface RowActionItem {
  key: string;
  label: string;
  icon: React.ComponentType<{className?: string;}>;
  tone?: 'default' | 'danger';
  onClick: () => void;
}

interface RowActionsMenuProps {
  open: boolean;
  onToggle: () => void;
  actions: RowActionItem[];
  ariaLabel: string;
}

export function RowActionsMenu({ open, onToggle, actions, ariaLabel }: RowActionsMenuProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{top: number;left: number;} | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 224;
    const viewportPadding = 12;
    const left = Math.min(
      Math.max(viewportPadding, rect.right - menuWidth),
      window.innerWidth - menuWidth - viewportPadding
    );
    const top = Math.min(rect.bottom + 8, window.innerHeight - 12);

    setPosition({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 224;
      const viewportPadding = 12;
      const left = Math.min(
        Math.max(viewportPadding, rect.right - menuWidth),
        window.innerWidth - menuWidth - viewportPadding
      );
      const top = Math.min(rect.bottom + 8, window.innerHeight - 12);
      setPosition({ top, left });
    };

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      onToggle();
    };

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('mousedown', handlePointerDown);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open, onToggle]);

  return (
    <div className="relative flex justify-end">
      <button
        ref={triggerRef}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        className="rounded-xl border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-navy"
        aria-label={ariaLabel}
      >
        <MoreHorizontalIcon className="h-4 w-4" />
      </button>

      {open && position &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[200] w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg"
            style={{ top: position.top, left: position.left }}
            onClick={(event) => event.stopPropagation()}
          >
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.key}
                  type="button"
                  onClick={action.onClick}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs hover:bg-zinc-50 ${
                    action.tone === 'danger' ? 'text-red-700' : 'text-zinc-700'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
