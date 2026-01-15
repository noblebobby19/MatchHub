import express from 'express';
import { createPost, getPosts, getPostById, deletePost, updatePost } from '../controllers/postController.js';
import { createRequest, updateRequestStatus } from '../controllers/requestController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:id', authMiddleware, getPostById); // Auth required to see sensitive info like phone or manage requests

// Protected routes
router.post('/', authMiddleware, createPost);
router.put('/:id', authMiddleware, updatePost);
router.delete('/:id', authMiddleware, deletePost);

// Request routes (related to posts)
router.post('/request', authMiddleware, createRequest);
router.put('/request/:id', authMiddleware, updateRequestStatus);

export default router;
