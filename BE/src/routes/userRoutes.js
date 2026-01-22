import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getAllUsers, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// Protect all routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

export default router;
