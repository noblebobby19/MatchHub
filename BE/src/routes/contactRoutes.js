import express from 'express';
import {
    createContact,
    getAllContacts,
    replyContact,
    deleteContact
} from '../controllers/contactController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.route('/')
    .post(authMiddleware, createContact)
    .get(authMiddleware, adminMiddleware, getAllContacts);

router.route('/:id/reply')
    .put(authMiddleware, adminMiddleware, replyContact);

router.route('/:id')
    .delete(authMiddleware, adminMiddleware, deleteContact);

export default router;
