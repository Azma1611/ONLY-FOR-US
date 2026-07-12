import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import OtpInput from '@/components/ui/OtpInput';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import authService from '@/services/authService';
import { ROUTES } from '@/config/constants';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  // Get email from URL params or store
  const emailParam = searchParams.get('email') || '';
  const email = emailParam || user?.email || '';

  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  
  // Expiry Timer (10 minutes = 600 seconds)
  const [expiryTime, setExpiryTime] = useState(600);
  // Resend Cooldown (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const expiryTimerRef = useRef(null);
  const cooldownTimerRef = useRef(null);

  // Mask email helper (e.g. asuyaso2016@gmail.com -> asu****@gmail.com)
  const getMaskedEmail = (emailStr) => {
    if (!emailStr) return '';
    const [local, domain] = emailStr.split('@');
    if (!local || !domain) return emailStr;
    if (local.length <= 3) {
      return `${local.charAt(0)}***@${domain}`;
    }
    return `${local.slice(0, 3)}***@${domain}`;
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 10-minute expiry countdown
  useEffect(() => {
    expiryTimerRef.current = setInterval(() => {
      setExpiryTime((prev) => {
        if (prev <= 1) {
          clearInterval(expiryTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, []);

  // 60-second resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, [resendCooldown]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter the complete 6-digit verification code.',
      });
      return;
    }

    if (expiryTime === 0) {
      addToast({
        type: 'error',
        title: 'Code Expired',
        message: 'The verification code has expired. Please request a new one.',
      });
      return;
    }

    setVerifying(true);
    try {
      const response = await authService.verifyEmail(email, otp);
      const { user, accessToken, refreshToken } = response.data;
      
      // Update state with user and tokens issued upon successful verification
      login(user, accessToken, refreshToken);
      
      addToast({
        type: 'success',
        title: 'Account verified!',
        message: 'Your email has been verified successfully. Welcome to Only For Us! 💕',
      });
      
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Verification failed',
        message: error.response?.data?.message || 'Invalid or expired verification code.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;

    setResending(true);
    try {
      const response = await authService.resendOTP(email);
      addToast({
        type: 'success',
        title: 'Code resent!',
        message: response.message || 'A new 6-digit verification code has been sent.',
      });
      
      // Reset expiry timer to 10 minutes and start 60s cooldown
      setExpiryTime(600);
      setResendCooldown(60);
      setOtp('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Resend failed',
        message: error.response?.data?.message || 'Failed to resend code. Please try again.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-6 py-12 relative overflow-hidden">
      {/* Premium Visual Blobs */}
      <div className="absolute inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,77,136,0.03) 0%, transparent 50%),
                            radial-gradient(circle at 20% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)`
        }}
      />
      <div className="blob blob-pink w-80 h-80 -top-20 -left-20 opacity-15" />
      <div className="blob blob-purple w-96 h-96 -bottom-32 -right-32 opacity-15" />

      <motion.div
        className="w-full max-w-[420px] relative z-10 glass-card p-8 md:p-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-50)] dark:bg-pink-950/30 flex items-center justify-center mx-auto mb-6 shadow-glow-pink">
          <Mail className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
        </div>

        <h1 className="font-display font-bold text-[28px] tracking-[-0.02em] text-[var(--text-primary)] mb-3">
          Verify Your Email
        </h1>
        
        <p className="text-sm text-[var(--text-secondary)] mb-2 max-w-sm mx-auto">
          We've sent a verification code to your email
        </p>

        {email && (
          <div className="inline-block bg-[var(--bg-tertiary)] border border-[var(--border-color)] px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)] mb-6">
            {getMaskedEmail(email)}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <OtpInput value={otp} onChange={setOtp} />

          {/* Expiry Counter */}
          <div className="flex items-center justify-center gap-1.5 text-sm font-semibold">
            {expiryTime > 0 ? (
              <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                Code expires in: 
                <span className="text-[var(--color-primary)] font-mono">{formatTime(expiryTime)}</span>
              </span>
            ) : (
              <span className="text-[var(--color-error)] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Code expired. Please request a new one.
              </span>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            loading={verifying}
            className="w-full !rounded-xl"
            disabled={otp.length !== 6 || expiryTime === 0}
            iconRight={ArrowRight}
          >
            Verify Account
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[var(--border-color)] flex flex-col gap-4 items-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || resendCooldown > 0}
            className="text-sm text-[var(--color-primary)] hover:underline font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              'Resend verification code'
            )}
          </button>

          {!isAuthenticated && (
            <Link
              to={ROUTES.LOGIN}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 mt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
