import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Bill from '../models/Bill.js';
import Subscription from '../models/Subscription.js';
import Settlement from '../models/Settlement.js';
import Relationship from '../models/Relationship.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';

/* ===================================================================
   SUMMARY & DASHBOARD
   =================================================================== */
export const getFinanceSummary = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) return sendError(res, 'Relationship not found.', 400);

    const rel = await Relationship.findById(relationshipId);

    // Get current month boundaries
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    // Month stats
    const expenses = await Expense.find({ relationshipId, date: { $gte: firstDay, $lte: lastDay } });
    const incomes = await Income.find({ relationshipId, date: { $gte: firstDay, $lte: lastDay } });

    const totalIncome = incomes.reduce((acc, val) => acc + val.amount, 0);
    const totalExpense = expenses.reduce((acc, val) => acc + val.amount, 0);
    const savings = totalIncome - totalExpense;

    // All-time shared expenses for Settlement logic
    const allSharedExpenses = await Expense.find({ relationshipId, shared: true });
    
    let p1Total = 0;
    let p2Total = 0;

    for (const exp of allSharedExpenses) {
      if (exp.paidBy.toString() === rel.partnerOne.toString()) p1Total += exp.amount;
      else if (rel.partnerTwo && exp.paidBy.toString() === rel.partnerTwo.toString()) p2Total += exp.amount;
    }

    const allSettlements = await Settlement.find({ relationshipId, status: 'completed' });
    let p1Settled = 0;
    let p2Settled = 0;

    for (const s of allSettlements) {
      if (s.fromUser.toString() === rel.partnerOne.toString()) p1Settled += s.amount;
      else if (rel.partnerTwo && s.fromUser.toString() === rel.partnerTwo.toString()) p2Settled += s.amount;
    }

    const totalShared = p1Total + p2Total;
    const halfShare = totalShared / 2;
    // p1Owes = halfShare - (what p1 paid + what p1 settled/sent) + what p2 settled/sent to p1
    const p1Balance = (p1Total + p1Settled) - (halfShare + p2Settled);
    const p2Balance = (p2Total + p2Settled) - (halfShare + p1Settled);

    return sendSuccess(res, 'Finance summary fetched.', {
      monthly: { income: totalIncome, expense: totalExpense, savings },
      settlement: {
        partnerOneTotal: p1Total,
        partnerTwoTotal: p2Total,
        p1Balance,
        p2Balance
      }
    });
  } catch (error) { next(error); }
};

/* ===================================================================
   EXPENSES
   =================================================================== */
export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ relationshipId: req.user.relationshipId }).populate('paidBy', 'name avatar').sort({ date: -1 });
    return sendSuccess(res, 'Expenses fetched.', { expenses });
  } catch (error) { next(error); }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      relationshipId: req.user.relationshipId,
      paidBy: req.user._id,
    });
    const populated = await expense.populate('paidBy', 'name avatar');
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'expense', action: 'create', data: populated });
    return sendSuccess(res, 'Expense logged.', { expense: populated }, 201);
  } catch (error) { next(error); }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true }).populate('paidBy', 'name avatar');
    if (!expense) return sendError(res, 'Expense not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'expense', action: 'update', data: expense });
    return sendSuccess(res, 'Expense updated.', { expense });
  } catch (error) { next(error); }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!expense) return sendError(res, 'Expense not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'expense', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Expense deleted.');
  } catch (error) { next(error); }
};

/* ===================================================================
   INCOME
   =================================================================== */
export const getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ relationshipId: req.user.relationshipId }).populate('addedBy', 'name avatar').sort({ date: -1 });
    return sendSuccess(res, 'Incomes fetched.', { incomes });
  } catch (error) { next(error); }
};

export const createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, relationshipId: req.user.relationshipId, addedBy: req.user._id });
    const populated = await income.populate('addedBy', 'name avatar');
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'income', action: 'create', data: populated });
    return sendSuccess(res, 'Income logged.', { income: populated }, 201);
  } catch (error) { next(error); }
};

export const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true }).populate('addedBy', 'name avatar');
    if (!income) return sendError(res, 'Income not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'income', action: 'update', data: income });
    return sendSuccess(res, 'Income updated.', { income });
  } catch (error) { next(error); }
};

export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!income) return sendError(res, 'Income not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'income', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Income deleted.');
  } catch (error) { next(error); }
};

/* ===================================================================
   BUDGETS
   =================================================================== */
export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ relationshipId: req.user.relationshipId }).sort({ monthYear: -1, createdAt: -1 });
    return sendSuccess(res, 'Budgets fetched.', { budgets });
  } catch (error) { next(error); }
};

