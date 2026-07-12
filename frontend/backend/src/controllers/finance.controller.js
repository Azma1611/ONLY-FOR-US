import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import Relationship from '../models/Relationship.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/finance/summary
 * Computes relationship balance statistics, aggregated totals, and who owes whom.
 */
export const getFinanceSummary = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access financial summaries.', 400);
    }

    const rel = await Relationship.findById(relationshipId);
    if (!rel) {
      return sendError(res, 'Relationship space not found.', 404);
    }

    // Retrieve shared expenses
    const expenses = await Expense.find({ relationshipId, shared: true });
    
    let partnerOneTotal = 0;
    let partnerTwoTotal = 0;

    for (const exp of expenses) {
      if (exp.paidBy.toString() === rel.partnerOne.toString()) {
        partnerOneTotal += exp.amount;
      } else if (rel.partnerTwo && exp.paidBy.toString() === rel.partnerTwo.toString()) {
        partnerTwoTotal += exp.amount;
      }
    }

    const totalShared = partnerOneTotal + partnerTwoTotal;
    const halfShare = totalShared / 2;

    // Balance represents who owes whom
    // Positive balance: partnerTwo owes partnerOne
    // Negative balance: partnerOne owes partnerTwo
    const balance = partnerOneTotal - halfShare;

    return sendSuccess(res, 'Finance summary calculated successfully.', {
      summary: {
        partnerOneTotal,
        partnerTwoTotal,
        totalShared,
        halfShare,
        balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ===================================================================
   EXPENSES CRUD HANDLERS
   =================================================================== */

/**
 * GET /api/finance/expenses
 */
export const getExpenses = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to retrieve expenses.', 400);
    }

    const expenses = await Expense.find({ relationshipId })
      .populate('paidBy', 'name email avatar')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Expenses fetched successfully.', { expenses });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/finance/expenses
 */
export const createExpense = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to log expenses.', 400);
    }

    const { title, amount, category, shared } = req.body;
    if (!title || amount === undefined) {
      return sendError(res, 'Expense title and amount are required.', 400);
    }

    const expense = await Expense.create({
      relationshipId,
      title,
      amount,
      category: category || 'General',
      paidBy: req.user._id,
      shared: shared !== undefined ? !!shared : true,
    });

    logger.info(`Expense logged: "${expense.title}" - $${expense.amount} by user ${req.user.name}`);

    // Emit live update to couple room
    emitToCouple(relationshipId, 'expense_created', { expense });

    return sendSuccess(res, 'Expense logged successfully.', { expense }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/finance/expenses/:id
 */
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return sendError(res, 'Expense not found.', 404);
    }

    if (expense.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to edit this expense.', 403);
    }

    const allowedUpdates = ['title', 'amount', 'category', 'shared', 'paidBy'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        expense[key] = req.body[key];
      }
    }

    await expense.save();

    logger.info(`Expense updated: ID ${expense._id}`);

    // Emit live update to couple room
    emitToCouple(req.user.relationshipId, 'expense_updated', { expense });

    return sendSuccess(res, 'Expense updated successfully.', { expense });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/finance/expenses/:id
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      return sendError(res, 'Expense not found.', 404);
    }

    if (expense.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to delete this expense.', 403);
    }

    await Expense.deleteOne({ _id: id });

    logger.info(`Expense deleted: ID ${id}`);

    // Emit live delete alert to couple room
    emitToCouple(req.user.relationshipId, 'expense_deleted', { expenseId: id });

    return sendSuccess(res, 'Expense deleted successfully.');
  } catch (error) {
    next(error);
  }
};

/* ===================================================================
   INCOME CRUD HANDLERS (Personal, not broadcast to room)
   =================================================================== */

/**
 * GET /api/finance/income
 */
export const getIncomes = async (req, res, next) => {
  try {
    const incomes = await Income.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Incomes fetched successfully.', { incomes });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/finance/income
 */
export const createIncome = async (req, res, next) => {
  try {
    const { source, amount } = req.body;
    if (!source || amount === undefined) {
      return sendError(res, 'Income source and amount are required.', 400);
    }

    const income = await Income.create({
      owner: req.user._id,
      source,
      amount,
    });

    logger.info(`Income logged: "${income.source}" - $${income.amount} by user ${req.user.name}`);

    return sendSuccess(res, 'Income logged successfully.', { income }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/finance/income/:id
 */
export const updateIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const income = await Income.findById(id);

    if (!income) {
      return sendError(res, 'Income log not found.', 404);
    }

    if (income.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to update this income record.', 403);
    }

    const allowedUpdates = ['source', 'amount'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        income[key] = req.body[key];
      }
    }

    await income.save();

    logger.info(`Income updated: ID ${income._id}`);

    return sendSuccess(res, 'Income log updated successfully.', { income });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/finance/income/:id
 */
export const deleteIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const income = await Income.findById(id);

    if (!income) {
      return sendError(res, 'Income log not found.', 404);
    }

    if (income.owner.toString() !== req.user._id.toString()) {
      return sendError(res, 'You are not authorized to delete this income record.', 403);
    }

    await Income.deleteOne({ _id: id });

    logger.info(`Income deleted: ID ${id}`);

    return sendSuccess(res, 'Income log deleted successfully.');
  } catch (error) {
    next(error);
  }
};
