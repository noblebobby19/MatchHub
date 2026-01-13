import express from 'express';
import {
  getFields,
  getFieldById,
  createField,
  updateField,
  deleteField,
  getMyFields
} from '../controllers/fieldController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { ownerMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getFields);
router.get('/my', authMiddleware, ownerMiddleware, getMyFields);
router.get('/:id', getFieldById);
router.post('/', authMiddleware, ownerMiddleware, createField);
router.put('/:id', authMiddleware, ownerMiddleware, updateField);
router.delete('/:id', authMiddleware, ownerMiddleware, deleteField);

export default router;


