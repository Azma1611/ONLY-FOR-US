import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useFinanceStore from '@/store/financeStore';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Check, HandCoins } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { format } from 'date-fns';

export default function SettlementsWorkspace() {
  const { summary, settlements, createSettlement } = useFinanceStore();
  const { user } = useAuthStore();
  const { register, handleSubmit, reset } = useForm();
  
  if (!summary) return null;

  const { p1Balance, p2Balance } = summary.settlement;
  
  // Determine who owes whom based on logged in user
  const isP1 = summary.partnerOneId === user._id || (p1Balance !== undefined); // Simplified check
  // Actually, we need to know if current user is P1 or P2.
  // We can just show the raw balances. If p1Balance > 0, P2 owes P1. If p1Balance < 0, P1 owes P2.
  
  const p2OwesP1 = p1Balance > 0;
  const p1OwesP2 = p1Balance < 0;
  const absoluteOweAmount = Math.abs(p1Balance);

  const onSubmit = async (data) => {
    try {
      await createSettlement({
        fromUser: user._id, // Assume current user is paying back the other
        toUser: user.relationship.partnerOne === user._id ? user.relationship.partnerTwo : user.relationship.partnerOne,
        amount: Number(data.amount)
      });
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-8 flex flex-col items-center justify-center text-center border-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-xl shadow-primary/20">
          <HandCoins className="w-16 h-16 mb-4 text-white/90" />
          <h2 className="text-2xl font-bold mb-2">Settlement Balance</h2>
          
          {absoluteOweAmount === 0 ? (
            <div className="bg-white/20 px-4 py-2 rounded-full font-medium">You are all squared up! 🎉</div>
          ) : (
            <div className="text-4xl font-bold">
              ${absoluteOweAmount.toFixed(2)}
            </div>
          )}
          
          {absoluteOweAmount > 0 && (
            <p className="mt-2 text-white/80">
              {p1OwesP2 ? "Partner 1 owes Partner 2" : "Partner 2 owes Partner 1"}
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Log a Payment</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Did you just Venmo or give cash to your partner to settle up? Log it here to balance the books.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount Paid ($)</label>
              <input type="number" step="0.01" {...register('amount', { required: true })} className="w-full px-3 py-2 border rounded-lg bg-[var(--bg-primary)]" />
            </div>
            <Button type="submit" className="w-full">Settle Up</Button>
          </form>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Settlement History</h3>
        <div className="space-y-3">
          {settlements.map(s => (
            <div key={s._id} className="flex justify-between items-center p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[var(--text-primary)]">{s.fromUser?.name} paid {s.toUser?.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{format(new Date(s.date), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <span className="font-bold text-emerald-500">${s.amount.toLocaleString()}</span>
            </div>
          ))}
          {settlements.length === 0 && (
            <div className="text-center text-[var(--text-secondary)] py-4">No settlements logged yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
