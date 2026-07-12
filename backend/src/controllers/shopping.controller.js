import ShoppingItem from '../models/ShoppingItem.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';

export const getShoppingList = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access the shopping list.', 400);
    }

    const items = await ShoppingItem.find({ relationshipId }).sort({ purchased: 1, createdAt: -1 });
    return sendSuccess(res, 'Shopping items fetched successfully.', { items });
  } catch (error) {
    next(error);
  }
};

export const createShoppingItem = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    const { name, category, quantity, price } = req.body;

    if (!name) {
      return sendError(res, 'Item name is required.', 400);
    }

    const item = await ShoppingItem.create({
      relationshipId,
      createdBy: req.user._id,
      name,
      category: category || 'Groceries',
      quantity: Number(quantity) || 1,
      price: Number(price) || 0,
      purchased: false,
    });

    emitToCouple(relationshipId, 'shopping_created', { item });
    return sendSuccess(res, 'Shopping item added successfully.', { item }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateShoppingItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ShoppingItem.findById(id);

    if (!item) {
      return sendError(res, 'Shopping item not found.', 404);
    }

    if (item.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    const allowedUpdates = ['name', 'category', 'quantity', 'price', 'purchased'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        item[key] = req.body[key];
      }
    }

    await item.save();

    emitToCouple(req.user.relationshipId, 'shopping_updated', { item });
    return sendSuccess(res, 'Shopping item updated successfully.', { item });
  } catch (error) {
    next(error);
  }
};

export const deleteShoppingItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ShoppingItem.findById(id);

    if (!item) {
      return sendError(res, 'Shopping item not found.', 404);
    }

    if (item.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'Unauthorized.', 403);
    }

    await ShoppingItem.deleteOne({ _id: id });

    emitToCouple(req.user.relationshipId, 'shopping_deleted', { itemId: id });
    return sendSuccess(res, 'Shopping item deleted successfully.');
  } catch (error) {
    next(error);
  }
};
