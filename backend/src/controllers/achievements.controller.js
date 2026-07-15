import Achievement from '../models/Achievement.js';
import Goal from '../models/Goal.js';
import HabitLog from '../models/HabitLog.js';
import { emitToCouple } from '../socket/socket.js';

// Achievements are generally auto-calculated, but we provide an endpoint to fetch them
export const getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      $or: [
        { owner: req.user._id },
        { relationshipId: req.user.relationshipId }
      ]
    }).sort({ unlockedAt: -1 });

    res.json({ achievements });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Manually unlock an achievement (for testing or specific front-end triggers)
export const unlockAchievement = async (req, res) => {
  try {
    const { badgeId } = req.body;
    
    // Check if already unlocked
    const existing = await Achievement.findOne({ badgeId, owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'Already unlocked' });
    }

    const achievement = new Achievement({
      badgeId,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });

    await achievement.save();

    if (req.user.relationshipId) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'achievement',
        action: 'unlocked',
        data: achievement
      });
    }

    res.status(201).json({ achievement });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
