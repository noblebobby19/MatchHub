import express from 'express';
import { getBankConfig, updateBankConfig } from '../controllers/bankConfigController.js';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/bank-config – Public (frontend cần để render QR)
router.get('/', getBankConfig);

// PUT /api/bank-config – Admin only (chỉ admin được đổi thông tin QR)
router.put('/', authMiddleware, adminMiddleware, updateBankConfig);

export default router;
