import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  checkAvailability,
  // ── Banking payment ──
  createBankingBooking,
  confirmPayment,
  cancelBooking,
  markRefunded
} from '../controllers/bookingController.js';
import { authMiddleware, ownerMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// ── Routes cũ (tiền mặt) – KHÔNG thay đổi ──────────────────────────
router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/availability', checkAvailability);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/status', authMiddleware, updateBookingStatus);
router.delete('/:id', authMiddleware, deleteBooking);

// ── Routes mới (banking) ────────────────────────────────────────────
// User tạo booking chuyển khoản
router.post('/banking', authMiddleware, createBankingBooking);

// Owner xác nhận đã nhận tiền (PENDING → CONFIRMED)
router.put('/:id/confirm', authMiddleware, ownerMiddleware, confirmPayment);

// User hủy booking (trước 24h → REFUND_PENDING, sau 24h → CANCELLED)
router.put('/:id/cancel', authMiddleware, cancelBooking);

// Owner đánh dấu đã hoàn tiền (REFUND_PENDING → REFUNDED)
router.put('/:id/refunded', authMiddleware, ownerMiddleware, markRefunded);

export default router;
