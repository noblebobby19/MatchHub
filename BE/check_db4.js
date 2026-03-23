import connectDB from './src/config/database.js';
import User from './src/models/User.js';
import Booking from './src/models/Booking.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 }).limit(3).populate('userId', 'name email');
    let out = '';
    for (const b of bookings) {
       out += `Booking ID: ${b._id}\nStatus: ${b.status}\nCustomerName: ${b.customer}\nCustomerEmail (DB): '${b.customerEmail}'\nuserIdEmail: '${b.userId?.email}'\nCalcEmail: '${b.customerEmail || b.userId?.email}'\n---\n`;
    }
    fs.writeFileSync('db_out2.txt', out, 'utf8');
  } catch(e) { console.error('Error', e); }
  process.exit(0);
});
