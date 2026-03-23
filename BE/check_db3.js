import connectDB from './src/config/database.js';
import User from './src/models/User.js';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name email');
    for (const b of bookings) {
      console.log(`Booking ID: ${b._id}`);
      console.log(`Status: ${b.status}`);
      console.log(`CustomerName: ${b.customer}`);
      console.log(`CustomerEmail (DB): '${b.customerEmail}'`);
      console.log(`userIdEmail (Populated): '${b.userId?.email}'`);
      console.log(`Calculated userEmail: '${b.customerEmail || b.userId?.email}'`);
      console.log('---');
    }
  } catch(e) { console.error('Error in query', e); }
  process.exit(0);
}).catch(console.error);
