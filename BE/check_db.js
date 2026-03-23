import connectDB from './src/config/database.js';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
  const b = await Booking.find().sort({ createdAt: -1 }).limit(1).populate('userId', 'email');
  if (b.length > 0) {
    console.log('Latest booking:', {
      _id: b[0]._id,
      customerEmail: b[0].customerEmail,
      userIdEmail: b[0].userId?.email,
      customer: b[0].customer,
      status: b[0].status
    });
  } else {
    console.log('No bookings found.');
  }
  process.exit(0);
}).catch(console.error);
