import connectDB from './src/config/database.js';
import Booking from './src/models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

connectDB().then(async () => {
  try {
    const booking = await Booking.findOne({ bookingCode: 'DAT_SAN_KAHMP2' });
    if (booking) {
      booking.status = 'REFUND_PENDING';
      await booking.save();
      console.log('✅ Đã cập nhật trạng thái DAT_SAN_KAHMP2 sang REFUND_PENDING!');
    } else {
      console.log('❌ Không tìm thấy mã đơn KAHMP2');
    }
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
});
