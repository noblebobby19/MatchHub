import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('❌ No authorization header provided');
      return res.status(401).json({ message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token found in authorization header');
      return res.status(401).json({ message: 'Không tìm thấy token xác thực. Vui lòng đăng nhập.' });
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

    if (!decoded.userId) {
      console.log('❌ Token decoded but no userId found:', decoded);
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }

    console.log('✅ Token decoded successfully, userId:', decoded.userId);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('❌ User not found in database for userId:', decoded.userId);
      return res.status(401).json({ message: 'Không tìm thấy người dùng. Vui lòng đăng nhập lại.' });
    }

    console.log('✅ User found:', { id: user._id, email: user.email, name: user.name });

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token không hợp lệ.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' });
    }
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};


export const ownerMiddleware = (req, res, next) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ dành cho chủ sân.' });
  }
  next();
};

export const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Truy cập bị từ chối. Chỉ dành cho quản trị viên.' });
  }
};
