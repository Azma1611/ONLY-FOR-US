import { Link } from 'react-router';
import { Heart } from 'lucide-react';

/**
 * Reusable footer component
 */
export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-white text-xs">💕</span>
          </div>
          <span className="font-display font-bold gradient-text">Only For Us</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm text-[var(--text-tertiary)]">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">
            Contact
          </a>
        </div>

        {/* Copyright */}
        <p className="text-sm text-[var(--text-tertiary)] flex items-center gap-1">
          © {new Date().getFullYear()} Only For Us. Made with
          <Heart className="w-3.5 h-3.5 text-[var(--color-primary)] fill-[var(--color-primary)]" />
        </p>
      </div>
    </footer>
  );
}
