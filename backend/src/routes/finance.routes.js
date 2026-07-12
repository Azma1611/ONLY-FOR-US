import express from 'express';
import {
  getFinanceSummary,
  getExpenses, createExpense, updateExpense, deleteExpense,
  getIncomes, createIncome, updateIncome, deleteIncome,
  getBudgets, createBudget, updateBudget, deleteBudget,
  getSavingsGoals, createSavingsGoal, updateSavingsGoal, deleteSavingsGoal,
  getBills, createBill, updateBill, deleteBill,
  getSubscriptions, createSubscription, updateSubscription, deleteSubscription,
  getSettlements, createSettlement, updateSettlement, deleteSettlement,
} from '../controllers/finance.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { verifyRelationship } from '../middlewares/relationship.middleware.js';

const router = express.Router();

// Apply auth & relationship protection to all routes
router.use(protect);
router.use(verifyRelationship);

router.get('/summary', getFinanceSummary);

router.get('/expenses', getExpenses);
router.post('/expenses', createExpense);
router.patch('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

router.get('/income', getIncomes);
router.post('/income', createIncome);
router.patch('/income/:id', updateIncome);
router.delete('/income/:id', deleteIncome);

router.get('/budgets', getBudgets);
router.post('/budgets', createBudget);
router.patch('/budgets/:id', updateBudget);
router.delete('/budgets/:id', deleteBudget);

router.get('/goals', getSavingsGoals);
router.post('/goals', createSavingsGoal);
router.patch('/goals/:id', updateSavingsGoal);
router.delete('/goals/:id', deleteSavingsGoal);

router.get('/bills', getBills);
router.post('/bills', createBill);
router.patch('/bills/:id', updateBill);
router.delete('/bills/:id', deleteBill);

router.get('/subscriptions', getSubscriptions);
router.post('/subscriptions', createSubscription);
router.patch('/subscriptions/:id', updateSubscription);
router.delete('/subscriptions/:id', deleteSubscription);

router.get('/settlements', getSettlements);
router.post('/settlements', createSettlement);
router.patch('/settlements/:id', updateSettlement);
router.delete('/settlements/:id', deleteSettlement);

export default router;
