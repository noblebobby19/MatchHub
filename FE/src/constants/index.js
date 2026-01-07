// API Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Field Types
export const FIELD_TYPES = {
  ARTIFICIAL_GRASS: 'Cỏ nhân tạo',
  INDOOR: 'Trong nhà',
  OUTDOOR: 'Ngoài trời',
};

// Field Sizes
export const FIELD_SIZES = {
  FIVE: 'Sân 5 người',
  SEVEN: 'Sân 7 người',
  ELEVEN: 'Sân 11 người',
};

// User Roles
export const USER_ROLES = {
  USER: 'user',
  OWNER: 'owner',
};

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

// Time Slots
export const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

