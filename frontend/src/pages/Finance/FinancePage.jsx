import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  PiggyBank
} from 'lucide-react';
import useFinanceStore from '@/store/financeStore';
import DashboardWorkspace from './workspaces/DashboardWorkspace';
import TransactionsWorkspace from './workspaces/TransactionsWorkspace';
import BudgetsWorkspace from './workspaces/BudgetsWorkspace';
import SettlementsWorkspace from './workspaces/SettlementsWorkspace';

const TABS = [
  { id: 'dashboard', label: 'Overview', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
  { id: 'budgets', label: 'Budgets & Goals', icon: PiggyBank },
  { id: 'settlements', label: 'Settlements', icon: TrendingUp },
];

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { fetchAll, isLoading } = useFinanceStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] lg:h-[calc(100vh-5.5rem)]">
      {/* Header */}
      <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 border-b border-[var(--border-color)] bg-[var(--bg-primary)] z-10 sticky top-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--text-primary)]">Finance Manager</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Track and manage your shared finances, budgets, and savings.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mt-6 max-w-7xl mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="finance-active-tab"
                    className="absolute inset-0 bg-[var(--color-primary)] opacity-[0.08] rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--color-primary)]' : ''}`} />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && <DashboardWorkspace />}
                {activeTab === 'transactions' && <TransactionsWorkspace />}
                {activeTab === 'budgets' && <BudgetsWorkspace />}
                {activeTab === 'settlements' && <SettlementsWorkspace />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
