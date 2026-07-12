import api from './api';

const financeService = {
  // Summary
  getSummary: () => api.get('/finance/summary'),

  // Expenses
  getExpenses: () => api.get('/finance/expenses'),
  createExpense: (data) => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.patch(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),

  // Incomes
  getIncomes: () => api.get('/finance/income'),
  createIncome: (data) => api.post('/finance/income', data),
  updateIncome: (id, data) => api.patch(`/finance/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/finance/income/${id}`),

  // Budgets
  getBudgets: () => api.get('/finance/budgets'),
  createBudget: (data) => api.post('/finance/budgets', data),
  updateBudget: (id, data) => api.patch(`/finance/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/finance/budgets/${id}`),

  // Savings Goals
  getSavingsGoals: () => api.get('/finance/goals'),
  createSavingsGoal: (data) => api.post('/finance/goals', data),
  updateSavingsGoal: (id, data) => api.patch(`/finance/goals/${id}`, data),
  deleteSavingsGoal: (id) => api.delete(`/finance/goals/${id}`),

  // Bills
  getBills: () => api.get('/finance/bills'),
  createBill: (data) => api.post('/finance/bills', data),
  updateBill: (id, data) => api.patch(`/finance/bills/${id}`, data),
  deleteBill: (id) => api.delete(`/finance/bills/${id}`),

  // Subscriptions
  getSubscriptions: () => api.get('/finance/subscriptions'),
  createSubscription: (data) => api.post('/finance/subscriptions', data),
  updateSubscription: (id, data) => api.patch(`/finance/subscriptions/${id}`, data),
  deleteSubscription: (id) => api.delete(`/finance/subscriptions/${id}`),

  // Settlements
  getSettlements: () => api.get('/finance/settlements'),
  createSettlement: (data) => api.post('/finance/settlements', data),
  updateSettlement: (id, data) => api.patch(`/finance/settlements/${id}`, data),
  deleteSettlement: (id) => api.delete(`/finance/settlements/${id}`),
};

export default financeService;
