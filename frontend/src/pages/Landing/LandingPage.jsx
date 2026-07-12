import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Heart, Calendar, Target, Flame, Wallet, MessageCircle,
  Camera, BookOpen, ArrowRight, Sparkles, Shield, Zap,
  Users, ChevronDown, Check,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ROUTES } from '@/config/constants';

const features = [
  { icon: Calendar, title: 'Shared Calendar', desc: 'Events, birthdays, anniversaries, and date nights — always in sync.', color: '#FF4D88' },
  { icon: Target, title: 'Goals Together', desc: 'Set individual and shared goals. Celebrate milestones together.', color: '#8B5CF6' },
  { icon: Flame, title: 'Habit Tracker', desc: 'Build healthy habits together. Track streaks and earn badges.', color: '#F59E0B' },
  { icon: MessageCircle, title: 'Private Chat', desc: 'Real-time messaging with read receipts, reactions, and voice notes.', color: '#3B82F6' },
  { icon: Wallet, title: 'Finance Manager', desc: 'Track income, expenses, savings, and budgets as a couple.', color: '#10B981' },
  { icon: Camera, title: 'Memory Gallery', desc: 'Store photos, videos, love letters, and voice notes in your timeline.', color: '#EC4899' },
  { icon: BookOpen, title: 'Daily Journal', desc: 'Reflect on your day, track moods, and grow together.', color: '#7C3AED' },
  { icon: Sparkles, title: 'AI Assistant', desc: 'Smart suggestions for dates, gifts, meals, and relationship insights.', color: '#06B6D4' },
];

const stats = [
  { number: '20+', label: 'Modules' },
  { number: '∞', label: 'Memories' },
  { number: '100%', label: 'Private' },
  { number: '24/7', label: 'Together' },
];

