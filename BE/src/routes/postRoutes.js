import express from 'express';
import { createPost, getPosts, getMyPosts, getPostById, deletePost, updatePost } from '../controllers/postController.js';
import { createRequest, updateRequestStatus, getJoinedTeams } from '../controllers/requestController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/my', authMiddleware, getMyPosts); // Lấy bài của chính user (kể cả closed)
router.get('/:id', authMiddleware, getPostById);

// Protected routes
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

// Request routes (related to posts)
router.get('/request/joined', authMiddleware, getJoinedTeams); // Đội đã tham gia (accepted)
router.post('/request', authMiddleware, createRequest);
router.put('/request/:id', authMiddleware, updateRequestStatus);

export default router;
