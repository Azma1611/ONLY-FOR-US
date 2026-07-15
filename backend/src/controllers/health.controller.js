import HealthLog from '../models/HealthLog.js';
import Medicine from '../models/Medicine.js';
import { emitToCouple } from '../socket/socket.js';

// Health Logs (Water, Sleep, Mood, Workout)
export const getHealthLogs = async (req, res) => {
  try {
    const logs = await HealthLog.find({
      $or: [
        { owner: req.user._id },
        { relationshipId: req.user.relationshipId, partnerVisibility: true }
      ]
    }).sort({ date: -1, createdAt: -1 });

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createHealthLog = async (req, res) => {
  try {
    const log = new HealthLog({
      ...req.body,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });

    await log.save();

    if (req.user.relationshipId && log.partnerVisibility) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'healthLog',
        action: 'created',
        data: log
      });
    }

    res.status(201).json({ log });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteHealthLog = async (req, res) => {
  try {
    const log = await HealthLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Not found' });

    if (log.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await log.deleteOne();

    if (req.user.relationshipId && log.partnerVisibility) {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'healthLog',
        action: 'deleted',
        data: { _id: log._id }
      });
    }

    res.json({ message: 'Log removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Medicine
export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ medicines });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const medicine = new Medicine({
      ...req.body,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });

    await medicine.save();
    res.status(201).json({ medicine });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Not found' });

    if (medicine.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ medicine: updatedMedicine });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Not found' });

    if (medicine.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await medicine.deleteOne();
    res.json({ message: 'Medicine removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
