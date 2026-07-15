import { v2 as cloudinary } from 'cloudinary';
import Media from '../models/Media.js';

// Helper to upload buffer directly and return full result
const uploadBufferToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('⚠️ Cloudinary not configured. Mocking response.');
      return resolve({
        public_id: 'mock_id_' + Date.now(),
        secure_url: 'https://placehold.co/600x400/EEE/31343C?text=Mock+Image',
        width: 600,
        height: 400,
        format: 'png',
        bytes: 1024
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

export const uploadMedia = async (req, res) => {
  try {
    const { caption } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Determine receiver (partner)
    const receiverId = req.user.partnerId;
    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'No partner connected' });
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary(file.buffer, 'only_for_us/media');

    // Create thumbnail URL by transforming the secure URL
    // e.g. upload/v1234/folder/file.jpg -> upload/c_thumb,w_200/v1234/folder/file.jpg
    let thumbnailUrl = result.secure_url;
    if (result.resource_type === 'image' && process.env.CLOUDINARY_CLOUD_NAME) {
      thumbnailUrl = result.secure_url.replace('/upload/', '/upload/c_thumb,w_400,q_auto/');
    }

    // Save to database
    const media = new Media({
      relationshipId: req.user.relationshipId,
      senderId: req.user._id,
      receiverId,
      cloudinaryPublicId: result.public_id,
      imageUrl: result.secure_url,
      thumbnailUrl,
      originalFileName: file.originalname,
      fileSize: file.size,
      width: result.width || 0,
      height: result.height || 0,
      mimeType: file.mimetype,
      caption: caption || ''
    });

    await media.save();

    res.status(201).json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Upload Media Error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload media', error: error.message });
  }
};

export const getMedia = async (req, res) => {
  try {
    const { page = 1, limit = 50, favorite } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      relationshipId: req.user.relationshipId,
      $or: [
        { senderId: req.user._id, deletedForSender: false },
        { receiverId: req.user._id, deletedForReceiver: false }
      ]
    };

    if (favorite === 'true') {
      query.favoritedBy = req.user._id;
    }

    const media = await Media.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('senderId', 'name avatar');

    const total = await Media.countDocuments(query);

    res.status(200).json({
      success: true,
      data: media,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch media' });
  }
};

export const downloadMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await Media.findOne({
      _id: id,
      relationshipId: req.user.relationshipId
    });

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    // Increment download count
    media.downloadedCount += 1;
    await media.save();

    res.status(200).json({
      success: true,
      downloadUrl: media.imageUrl,
      fileName: media.originalFileName
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process download' });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const media = await Media.findOne({
      _id: id,
      relationshipId: req.user.relationshipId
    });

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const isFavorited = media.favoritedBy.includes(userId);
    if (isFavorited) {
      media.favoritedBy = media.favoritedBy.filter(id => id.toString() !== userId.toString());
    } else {
      media.favoritedBy.push(userId);
    }

    await media.save();

    res.status(200).json({
      success: true,
      isFavorited: !isFavorited,
      media
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle favorite' });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'me' or 'everyone'
    const userId = req.user._id;

    const media = await Media.findOne({
      _id: id,
      relationshipId: req.user.relationshipId
    });

    if (!media) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    if (type === 'everyone') {
      // Must be sender to delete for everyone
      if (media.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete for everyone' });
      }

      // Hard delete from Cloudinary and DB
      if (process.env.CLOUDINARY_CLOUD_NAME && media.cloudinaryPublicId && !media.cloudinaryPublicId.startsWith('mock_')) {
        await cloudinary.uploader.destroy(media.cloudinaryPublicId);
      }
      
      await Media.deleteOne({ _id: id });
      
      return res.status(200).json({ success: true, message: 'Deleted for everyone', hardDelete: true });
    } else {
      // Soft delete for 'me'
      if (media.senderId.toString() === userId.toString()) {
        media.deletedForSender = true;
      } else {
        media.deletedForReceiver = true;
      }

      await media.save();

      // If both deleted, prune it
      if (media.deletedForSender && media.deletedForReceiver) {
        if (process.env.CLOUDINARY_CLOUD_NAME && media.cloudinaryPublicId && !media.cloudinaryPublicId.startsWith('mock_')) {
          await cloudinary.uploader.destroy(media.cloudinaryPublicId);
        }
        await Media.deleteOne({ _id: id });
        return res.status(200).json({ success: true, message: 'Pruned from database', hardDelete: true });
      }

      return res.status(200).json({ success: true, message: 'Deleted for me', hardDelete: false });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete media' });
  }
};

export const markViewed = async (req, res) => {
  try {
    const { id } = req.params;
    
    const media = await Media.findOneAndUpdate(
      { _id: id, receiverId: req.user._id, relationshipId: req.user.relationshipId },
      { viewed: true },
      { new: true }
    );

    res.status(200).json({ success: true, media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to mark viewed' });
  }
};
