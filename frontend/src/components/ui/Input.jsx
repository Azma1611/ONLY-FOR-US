import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Premium input with floating label, validation states, and glassmorphism
 */
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  success,
  icon: Icon,
  className,
  containerClassName,
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('relative w-full', containerClassName)}>
      <div className="relative">
        {/* Icon prefix */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Icon className={cn(
              'w-4.5 h-4.5 transition-colors',
              focused ? 'text-[var(--color-primary)]' : 'text-[var(--text-tertiary)]',
              error && 'text-[var(--color-error)]'
            )} />
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={cn(
            'glass-input w-full px-4 py-3 text-[15px] text-[var(--text-primary)] rounded-xl',
            'placeholder:text-[var(--text-tertiary)]',
            'transition-all duration-200',
            Icon && 'pl-10',
            isPassword && 'pr-10',
            error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]',
            success && 'border-[var(--color-success)] focus:border-[var(--color-success)]',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          placeholder={label}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        )}

        {/* Validation icon */}
        {!isPassword && (error || success) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-4.5 h-4.5 text-[var(--color-error)]" />
            ) : (
              <CheckCircle className="w-4.5 h-4.5 text-[var(--color-success)]" />
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 text-xs text-[var(--color-error)] font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
