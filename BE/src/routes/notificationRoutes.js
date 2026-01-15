import express from 'express';
import { getNotifications, markRead } from '../controllers/requestController.js'; // Reusing controller for convenience
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getNotifications);
router.put('/read-all', authMiddleware, markRead);

export default router;
