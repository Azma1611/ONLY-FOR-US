import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Glass card with hover lift effect and optional gradient border
 */
export default function Card({
  children,
  className,
  gradient = false,
  hover = true,
  padding = true,
  onClick,
  ...props
}) {
  return (
    <motion.div
      className={cn(
        'glass-card',
        padding && 'p-6 sm:p-8 md:p-10',
        gradient && 'gradient-border',
        hover && 'cursor-pointer',
        !hover && 'hover:transform-none hover:shadow-[var(--glass-shadow)]',
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={hover ? { y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.12)' } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Card Header sub-component
 */
export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

/**
 * Card Title sub-component
 */
export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-heading text-[var(--text-primary)]', className)}>
      {children}
    </h3>
  );
}

/**
 * Card Description sub-component
 */
export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-[var(--text-secondary)] mt-1', className)}>
      {children}
    </p>
  );
}

/**
 * Card Content sub-component
 */
export function CardContent({ children, className }) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}
