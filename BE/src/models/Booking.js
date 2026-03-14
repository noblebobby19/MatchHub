import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Field',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  customer: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending', 'confirmed', 'cancelled', 'completed', // ← giữ nguyên cho tiền mặt
      'PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED' // ← mới cho banking
    ],
    default: 'pending'
  },
  amount: {
    type: String,
    required: true
  },
  amountValue: {
    type: Number,
    default: 0
  },

  // ── BANKING PAYMENT FIELDS ──────────────────────────────────────
  paymentMethod: {
    type: String,
    enum: ['cash', 'banking'],
    default: 'cash'
  },
  bookingCode: {
    type: String,
    unique: true,
    sparse: true // null được phép (booking tiền mặt không có code)
  },
  depositAmount: {
    type: Number,
    default: 0  // số tiền cọc (VD: 30% của amountValue)
  },
  expireAt: {
    type: Date,
    default: null // chỉ set khi paymentMethod = 'banking'
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  }
  // ───────────────────────────────────────────────────────────────
}, {
  timestamps: true
});

// Indexes for query optimization
bookingSchema.index({ fieldId: 1, date: 1, status: 1 });
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
