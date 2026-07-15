import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'mock-cloud',
  api_key: process.env.CLOUDINARY_API_KEY || 'mock-key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'mock-secret',
});

class CloudinaryStorage {
  constructor(opts) {
    this.cloudinary = opts.cloudinary;
  }
  _handleFile(req, file, cb) {
    const isCloudinaryConfigured = !!process.env.CLOUDINARY_API_KEY;
    if (!isCloudinaryConfigured) {
      // Mock fallback if cloudinary keys aren't set
      let resource_type = 'Media';
      if (file.mimetype.startsWith('video/')) resource_type = 'Video';
      file.path = `https://placehold.co/600x400/EEE/31343C?text=Mock+${resource_type}`;
      cb(null, { path: file.path, size: 0 });
      return;
    }
    
    let resource_type = 'auto';
    if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      resource_type = 'video';
    }
    
    const uploadStream = this.cloudinary.uploader.upload_stream(
      { folder: 'onlyforus/memories', resource_type: resource_type },
      (error, result) => {
        if (error) return cb(error);
        cb(null, { path: result.secure_url, size: result.bytes });
      }
    );
    file.stream.pipe(uploadStream);
  }
  _removeFile(req, file, cb) {
    delete file.path;
    cb(null);
  }
}

const storage = new CloudinaryStorage({ cloudinary });

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