export const createBudget = async (req, res, next) => {
  try {
    const budget = await Budget.create({ ...req.body, relationshipId: req.user.relationshipId });
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'budget', action: 'create', data: budget });
    return sendSuccess(res, 'Budget created.', { budget }, 201);
  } catch (error) { next(error); }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true });
    if (!budget) return sendError(res, 'Budget not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'budget', action: 'update', data: budget });
    return sendSuccess(res, 'Budget updated.', { budget });
  } catch (error) { next(error); }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!budget) return sendError(res, 'Budget not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'budget', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Budget deleted.');
  } catch (error) { next(error); }
};

/* ===================================================================
   SAVINGS GOALS
   =================================================================== */
export const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ relationshipId: req.user.relationshipId }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Goals fetched.', { goals });
  } catch (error) { next(error); }
};

export const createSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.create({ ...req.body, relationshipId: req.user.relationshipId });
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'goal', action: 'create', data: goal });
    return sendSuccess(res, 'Goal created.', { goal }, 201);
  } catch (error) { next(error); }
};

export const updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true });
    if (!goal) return sendError(res, 'Goal not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'goal', action: 'update', data: goal });
    return sendSuccess(res, 'Goal updated.', { goal });
  } catch (error) { next(error); }
};

export const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!goal) return sendError(res, 'Goal not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'goal', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Goal deleted.');
  } catch (error) { next(error); }
};

/* ===================================================================
   BILLS
   =================================================================== */
export const getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ relationshipId: req.user.relationshipId }).sort({ dueDate: 1 });
    return sendSuccess(res, 'Bills fetched.', { bills });
  } catch (error) { next(error); }
};

export const createBill = async (req, res, next) => {
  try {
    const bill = await Bill.create({ ...req.body, relationshipId: req.user.relationshipId });
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'bill', action: 'create', data: bill });
    return sendSuccess(res, 'Bill created.', { bill }, 201);
  } catch (error) { next(error); }
};

export const updateBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true });
    if (!bill) return sendError(res, 'Bill not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'bill', action: 'update', data: bill });
    return sendSuccess(res, 'Bill updated.', { bill });
  } catch (error) { next(error); }
};

export const deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!bill) return sendError(res, 'Bill not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'bill', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Bill deleted.');
  } catch (error) { next(error); }
};

/* ===================================================================
   SUBSCRIPTIONS
   =================================================================== */
export const getSubscriptions = async (req, res, next) => {
  try {
    const subs = await Subscription.find({ relationshipId: req.user.relationshipId }).sort({ renewalDate: 1 });
    return sendSuccess(res, 'Subscriptions fetched.', { subs });
  } catch (error) { next(error); }
};

export const createSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.create({ ...req.body, relationshipId: req.user.relationshipId });
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'subscription', action: 'create', data: sub });
    return sendSuccess(res, 'Subscription created.', { sub }, 201);
  } catch (error) { next(error); }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true });
    if (!sub) return sendError(res, 'Subscription not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'subscription', action: 'update', data: sub });
    return sendSuccess(res, 'Subscription updated.', { sub });
  } catch (error) { next(error); }
};

export const deleteSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!sub) return sendError(res, 'Subscription not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'subscription', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Subscription deleted.');
  } catch (error) { next(error); }
};

/* ===================================================================
   SETTLEMENTS
   =================================================================== */
export const getSettlements = async (req, res, next) => {
  try {
    const settlements = await Settlement.find({ relationshipId: req.user.relationshipId }).populate('fromUser toUser', 'name avatar').sort({ date: -1 });
    return sendSuccess(res, 'Settlements fetched.', { settlements });
  } catch (error) { next(error); }
};

export const createSettlement = async (req, res, next) => {
  try {
    const settlement = await Settlement.create({ ...req.body, relationshipId: req.user.relationshipId });
    const populated = await settlement.populate('fromUser toUser', 'name avatar');
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'settlement', action: 'create', data: populated });
    return sendSuccess(res, 'Settlement logged.', { settlement: populated }, 201);
  } catch (error) { next(error); }
};

export const updateSettlement = async (req, res, next) => {
  try {
    const settlement = await Settlement.findOneAndUpdate({ _id: req.params.id, relationshipId: req.user.relationshipId }, req.body, { new: true }).populate('fromUser toUser', 'name avatar');
    if (!settlement) return sendError(res, 'Settlement not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'settlement', action: 'update', data: settlement });
    return sendSuccess(res, 'Settlement updated.', { settlement });
  } catch (error) { next(error); }
};

export const deleteSettlement = async (req, res, next) => {
  try {
    const settlement = await Settlement.findOneAndDelete({ _id: req.params.id, relationshipId: req.user.relationshipId });
    if (!settlement) return sendError(res, 'Settlement not found.', 404);
    emitToCouple(req.user.relationshipId, 'finance_update', { type: 'settlement', action: 'delete', data: { _id: req.params.id } });
    return sendSuccess(res, 'Settlement deleted.');
  } catch (error) { next(error); }
};
