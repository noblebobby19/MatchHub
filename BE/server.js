import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import fieldRoutes from './src/routes/fieldRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'MatchHub API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      fields: '/api/fields',
      bookings: '/api/bookings'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
});


