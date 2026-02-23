import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Dùng memory storage (không lưu xuống đĩa) - phù hợp với Cloudinary stream
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// Route upload ảnh → Cloudinary
router.post('/image', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    // Upload buffer lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'matchhub/fields', // Thư mục lưu trên Cloudinary
          resource_type: 'image',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    // Trả về URL Cloudinary (URL public, không bao giờ mất)
    res.json({
      message: 'Upload ảnh thành công',
      imagePath: result.secure_url,  // URL đầy đủ: https://res.cloudinary.com/...
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi upload ảnh' });
  }
});

export default router;