/**
 * Premium SaaS landing page — professional layout for laptop+ viewports
 * All sections use max-w-[1120px] to leave ~80px breathing room on a 1280px viewport
 */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden">

      {/* ========== NAVBAR ========== */}
      <Navbar />

      {/* ========== HERO ========== */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Background blobs */}
        <div className="blob blob-pink w-[500px] h-[500px] -top-32 -left-32 opacity-20" />
        <div className="blob blob-purple w-[600px] h-[600px] top-1/4 -right-48 opacity-15" style={{ animationDelay: '2s' }} />
        <div className="blob blob-blue w-[400px] h-[400px] bottom-0 left-1/3 opacity-10" style={{ animationDelay: '4s' }} />

        <div className="w-full max-w-[1120px] mx-auto px-8 lg:px-10 text-center relative z-10 pt-32 pb-20">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Heart className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">Built for couples who build together</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-display font-extrabold text-[40px] sm:text-[52px] md:text-[60px] lg:text-[68px] leading-[1.05] tracking-[-0.03em]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your entire life together,
            <span className="block mt-1 gradient-text">in one place.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto mt-6 leading-relaxed text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Plan, track, chat, save, and grow — all in a beautiful
            private space designed exclusively for the two of you.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link to={ROUTES.REGISTER}>
              <Button size="xl" iconRight={ArrowRight}>
                Start Your Journey — Free
              </Button>
            </Link>
            <a href="#features">
              <Button variant="secondary" size="xl">
                See Features
              </Button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 mt-16 lg:mt-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold leading-none gradient-text font-display">{stat.number}</div>
                <div className="text-xs font-medium text-[var(--text-tertiary)] mt-1.5 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-5 h-5 text-[var(--text-tertiary)]" />
          </motion.div>
        </div>
      </motion.section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-[1120px] mx-auto px-8 lg:px-10">
          {/* Section header */}
          <motion.div
            className="text-center mb-14 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-3 block">Features</span>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] lg:text-[44px] leading-tight tracking-[-0.02em] mb-4">
              Everything you need,{' '}
              <span className="gradient-text">nothing you don't.</span>
            </h2>
            <p className="text-[15px] sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              Replace dozens of apps with one beautiful platform designed for couples.
            </p>
          </motion.div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  className="glass-card p-6 rounded-2xl group h-full flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 flex-shrink-0"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-display font-semibold text-[16px] leading-snug mb-2 text-[var(--text-primary)]">{feature.title}</h3>
                  <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] leading-relaxed mt-auto">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-[var(--bg-tertiary)]">
        <div className="max-w-[900px] mx-auto px-8 lg:px-10">
          <motion.div
            className="text-center mb-14 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)] mb-3 block">How It Works</span>
            <h2 className="font-display font-bold text-[28px] sm:text-[36px] lg:text-[44px] leading-tight tracking-[-0.02em]">
              Get started in{' '}
              <span className="gradient-text">3 simple steps.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '01', icon: Users, title: 'Create Your Account', desc: 'Sign up with your email. It takes less than a minute.' },
              { step: '02', icon: Heart, title: 'Invite Your Partner', desc: 'Share your unique invitation code. Once they join, your private space is ready.' },
              { step: '03', icon: Zap, title: 'Start Building Together', desc: 'Set goals, track habits, manage finances, and create beautiful memories.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card p-6 lg:p-8 rounded-2xl text-center h-full flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="text-3xl font-display font-bold gradient-text mb-4">{item.step}</div>
                <item.icon className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-4 flex-shrink-0" />
                <h3 className="font-display font-semibold text-lg leading-snug mb-2 text-[var(--text-primary)]">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mt-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECURITY ========== */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[800px] mx-auto px-8 lg:px-10">
          <motion.div
            className="glass-card p-8 sm:p-10 lg:p-14 rounded-3xl text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="blob blob-purple w-64 h-64 -top-20 -right-20 opacity-20" />
            <div className="blob blob-pink w-48 h-48 -bottom-16 -left-16 opacity-20" />

            <Shield className="w-8 h-8 text-[var(--color-primary)] mx-auto mb-6 relative z-10" />
            <h2 className="font-display font-bold text-[24px] sm:text-[32px] lg:text-[38px] leading-tight tracking-[-0.02em] mb-4 relative z-10">
              Your privacy is{' '}
              <span className="gradient-text">non-negotiable.</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-md mx-auto mb-8 relative z-10 leading-relaxed">
              End-to-end encryption. Private workspaces. No data sharing. No ads.
              Your relationship data belongs to you and your partner — nobody else.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
              {['Encrypted Data', 'Private Workspace', 'No Ads Ever', 'GDPR Compliant'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-tertiary)]">
                  <Check className="w-3.5 h-3.5 text-[var(--color-success)]" />
                  <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section id="faq" className="py-20 lg:py-28 bg-[var(--bg-tertiary)]">
        <div className="max-w-[680px] mx-auto px-8 lg:px-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-3 block">FAQ</span>
            <h2 className="font-display font-bold text-[24px] sm:text-[32px] lg:text-[38px] leading-tight tracking-[-0.02em]">
              Questions?{' '}
              <span className="gradient-text">We've got answers.</span>
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: 'Is Only For Us free?', a: 'Yes! The core features are completely free. We\'ll introduce a premium tier in the future with advanced features.' },
              { q: 'How does partner linking work?', a: 'When you register, you get a unique invitation code. Share it with your partner — once they sign up and enter your code, your private workspace is created instantly.' },
              { q: 'Can other people see our data?', a: 'Absolutely not. Each couple has a completely isolated workspace. Your data is encrypted and never shared with anyone.' },
              { q: 'Can I use it on my phone?', a: 'Yes! Only For Us is a Progressive Web App (PWA). Install it on your phone for a native app experience.' },
              { q: 'What if we break up?', a: 'You can unlink your account at any time. Your personal data remains yours, and shared data can be exported.' },
            ].map((faq, i) => (
              <motion.details
                key={i}
                className="glass-card p-0 rounded-2xl group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <summary className="cursor-pointer px-6 py-5 text-[var(--text-primary)] font-semibold text-[15px] flex items-center justify-between list-none">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 text-[var(--text-tertiary)] transition-transform group-open:rotate-180 flex-shrink-0 ml-4" />
                </summary>
                <div className="px-6 pb-5 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 lg:py-28 overflow-hidden">
        <div className="max-w-[700px] mx-auto px-8 lg:px-10 text-center relative">
          <div className="blob blob-pink w-72 h-72 -top-20 left-0 opacity-20" />
          <div className="blob blob-purple w-72 h-72 -bottom-20 right-0 opacity-20" />

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display font-bold text-[24px] sm:text-[32px] lg:text-[38px] leading-tight tracking-[-0.02em] mb-5">
              Ready to build your life{' '}
              <span className="gradient-text">together?</span>
            </h2>
            <p className="text-base text-[var(--text-secondary)] mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of couples who chose to organize, grow, and love smarter.
            </p>
            <Link to={ROUTES.REGISTER}>
              <Button size="xl" iconRight={ArrowRight}>
                Create Your Space — Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <Footer />
    </div>
  );
}
