import Habit from '../models/Habit.js';
import HabitLog from '../models/HabitLog.js';
import { emitToCouple } from '../socket/socket.js';

export const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({
      $or: [
        { owner: req.user._id },
        { relationshipId: req.user.relationshipId, partnerVisibility: true }
      ]
    }).sort({ createdAt: -1 });

    const habitIds = habits.map(h => h._id);
    const logs = await HabitLog.find({ habit: { $in: habitIds } });

    res.json({ habits, logs });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createHabit = async (req, res) => {
  try {
    const habit = new Habit({
      ...req.body,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });

    await habit.save();

    if (req.user.relationshipId && habit.partnerVisibility) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'habit',
        action: 'created',
        data: habit
      });
    }

    res.status(201).json({ habit });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Not found' });

    if (habit.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (req.user.relationshipId && updatedHabit.partnerVisibility) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'habit',
        action: 'updated',
        data: updatedHabit
      });
    }

    res.json({ habit: updatedHabit });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Not found' });

    if (habit.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await HabitLog.deleteMany({ habit: habit._id });
    await habit.deleteOne();

    if (req.user.relationshipId && habit.partnerVisibility) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'habit',
        action: 'deleted',
        data: { _id: habit._id }
      });
    }

    res.json({ message: 'Habit removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const logHabit = async (req, res) => {
  try {
    const { date, completed } = req.body;
    const habit = await Habit.findById(req.params.id);
    
    if (!habit) return res.status(404).json({ message: 'Not found' });
    if (habit.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let log = await HabitLog.findOne({ habit: habit._id, date });

    if (log) {
      log.completed = completed;
      await log.save();
    } else {
      log = new HabitLog({
        habit: habit._id,
        date,
        completed
      });
      await log.save();
    }

    // Recalculate streak logic (simplified for now)
    const allLogs = await HabitLog.find({ habit: habit._id, completed: true }).sort({ date: -1 });
    // This is a naive streak calculation, can be improved.
    // For simplicity, we just increment or reset based on today's action.
    if (completed) {
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.longestStreak) {
        habit.longestStreak = habit.currentStreak;
      }
    } else {
      habit.currentStreak = 0;
    }
    await habit.save();

    if (req.user.relationshipId && habit.partnerVisibility) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'habitLog',
        action: 'updated',
        data: log
      });
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'habit',
        action: 'updated',
        data: habit
      });
    }

    res.json({ log, habit });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
