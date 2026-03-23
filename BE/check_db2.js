import connectDB from './src/config/database.js';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
  const bookings = await Booking.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name email');
  bookings.forEach(b => {
    console.log(`Booking ID: ${b._id}`);
    console.log(`Status: ${b.status}`);
    console.log(`CustomerName: ${b.customer}`);
    console.log(`CustomerEmail (DB): '${b.customerEmail}'`);
    console.log(`userIdEmail (Populated): '${b.userId?.email}'`);
    console.log(`Calculated userEmail: '${b.customerEmail || b.userId?.email}'`);
    console.log('---');
  });
  process.exit(0);
}).catch(console.error);
