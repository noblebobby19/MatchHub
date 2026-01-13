import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  checkAvailability
} from '../controllers/bookingController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getBookings);
router.get('/availability', checkAvailability);
router.get('/:id', authMiddleware, getBookingById);
router.put('/:id/status', authMiddleware, updateBookingStatus);
router.delete('/:id', authMiddleware, deleteBooking);

export default router;


