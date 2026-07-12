import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import useUIStore from '@/store/uiStore';
import authService from '@/services/authService';
import { ROUTES } from '@/config/constants';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useUIStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await authService.register(data.name, data.email, data.password);
      
      addToast({ 
        type: 'success', 
        title: 'Account created!', 
        message: response.message || 'Please check your email for a 6-digit verification code 💕' 
      });
      
      navigate(`/verify-email?email=${encodeURIComponent(response.email || data.email)}`);
    } catch (error) {
      console.error(error);
      addToast({
        type: 'error',
        title: 'Registration failed',
        message: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6] via-[#7C3AED] to-[#FF4D88]" />
        <div className="blob blob-pink w-96 h-96 bottom-0 left-0 opacity-20" />
        <div className="blob blob-purple w-80 h-80 top-1/4 right-0 opacity-20" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              className="text-7xl mb-8"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🏡
            </motion.div>
            <h2 className="text-4xl font-display font-bold mb-4">Build Your World</h2>
            <p className="text-lg text-white/80 max-w-md leading-relaxed">
              Create a private space where you and your partner can plan, grow, and make memories together.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[var(--bg-primary)] relative overflow-hidden">
        <div className="blob blob-purple w-64 h-64 -bottom-32 -right-32 opacity-10" />

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-6 md:mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white text-lg">💕</span>
            </div>
            <span className="font-display font-bold text-xl gradient-text">Only For Us</span>
          </Link>

          <div>
            <h1 className="text-display-md mb-1">Create Account</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Already have an account?{' '}
              <Link to={ROUTES.LOGIN} className="text-[var(--color-primary)] font-semibold hover:underline">
                Sign in
              </Link>
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full name"
                icon={User}
                error={errors.name?.message}
                {...register('name')}
              />
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
              <Input
                label="Confirm password"
                type="password"
                icon={Lock}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full"
                iconRight={ArrowRight}
              >
                Create Account
              </Button>
            </form>

            <p className="text-xs text-[var(--text-tertiary)] text-center mt-6">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[var(--color-primary)] hover:underline">Terms</a>{' '}
              and{' '}
              <a href="#" className="text-[var(--color-primary)] hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
