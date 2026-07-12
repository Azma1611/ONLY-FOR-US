import { forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'bg-error text-white hover:bg-red-600',
  outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50',
};

const sizes = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
};

/**
 * Premium button component with ripple effect and variants
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    if (loading || disabled) return;

    // Ripple effect
    const button = buttonRef.current || ref?.current;
    if (button) {
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = 'ripple';
      
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    }

    onClick?.(e);
  };

  return (
    <motion.button
      ref={ref || buttonRef}
      type={type}
      className={cn(
        'btn',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        loading && 'cursor-wait',
        className
      )}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight className="w-4 h-4" />}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
