import connectDB from './src/config/database.js';
import Booking from './src/models/Booking.js';
import Notification from './src/models/Notification.js';
import process from 'process';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
    const booking = await Booking.findOne({ status: 'CANCELLED' }).sort({ _id: -1 });
    if (!booking) { console.log('Not found'); return; }
    console.log('--- FOUND RECENT CANCELLED BOOKING ---');
    console.log('Code:', booking.bookingCode);
    console.log('Status:', booking.status);
    console.log('PaymentMethod:', booking.paymentMethod);
    console.log('CreatedAt:', booking.createdAt);
    console.log('CancelledAt:', booking.cancelledAt);
    
    // Check diff hours
    const [year, month, day] = booking.date.split('-').map(Number);
    const [startHour] = booking.time.split(':').map(Number);
    const bookingDateTime = new Date(year, month - 1, day, startHour, 0, 0);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    console.log('Diff Hours:', diffMs / (1000 * 60 * 60));
    process.exit(0);
});
