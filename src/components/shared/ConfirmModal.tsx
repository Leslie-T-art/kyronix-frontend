import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  tone?: 'danger' | 'default';
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  tone = 'default',
  onConfirm,
  onClose
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-navy-900/40" aria-hidden="true" onClick={busy ? undefined : onClose} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-xl p-3 ${tone === 'danger' ? 'bg-red-50' : 'bg-amber-50'}`}>
                <AlertTriangleIcon className={`h-5 w-5 ${tone === 'danger' ? 'text-red-700' : 'text-amber-600'}`} />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-navy">{title}</h2>
                {description && <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{description}</p>}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button
                variant={tone === 'danger' ? 'danger' : 'primary'}
                size="sm"
                onClick={onConfirm}
                disabled={busy}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
