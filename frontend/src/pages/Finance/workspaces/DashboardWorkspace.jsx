import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import useFinanceStore from '@/store/financeStore';
import Card from '@/components/ui/Card';
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from 'lucide-react';

const COLORS = ['#10B981', '#F43F5E', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function DashboardWorkspace() {
  const { summary, expenses, incomes } = useFinanceStore();

  const pieData = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
    
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const barData = useMemo(() => {
    // Generate last 6 months data dummy or calculate from actual (we will simplify by showing only current month for now, or just aggregate all time)
    // For simplicity, we just show a static visual or current month
    return [
      { name: 'Income', amount: summary?.monthly?.income || 0 },
      { name: 'Expense', amount: summary?.monthly?.expense || 0 }
    ];
  }, [summary]);

  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Net Monthly Savings</p>
              <h3 className="text-3xl font-bold mt-2">${summary.monthly.savings.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
        
        <Card className="p-6 hover:border-[var(--color-success)] transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Monthly Income</p>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-2">${summary.monthly.income.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-[var(--color-success-50)] text-[var(--color-success)] rounded-xl">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:border-[var(--color-error)] transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Monthly Expense</p>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-2">${summary.monthly.expense.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-[var(--color-error-50)] text-[var(--color-error)] rounded-xl">
              <ArrowDownRight className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:border-[var(--color-warning)] transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-medium">Shared Balance</p>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                {summary.settlement.p1Balance > 0 ? `+${summary.settlement.p1Balance}` : summary.settlement.p1Balance}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">If +, partner owes you.</p>
            </div>
            <div className="p-3 bg-[var(--color-warning-50)] text-[var(--color-warning)] rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Expenses by Category</h3>
          <div className="flex-1 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `$${value}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[var(--text-secondary)]">No expenses yet.</div>
            )}
          </div>
        </Card>

        <Card className="p-6 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Income vs Expense</h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={{ fill: 'var(--bg-secondary)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => `$${value}`}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Income' ? '#10B981' : '#F43F5E'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
