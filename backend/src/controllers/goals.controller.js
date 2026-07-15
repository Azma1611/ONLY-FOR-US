import Goal from '../models/Goal.js';
import { emitToCouple } from '../socket/socket.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({
      $or: [
        { owner: req.user._id },
        { relationshipId: req.user.relationshipId, visibility: 'shared' }
      ]
    }).sort({ createdAt: -1 });

    res.json({ goals });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createGoal = async (req, res) => {
  try {
    const goal = new Goal({
      ...req.body,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });

    await goal.save();

    if (req.user.relationshipId) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'goal',
        action: 'created',
        data: goal
      });
    }

    res.status(201).json({ goal });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Not found' });

    if (goal.owner.toString() !== req.user._id.toString() && goal.visibility === 'private') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (req.user.relationshipId && updatedGoal.visibility === 'shared') {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'goal',
        action: 'updated',
        data: updatedGoal
      });
    }

    res.json({ goal: updatedGoal });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Not found' });

    if (goal.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await goal.deleteOne();

    if (req.user.relationshipId && goal.visibility === 'shared') {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'goal',
        action: 'deleted',
        data: { _id: goal._id }
      });
    }

    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
