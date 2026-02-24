import cron from 'node-cron';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

/**
 * Cron job: Tự động expire các booking banking hết 15 phút
 * Chạy mỗi 1 phút
 */
const startExpireBookingsJob = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Tìm tất cả PENDING banking đã quá expireAt
            const expiredBookings = await Booking.find({
                status: 'PENDING',
                paymentMethod: 'banking',
                expireAt: { $lte: now }
            }).populate('userId', 'name email');

            if (expiredBookings.length === 0) return;

            console.log(`⏰ [Cron] Expiring ${expiredBookings.length} booking(s) at ${now.toISOString()}`);

            for (const booking of expiredBookings) {
                booking.status = 'EXPIRED';
                await booking.save();

                // Gửi notification cho user
                try {
                    await Notification.create({
                        user: booking.userId._id || booking.userId,
                        title: '⏰ Đơn đặt sân đã hết hạn',
                        message: `Đơn ${booking.bookingCode} (${booking.fieldName} - ${booking.date} ${booking.time}) đã hết hạn thanh toán. Vui lòng đặt lại nếu còn muốn sử dụng sân.`,
                        type: 'error',
                        link: `/lich-su-dat-san`
                    });
                } catch (e) {
                    console.error('❌ [Cron] Notification error:', e.message);
                }

                console.log(`✅ [Cron] Expired booking: ${booking.bookingCode}`);
            }
        } catch (error) {
            console.error('❌ [Cron] Error in expireBookings job:', error.message);
        }
    });

    console.log('⏰ Expire Bookings cron job started (runs every minute)');
};

export default startExpireBookingsJob;
