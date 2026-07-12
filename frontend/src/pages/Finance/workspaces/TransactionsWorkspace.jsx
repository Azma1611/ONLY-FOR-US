import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useFinanceStore from '@/store/financeStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

export default function TransactionsWorkspace() {
  const { incomes, expenses, createIncome, createExpense, deleteIncome, deleteExpense } = useFinanceStore();
  const [tab, setTab] = useState('expense'); // 'expense' | 'income'
  
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const payload = {
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
      };

      if (tab === 'expense') {
        payload.shared = data.shared === 'true';
        await createExpense({ ...payload, title: data.description });
      } else {
        await createIncome({ ...payload, source: data.description });
      }
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Add Transaction</h3>
            
            <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg mb-6">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'expense' ? 'bg-white dark:bg-gray-800 shadow text-[var(--color-error)]' : 'text-[var(--text-secondary)]'}`}
                onClick={() => setTab('expense')}
              >
                Expense
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === 'income' ? 'bg-white dark:bg-gray-800 shadow text-[var(--color-success)]' : 'text-[var(--text-secondary)]'}`}
                onClick={() => setTab('income')}
              >
                Income
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { required: true })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Description</label>
                <input
                  type="text"
                  {...register('description', { required: true })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder={tab === 'expense' ? "Dinner, Groceries..." : "Salary, Freelance..."}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  {tab === 'expense' ? (
                    <>
                      <option value="Food">Food</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Travel">Travel</option>
                      <option value="Bills">Bills</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="Salary">Salary</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Gift">Gift</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              {tab === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Shared Expense?</label>
                  <select
                    {...register('shared')}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="true">Yes, split 50/50</option>
                    <option value="false">No, personal</option>
                  </select>
                </div>
              )}

              <Button type="submit" className="w-full flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Add {tab === 'expense' ? 'Expense' : 'Income'}
              </Button>
            </form>
          </Card>
        </div>

        {/* History Column */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 text-[var(--text-primary)]">Transaction History</h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
              {[...incomes, ...expenses].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).map(t => {
                const isExpense = t.paidBy !== undefined; // Quick hack to differentiate
                return (
                  <div key={t._id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${isExpense ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                        {isExpense ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-[var(--text-primary)]">{t.title || t.source || t.description || 'Transaction'}</h4>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {format(new Date(t.date || t.createdAt), 'MMM d, yyyy')} • {t.category} 
                          {isExpense && t.shared && ' • Shared'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${isExpense ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
                        {isExpense ? '-' : '+'}${t.amount.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => isExpense ? deleteExpense(t._id) : deleteIncome(t._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
