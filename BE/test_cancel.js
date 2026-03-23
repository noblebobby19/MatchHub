import connectDB from './src/config/database.js';
import Booking from './src/models/Booking.js';
import Notification from './src/models/Notification.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
    const booking = await Booking.findOne({ bookingCode: 'DAT_SAN_KRIQKQT' });
    if (!booking) { console.log('Not found'); return; }
    console.log('--- FOUND KRIQKQT ---');
    console.log('Status:', booking.status);
    console.log('PaymentMethod:', booking.paymentMethod);
    console.log('CreatedAt:', booking.createdAt);
    console.log('CancelledAt:', booking.cancelledAt);
    
    const notifs = await Notification.find({ message: { $regex: 'KRIQKQT' } });
    console.log('--- Notifications ---');
    notifs.forEach(n => {
       console.log('Type:', n.type, 'Title:', n.title, 'Msg:', n.message);
    });
    process.exit(0);
});
