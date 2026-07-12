import Wishlist from '../models/Wishlist.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { emitToCouple } from '../socket/socket.js';
import logger from '../utils/logger.js';

/**
 * GET /api/wishlist
 */
export const getWishlist = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to access the wishlist.', 400);
    }

    const items = await Wishlist.find({ relationshipId }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Wishlist items fetched successfully.', { items });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/wishlist
 */
export const createWishlistItem = async (req, res, next) => {
  try {
    const relationshipId = req.user.relationshipId;
    if (!relationshipId) {
      return sendError(res, 'You must be in a relationship to add wishlist items.', 400);
    }

    const { title, description, price, url } = req.body;
    if (!title) {
      return sendError(res, 'Wishlist item title is required.', 400);
    }

    let imageUrl = null;
    if (req.file) {
      // Upload item image attachment to Cloudinary wishlists folder
      imageUrl = await uploadToCloudinary(req.file.buffer, 'wishlists');
    }

    const item = await Wishlist.create({
      relationshipId,
      title,
      description: description || '',
      price: price ? Number(price) : 0,
      url: url || '',
      image: imageUrl,
      createdBy: req.user._id,
      purchased: false,
    });

    logger.info(`Wishlist item logged: "${item.title}" in relationship space ${relationshipId}`);

    // Broadcast update event to room
    emitToCouple(relationshipId, 'wishlist_created', { item });

    return sendSuccess(res, 'Wishlist item created successfully.', { item }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/wishlist/:id
 */
export const updateWishlistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Wishlist.findById(id);

    if (!item) {
      return sendError(res, 'Wishlist item not found.', 404);
    }

    if (item.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to edit this wishlist item.', 403);
    }

    const allowedUpdates = ['title', 'description', 'price', 'url', 'purchased'];
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        if (key === 'price') {
          item.price = Number(req.body.price);
        } else if (key === 'purchased') {
          item.purchased = !!req.body.purchased;
        } else {
          item[key] = req.body[key];
        }
      }
    }

    // Process new image upload if provided
    if (req.file) {
      const oldImage = item.image;
      const imageUrl = await uploadToCloudinary(req.file.buffer, 'wishlists');
      item.image = imageUrl;

      // Clean up previous image
      if (oldImage) {
        deleteFromCloudinary(oldImage);
      }
    }

    await item.save();

    logger.info(`Wishlist item updated: ID ${item._id}`);

    // Broadcast update event to room
    emitToCouple(req.user.relationshipId, 'wishlist_updated', { item });

    return sendSuccess(res, 'Wishlist item updated successfully.', { item });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/wishlist/:id
 */
export const deleteWishlistItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await Wishlist.findById(id);

    if (!item) {
      return sendError(res, 'Wishlist item not found.', 404);
    }

    if (item.relationshipId.toString() !== req.user.relationshipId.toString()) {
      return sendError(res, 'You are not authorized to delete this wishlist item.', 403);
    }

    const oldImage = item.image;

    await Wishlist.deleteOne({ _id: id });

    // Delete image from Cloudinary
    if (oldImage) {
      deleteFromCloudinary(oldImage);
    }

    logger.info(`Wishlist item deleted: ID ${id}`);

    // Broadcast delete event to room
    emitToCouple(req.user.relationshipId, 'wishlist_deleted', { itemId: id });

    return sendSuccess(res, 'Wishlist item deleted successfully.');
  } catch (error) {
    next(error);
  }
};
