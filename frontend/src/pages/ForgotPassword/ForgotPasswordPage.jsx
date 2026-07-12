import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import authService from '@/services/authService';
import useUIStore from '@/store/uiStore';
import { ROUTES } from '@/config/constants';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Reset request sent',
        message: 'A password reset link has been dispatched if the email matches.',
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.message || 'Failed to request reset link. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6 py-12 relative overflow-hidden">
      {/* Mesh background patterns */}
      <div className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,77,136,0.03) 0%, transparent 50%),
                            radial-gradient(circle at 20% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)`
        }}
      />
      <div className="blob blob-purple w-80 h-80 -top-20 -left-20 opacity-15" />
      <div className="blob blob-pink w-96 h-96 -bottom-32 -right-32 opacity-15" />

      <motion.div
        className="w-full max-w-[420px] relative z-10 glass-card p-8 md:p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="text-center">
                <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm">💕</span>
                  </div>
                  <span className="font-display font-bold text-md gradient-text">Only For Us</span>
                </Link>
                <h1 className="font-display font-bold text-[28px] tracking-[-0.02em] text-[var(--text-primary)]">
                  Forgot Password?
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  No worries! Enter your email below, and we'll send you instructions to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  icon={Mail}
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  size="lg"
                  loading={loading}
                  className="w-full !rounded-xl"
                  iconRight={ArrowRight}
                >
                  Send Reset Link
                </Button>
              </form>

              {/* Footer */}
              <div className="text-center pt-2">
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-[var(--color-success)]" />
              </div>

              <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">
                Link Dispatched!
              </h2>
              
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
                If an account exists under that email, we've sent you a password reset link. Please check your inbox (and spam folder) shortly.
              </p>

              <div className="pt-4">
                <Link to={ROUTES.LOGIN} className="w-full">
                  <Button size="lg" className="w-full !rounded-xl">
                    Back to Sign In
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
