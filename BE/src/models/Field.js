import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  fullAddress: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  price: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  size: {
    type: String,
    required: true,
    enum: ['Sân 5 người', 'Sân 7 người', 'Sân 11 người']
  },
  type: {
    type: String,
    required: true,
    enum: ['Cỏ nhân tạo', 'Trong nhà']
  },
  available: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'maintenance'],
    default: 'active'
  },
  description: {
    type: String,
    default: ''
  },
  features: {
    type: [String],
    default: []
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  openTime: {
    type: String,
    default: '5:00 - 23:00'
  },
  timeSlots: {
    type: [timeSlotSchema],
    default: []
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Field = mongoose.model('Field', fieldSchema);

export default Field;


