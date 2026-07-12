import { cn } from '@/lib/utils';

/**
 * Responsive max-width container with centered content
 */
export default function Container({
  children,
  size = 'default',
  className,
  ...props
}) {
  const maxWidths = {
    sm: 'max-w-[700px]',
    default: 'max-w-[1400px] xl:max-w-[1500px]',
    lg: 'max-w-[1500px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        maxWidths[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
