import { motion } from 'framer-motion';

/**
 * Page wrapper with animated transitions and floating background blobs
 */
export default function PageWrapper({ children, className }) {
  return (
    <motion.main
      className={`relative min-h-[calc(100vh-4rem)] ${className || ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Subtle background gradient mesh */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none opacity-60 z-0" />

      {/* Page content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.main>
  );
}
