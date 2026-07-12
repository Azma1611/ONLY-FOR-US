import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/config/constants';

/**
 * Premium 404 Not Found page
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden px-6">
      {/* Background blobs */}
      <div className="blob blob-pink w-[400px] h-[400px] -top-40 -left-40 opacity-20" />
      <div className="blob blob-purple w-[500px] h-[500px] -bottom-40 -right-40 opacity-15" style={{ animationDelay: '3s' }} />

      <motion.div
        className="text-center relative z-10 max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated 404 */}
        <motion.div
          className="mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <h1 className="text-[8rem] sm:text-[10rem] font-display font-black leading-none gradient-text select-none">
            404
          </h1>
        </motion.div>

        {/* Heart decoration */}
        <motion.div
          className="text-4xl mb-6"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          💔
        </motion.div>

        <h2 className="text-display-md mb-3">
          Page not <span className="gradient-text">found</span>
        </h2>
        <p className="text-lg text-[var(--text-secondary)] mb-10 leading-relaxed">
          Looks like this page wandered off. Don't worry — your partner is still waiting for you back home.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to={ROUTES.HOME}>
            <Button size="lg" icon={Home}>
              Go Home
            </Button>
          </Link>
          <Button variant="secondary" size="lg" icon={ArrowLeft} onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
