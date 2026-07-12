import { cn } from '@/lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-[0.625rem]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

/**
 * Avatar component with image support, initials fallback, and gradient background
 */
export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  className,
  ...props
}) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden',
        'gradient-primary',
        sizes[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-white select-none">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}
