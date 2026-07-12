import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Branded loading spinner with gradient
 */
export function Spinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-[var(--border-color)]',
        'border-t-[var(--color-primary)] animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Full-page loading screen with branded animation
 */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]">
      {/* Floating blobs in background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob blob-pink w-72 h-72 top-1/4 left-1/4" />
        <div className="blob blob-purple w-96 h-96 bottom-1/4 right-1/4" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Heart icon */}
        <motion.div
          className="text-5xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          💕
        </motion.div>

        {/* App name */}
        <h1 className="text-display-md gradient-text">Only For Us</h1>

        {/* Spinner */}
        <Spinner size="md" />
      </motion.div>
    </div>
  );
}

/**
 * Skeleton loading block
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('skeleton', className)}
      {...props}
    />
  );
}

/**
 * Skeleton card for loading states
 */
export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export default Spinner;
