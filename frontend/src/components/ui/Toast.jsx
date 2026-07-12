import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import useUIStore from '@/store/uiStore';
import { cn } from '@/lib/utils';

const toastConfig = {
  success: {
    icon: CheckCircle,
    classes: 'border-l-4 border-l-[var(--color-success)]',
    iconClass: 'text-[var(--color-success)]',
  },
  error: {
    icon: AlertCircle,
    classes: 'border-l-4 border-l-[var(--color-error)]',
    iconClass: 'text-[var(--color-error)]',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'border-l-4 border-l-[var(--color-warning)]',
    iconClass: 'text-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    classes: 'border-l-4 border-l-[var(--color-info)]',
    iconClass: 'text-[var(--color-info)]',
  },
};

/**
 * Individual toast notification
 */
function Toast({ toast, onDismiss }) {
  const config = toastConfig[toast.type || 'info'];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        'glass-card flex items-start gap-3 p-4 pr-10 min-w-[320px] max-w-[420px] relative',
        config.classes
      )}
    >
      <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconClass)} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-[var(--text-primary)]">{toast.title}</p>
        )}
        <p className="text-sm text-[var(--text-secondary)]">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-3 right-3 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-[var(--color-primary)] rounded-full"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

/**
 * Toast container — renders all active toasts
 */
export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
