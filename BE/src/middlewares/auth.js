import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No authorization header provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token found in authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    
    if (!decoded.userId) {
      console.log('❌ Token decoded but no userId found:', decoded);
      return res.status(401).json({ message: 'Invalid token: No user ID found' });
    }

    console.log('✅ Token decoded successfully, userId:', decoded.userId);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      console.log('❌ User not found in database for userId:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log('✅ User found:', { id: user._id, email: user.email, name: user.name });

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const ownerMiddleware = (req, res, next) => {
  if (req.user.role !== 'owner' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Owner or Admin only.' });
  }
  next();
};


