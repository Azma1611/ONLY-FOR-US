import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-[var(--color-primary-50)] text-[var(--color-primary)]',
  secondary: 'bg-[var(--color-secondary-50)] text-[var(--color-secondary)]',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[0.6875rem]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

/**
 * Badge component for status indicators and labels
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
