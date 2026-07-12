import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useFinanceStore from '@/store/financeStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function BudgetsWorkspace() {
  const { budgets, savingsGoals, expenses, createBudget, deleteBudget, createSavingsGoal, deleteSavingsGoal } = useFinanceStore();
  const { register: regB, handleSubmit: handleB, reset: resetB } = useForm();
  const { register: regG, handleSubmit: handleG, reset: resetG } = useForm();

  const onBudgetSubmit = async (data) => {
    try {
      await createBudget({
        category: data.category,
        limitAmount: Number(data.limitAmount),
        monthYear: format(new Date(), 'yyyy-MM'),
      });
      resetB();
    } catch (e) { console.error(e); }
  };

  const onGoalSubmit = async (data) => {
    try {
      await createSavingsGoal({
        title: data.title,
        targetAmount: Number(data.targetAmount),
      });
      resetG();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      
      {/* Budgets Section */}
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Monthly Budgets</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Set Budget</h3>
          <form onSubmit={handleB(onBudgetSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select {...regB('category')} className="w-full px-3 py-2 border rounded-lg bg-[var(--bg-primary)]">
                <option value="Total">Total Overall</option>
                <option value="Food">Food</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Limit ($)</label>
              <input type="number" {...regB('limitAmount', { required: true })} className="w-full px-3 py-2 border rounded-lg bg-[var(--bg-primary)]" />
            </div>
            <Button type="submit" className="w-full">Set Budget</Button>
          </form>
        </Card>
        
        <div className="md:col-span-2 space-y-4">
          {budgets.map(b => {
            const spent = expenses.filter(e => b.category === 'Total' || e.category === b.category).reduce((a,c) => a + c.amount, 0);
            const progress = Math.min((spent / b.limitAmount) * 100, 100);
            return (
              <Card key={b._id} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{b.category} Budget</h4>
                  <button onClick={() => deleteBudget(b._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>${spent} spent</span>
                  <span className="text-[var(--text-secondary)]">of ${b.limitAmount}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`h-2 rounded-full ${progress > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${progress}%` }}></div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Savings Goals Section */}
      <h2 className="text-xl font-bold text-[var(--text-primary)] mt-10">Savings Goals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Create Goal</h3>
          <form onSubmit={handleG(onGoalSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Goal Name</label>
              <input type="text" {...regG('title', { required: true })} className="w-full px-3 py-2 border rounded-lg bg-[var(--bg-primary)]" placeholder="Vacation, Laptop..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Amount ($)</label>
              <input type="number" {...regG('targetAmount', { required: true })} className="w-full px-3 py-2 border rounded-lg bg-[var(--bg-primary)]" />
            </div>
            <Button type="submit" className="w-full">Create Goal</Button>
          </form>
        </Card>
        
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savingsGoals.map(g => {
            const progress = (g.currentAmount / g.targetAmount) * 100;
            return (
              <Card key={g._id} className="p-4 border-t-4 border-indigo-500">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{g.title}</h4>
                  <button onClick={() => deleteSavingsGoal(g._id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="text-2xl font-bold mb-2">${g.currentAmount} <span className="text-sm font-normal text-gray-500">/ ${g.targetAmount}</span></div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${progress}%` }}></div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

    </div>
  );
}
