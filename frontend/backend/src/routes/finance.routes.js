import express from 'express';
import {
  getFinanceSummary,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getIncomes,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../controllers/finance.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All finance routes require authentication
router.get('/summary', protect, getFinanceSummary);

// Expenses sub-resource
router.get('/expenses', protect, getExpenses);
router.post('/expenses', protect, createExpense);
router.patch('/expenses/:id', protect, updateExpense);
router.delete('/expenses/:id', protect, deleteExpense);

// Incomes sub-resource (personal)
router.get('/income', protect, getIncomes);
router.post('/income', protect, createIncome);
router.patch('/income/:id', protect, updateIncome);
router.delete('/income/:id', protect, deleteIncome);

export default router;
