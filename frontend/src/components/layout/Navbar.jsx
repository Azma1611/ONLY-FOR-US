import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { ROUTES } from '@/config/constants';

/**
 * Public-facing navigation bar for unauthenticated pages (Landing)
 */
export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-3 flex justify-center"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div
        className={`w-full max-w-7xl flex items-center justify-between rounded-2xl px-6 h-[56px] lg:h-[60px] transition-all duration-300 ${
          scrolled
            ? 'glass shadow-lg'
            : 'bg-transparent'
        }`}
      >
        {/* Logo and Nav links grouped */}
        <div className="flex items-center gap-10 lg:gap-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white text-xs">💕</span>
            </div>
            <span className="font-display font-extrabold text-lg gradient-text">
              Only For Us
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7 lg:gap-9">
            <a href="#features" className="text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              How It Works
            </a>
            <a href="#faq" className="text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              FAQ
            </a>
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle compact />
          <Link to={ROUTES.LOGIN}>
            <Button variant="ghost" size="sm" className="rounded-full">Log in</Button>
          </Link>
          <Link to={ROUTES.REGISTER}>
            <Button size="sm" iconRight={ArrowRight} className="rounded-full">Get Started</Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden mt-2 mx-4 glass rounded-2xl p-4 space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <a href="#features" className="block px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="block px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors" onClick={() => setMobileOpen(false)}>
            How It Works
          </a>
          <a href="#faq" className="block px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors" onClick={() => setMobileOpen(false)}>
            FAQ
          </a>
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
            <ThemeToggle compact />
            <Link to={ROUTES.LOGIN} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">Log in</Button>
            </Link>
            <Link to={ROUTES.REGISTER} className="flex-1">
              <Button size="sm" className="w-full">Sign up</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
