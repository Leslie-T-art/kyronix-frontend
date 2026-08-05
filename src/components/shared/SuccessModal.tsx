import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SuccessModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}

/** Confirmation modal shown after every successful capture. Closes itself. */
export function SuccessModal({
  open,
  title,
  description,
  onClose,
  duration = 2000
}: SuccessModalProps) {
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [open, onClose, duration]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}>
        
          <div className="absolute inset-0 bg-navy-900/40" aria-hidden="true" />
          <motion.div
          role="alertdialog"
          aria-live="assertive"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 text-center">
          
            <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 18 }}
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
            
              <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
                <motion.circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#15803d"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.45, ease: 'easeOut' }} />
              
                <motion.path
                d="M13 20.5l5 5 9-10"
                fill="none"
                stroke="#15803d"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: 'easeOut' }} />
              
              </svg>
            </motion.span>

            <h2 className="mt-4 text-sm font-semibold text-navy">{title}</h2>
            {description && <p className="mt-1.5 text-xs text-zinc-500">{description}</p>}

            <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
              <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }} />
            
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}