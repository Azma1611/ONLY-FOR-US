import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import authService from '@/services/authService';
import useUIStore from '@/store/uiStore';
import { ROUTES } from '@/config/constants';

const resetSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Password reset token is missing from the link URL.',
      });
    }
  }, [token, addToast]);

  const onSubmit = async (data) => {
    if (!token) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Password updated!',
        message: 'Your password has been changed. You can now log in.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Reset failed',
        message: error.response?.data?.message || 'Invalid or expired reset token.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,77,136,0.03) 0%, transparent 50%),
                            radial-gradient(circle at 20% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)`
        }}
      />
      <div className="blob blob-pink w-85 h-85 -top-20 -left-20 opacity-15" />
      <div className="blob blob-purple w-96 h-96 -bottom-32 -right-32 opacity-15" />

      <motion.div
        className="w-full max-w-[420px] relative z-10 glass-card p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {invalidToken ? (
            <motion.div
              key="invalid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8 text-[var(--color-error)]" />
              </div>
              <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">
                Invalid Reset Link
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                The link you followed is missing a verification token. Please request a new password reset.
              </p>
              <div className="pt-4">
                <Link to="/forgot-password" className="w-full">
                  <Button size="lg" className="w-full !rounded-xl">
                    Request New Link
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : !isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <h1 className="font-display font-bold text-[28px] tracking-[-0.02em] text-[var(--text-primary)]">
                  Reset Password
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Enter your new password below. Ensure it is strong and has at least 8 characters.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="New password"
                  type="password"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirm new password"
                  type="password"
                  icon={Lock}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full !rounded-xl mt-2"
                  iconRight={ArrowRight}
                >
                  Save New Password
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
              </div>

              <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">
                Password Reset!
              </h2>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Your password has been successfully updated. You can now log in using your new credentials.
              </p>

              <div className="pt-4">
                <Link to={ROUTES.LOGIN} className="w-full">
                  <Button size="lg" className="w-full !rounded-xl">
                    Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
