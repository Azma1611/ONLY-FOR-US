import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import HealthLog from '../models/HealthLog.js';
import Productivity from '../models/Productivity.js';
// The actual finance models are Income, Expense, Budget, etc. Let's import them if needed, or just keep it simple.
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

export const buildUserContext = async (userId, relationshipId) => {
  let contextStr = `You are a helpful, empathetic, and highly intelligent AI assistant for a couple using the 'Only For Us' app.\n`;
  contextStr += `Your goal is to provide relationship advice, analyze their data, and offer smart insights.\n\n`;
  
  contextStr += `### RECENT CONTEXT ###\n`;

  try {
    const orQuery = relationshipId 
      ? { $or: [{ owner: userId }, { relationship: relationshipId }] }
      : { owner: userId };

    // Fetch Goals
    const goals = await Goal.find(orQuery).limit(5).sort({ createdAt: -1 });
    if (goals.length > 0) {
      contextStr += `Goals:\n`;
      goals.forEach(g => {
        contextStr += `- ${g.title} (${g.status}, Progress: ${g.progress}%)\n`;
      });
    }

    // Fetch Habits
    const habits = await Habit.find(orQuery).limit(5);
    if (habits.length > 0) {
      contextStr += `Habits:\n`;
      habits.forEach(h => {
        contextStr += `- ${h.title} (Current Streak: ${h.currentStreak}, Best: ${h.longestStreak})\n`;
      });
    }

    // Fetch Recent Expenses
    try {
      const expenses = await Expense.find(orQuery).limit(3).sort({ date: -1 });
      if (expenses && expenses.length > 0) {
        contextStr += `Recent Expenses:\n`;
        expenses.forEach(e => {
          contextStr += `- ${e.title}: $${e.amount} (${e.category})\n`;
        });
      }
    } catch (e) {
      // Ignore if Expense model isn't exactly as expected
    }

    // Fetch Productivity
    const tasks = await Productivity.find(orQuery).limit(3).sort({ createdAt: -1 });
    if (tasks.length > 0) {
      contextStr += `Recent Work/Study Tasks:\n`;
      tasks.forEach(t => {
        contextStr += `- ${t.title} (${t.status})\n`;
      });
    }

    contextStr += `\nUse this context to personalize your responses. If they ask about their data, reference the context above.\n`;

  } catch (error) {
    console.error("Error building context:", error);
  }

  return contextStr;
};
