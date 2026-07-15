import Productivity from '../models/Productivity.js';
import { emitToCouple } from '../socket/socket.js';

export const getProductivityItems = async (req, res) => {
  try {
    const items = await Productivity.find({
      $or: [
        { owner: req.user._id },
        { relationshipId: req.user.relationshipId, visibility: 'shared' }
      ]
    }).sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProductivityItem = async (req, res) => {
  try {
    const item = new Productivity({
      ...req.body,
      owner: req.user._id,
      relationshipId: req.user.relationshipId
    });

    await item.save();

    if (req.user.relationshipId && item.visibility === 'shared') {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'productivity',
        action: 'created',
        data: item
      });
    }

    res.status(201).json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProductivityItem = async (req, res) => {
  try {
    const item = await Productivity.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    if (item.owner.toString() !== req.user._id.toString() && item.visibility === 'private') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedItem = await Productivity.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (req.user.relationshipId && updatedItem.visibility === 'shared') {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'productivity',
        action: 'updated',
        data: updatedItem
      });
    }

    res.json({ item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProductivityItem = async (req, res) => {
  try {
    const item = await Productivity.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await item.deleteOne();

    if (req.user.relationshipId && item.visibility === 'shared') {
      emitToCouple(req.user.relationshipId, 'ecosystem_update', {
        type: 'productivity',
        action: 'deleted',
        data: { _id: item._id }
      });
    }

    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
