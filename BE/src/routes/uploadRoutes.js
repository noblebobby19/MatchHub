import express from 'express';
import upload from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Route upload ảnh
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Không có file được upload' });
    }

    // Trả về đường dẫn file (relative path)
    const filePath = `/uploads/images/${req.file.filename}`;
    
    res.json({
      message: 'Upload ảnh thành công',
      imagePath: filePath,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi upload ảnh' });
  }
});

// Route để serve static files (ảnh)
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

export default router;

