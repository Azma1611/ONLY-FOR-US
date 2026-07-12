import { create } from 'zustand';
import financeService from '../services/financeService';

const useFinanceStore = create((set, get) => ({
  summary: null,
  expenses: [],
  incomes: [],
  budgets: [],
  savingsGoals: [],
  bills: [],
  subscriptions: [],
  settlements: [],
  isLoading: false,

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const { data } = await financeService.getSummary();
      set({ summary: data.data.summary, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isLoading: false });
    }
  },

  fetchAll: async () => {
    set({ isLoading: true });
    try {
      const [
        summaryRes, expRes, incRes, budgRes, goalsRes, billsRes, subsRes, settleRes
      ] = await Promise.all([
        financeService.getSummary(),
        financeService.getExpenses(),
        financeService.getIncomes(),
        financeService.getBudgets(),
        financeService.getSavingsGoals(),
        financeService.getBills(),
        financeService.getSubscriptions(),
        financeService.getSettlements(),
      ]);

      set({
        summary: summaryRes.data.data.summary,
        expenses: expRes.data.data.expenses,
        incomes: incRes.data.data.incomes,
        budgets: budgRes.data.data.budgets,
        savingsGoals: goalsRes.data.data.goals,
        bills: billsRes.data.data.bills,
        subscriptions: subsRes.data.data.subs,
        settlements: settleRes.data.data.settlements,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
      set({ isLoading: false });
    }
  },

  // EXPENSES
  createExpense: async (payload) => {
    const { data } = await financeService.createExpense(payload);
    get().fetchSummary();
    return data.data.expense;
  },
  deleteExpense: async (id) => {
    await financeService.deleteExpense(id);
    get().fetchSummary();
  },

  // INCOME
  createIncome: async (payload) => {
    const { data } = await financeService.createIncome(payload);
    get().fetchSummary();
    return data.data.income;
  },
  deleteIncome: async (id) => {
    await financeService.deleteIncome(id);
    get().fetchSummary();
  },

  // SAVINGS GOALS
  createSavingsGoal: async (payload) => {
    const { data } = await financeService.createSavingsGoal(payload);
    return data.data.goal;
  },
  updateSavingsGoal: async (id, payload) => {
    const { data } = await financeService.updateSavingsGoal(id, payload);
    return data.data.goal;
  },
  deleteSavingsGoal: async (id) => {
    await financeService.deleteSavingsGoal(id);
  },

  // BILLS
  createBill: async (payload) => {
    const { data } = await financeService.createBill(payload);
    return data.data.bill;
  },
  updateBill: async (id, payload) => {
    const { data } = await financeService.updateBill(id, payload);
    return data.data.bill;
  },
  deleteBill: async (id) => {
    await financeService.deleteBill(id);
  },

  // SUBSCRIPTIONS
  createSubscription: async (payload) => {
    const { data } = await financeService.createSubscription(payload);
    return data.data.sub;
  },
  deleteSubscription: async (id) => {
    await financeService.deleteSubscription(id);
  },

  // SETTLEMENTS
  createSettlement: async (payload) => {
    const { data } = await financeService.createSettlement(payload);
    get().fetchSummary();
    return data.data.settlement;
  },

  // SOCKET UPDATES (Call these from socket listeners)
  handleSocketUpdate: (update) => {
    const { type, action, data } = update;
    
    // Always refresh summary on any change to income/expense/settlement
    if (['income', 'expense', 'settlement'].includes(type)) {
      get().fetchSummary();
    }

    set((state) => {
      // Find the corresponding collection in state
      let listKey = '';
      if (type === 'expense') listKey = 'expenses';
      else if (type === 'income') listKey = 'incomes';
      else if (type === 'budget') listKey = 'budgets';
      else if (type === 'goal') listKey = 'savingsGoals';
      else if (type === 'bill') listKey = 'bills';
      else if (type === 'subscription') listKey = 'subscriptions';
      else if (type === 'settlement') listKey = 'settlements';

      if (!listKey) return state;

      const list = [...state[listKey]];

      if (action === 'create') {
        if (!list.some(item => item._id === data._id)) {
          list.unshift(data); // Add to top
        }
      } else if (action === 'update') {
        const index = list.findIndex(item => item._id === data._id);
        if (index !== -1) list[index] = data;
      } else if (action === 'delete') {
        return { [listKey]: list.filter(item => item._id !== data._id) };
      }

      return { [listKey]: list };
    });
  }
}));

export default useFinanceStore;
