import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import authService from '@/services/authService';
import { ROUTES } from '@/config/constants';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.login(data.email, data.password);
      const { user, accessToken, refreshToken } = response.data;
      
      login(user, accessToken, refreshToken);
      addToast({ 
        type: 'success', 
        title: 'Welcome back!', 
        message: `Good to see you, ${user.name} 💕` 
      });

      if (!user.emailVerified) {
        navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    } catch (error) {
      console.error(error);
      const isUnverified = error.response && error.response.status === 403 && error.response.data?.emailVerified === false;
      
      if (isUnverified) {
        addToast({
          type: 'warning',
          title: 'Email not verified',
          message: 'Please verify your email address to continue.',
        });
        const unverifiedEmail = error.response.data.email || data.email;
        navigate(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
      } else {
        addToast({
          type: 'error',
          title: 'Login failed',
          message: error.response?.data?.message || 'Invalid credentials.',
        });
      }
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)]">

      {/* ==================== LEFT PANEL — Branding ==================== */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] relative overflow-hidden flex-shrink-0">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF4D88] via-[#8B5CF6] to-[#6D28D9]" />

        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), 
                              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)`
          }}
        />

        {/* Decorative floating shapes */}
        <div className="absolute w-64 h-64 rounded-full border border-white/10 -top-20 -left-20" />
        <div className="absolute w-48 h-48 rounded-full border border-white/10 bottom-20 -right-10" />
        <div className="absolute w-32 h-32 rounded-full bg-white/5 top-1/3 right-12" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10 xl:p-12">
          {/* Top — Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center transition-transform group-hover:scale-105">
              <span className="text-white text-sm">💕</span>
            </div>
            <span className="font-display font-bold text-lg text-white/90">Only For Us</span>
          </Link>

          {/* Center — Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-5"
          >
            <motion.div
              className="text-5xl xl:text-6xl"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              💕
            </motion.div>
            <h2 className="font-display font-bold text-[32px] xl:text-[36px] leading-tight text-white tracking-[-0.02em]">
              Welcome back
            </h2>
            <p className="text-base text-white/70 max-w-sm leading-relaxed">
              Your partner is waiting. Pick up right where you left off — your shared world is just a login away.
            </p>
          </motion.div>

          {/* Bottom — Testimonial / Trust badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10"
          >
            <p className="text-sm text-white/80 leading-relaxed italic">
              "Only For Us completely changed how we manage our relationship. It's our digital home."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs">
                ✨
              </div>
              <div>
                <div className="text-sm font-semibold text-white/90">Sarah & James</div>
                <div className="text-xs text-white/50">Together since 2023</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ==================== RIGHT PANEL — Login Form ==================== */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12 relative overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 20%, rgba(255,77,136,0.03) 0%, transparent 50%),
                              radial-gradient(circle at 30% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)`
          }}
        />

        <motion.div
          className="w-full max-w-[420px] relative z-10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white text-sm">💕</span>
              </div>
              <span className="font-display font-bold text-lg gradient-text">Only For Us</span>
            </Link>
          </div>

          {/* Back to home - desktop only */}
          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-[28px] sm:text-[32px] tracking-[-0.02em] text-[var(--text-primary)]">
              Sign in to your account
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Don't have an account?{' '}
              <Link to={ROUTES.REGISTER} className="text-[var(--color-primary)] font-semibold hover:underline">
                Create one free
              </Link>
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

            <Input
              label="Password"
              type="password"
              icon={Lock}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[var(--border-color)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[var(--color-primary)] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              className="w-full !rounded-xl"
              iconRight={ArrowRight}
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-[var(--border-color)]" />
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-widest font-medium">or</span>
            <div className="flex-1 h-px bg-[var(--border-color)]" />
          </div>

          {/* Social login */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" size="md" className="w-full !rounded-xl">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </Button>
            <Button variant="secondary" size="md" className="w-full !rounded-xl">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </Button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-[var(--text-tertiary)] text-center mt-8 leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-[var(--text-secondary)]">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-[var(--text-secondary)]">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
