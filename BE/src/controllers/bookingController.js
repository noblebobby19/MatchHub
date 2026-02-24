import Booking from '../models/Booking.js';
import Field from '../models/Field.js';
import User from '../models/User.js';
import BankConfig from '../models/BankConfig.js';
import sendEmail from '../utils/sendEmail.js';

export const createBooking = async (req, res) => {
  try {
    console.log('📝 Creating booking...');
    console.log('Request body:', req.body);
    console.log('User from auth middleware:', req.user ? { id: req.user._id, email: req.user.email, name: req.user.name } : 'NO USER');

    // Kiểm tra user có tồn tại không
    if (!req.user || !req.user._id) {
      console.error('❌ No user found in request. req.user:', req.user);
      return res.status(401).json({ message: 'User ID không được cung cấp. Vui lòng đăng nhập lại.' });
    }

    const { fieldId, date, time, timeSlot, amount } = req.body;

    if (!fieldId || !date || !time || !amount) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra field có tồn tại trong database không
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Field not found' });
    }

    // Lấy thông tin user từ database (đảm bảo user vẫn tồn tại)
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ User not found in database:', req.user._id);
      return res.status(404).json({ message: 'User không tồn tại trong hệ thống' });
    }

    console.log('✅ User found:', { id: user._id, name: user.name, email: user.email });

    // Check for existing bookings
    // Chỉ block nếu đã có booking 'confirmed' hoặc 'completed'.
    // 'pending' bookings không block người khác đặt (tùy logic business, ở đây theo yêu cầu là chờ duyệt thì người khác vẫn đặt được)
    const existingBooking = await Booking.findOne({
      fieldId,
      date,
      time,
      status: { $in: ['confirmed', 'CONFIRMED', 'completed'] }
    });

    const myPendingBooking = await Booking.findOne({
      fieldId,
      date,
      time,
      userId: req.user._id,
      status: { $in: ['pending', 'PENDING'] }
    });

    if (existingBooking) {
      return res.status(409).json({ message: 'Khung giờ này đã được đặt (Đã xác nhận). Vui lòng chọn giờ khác.' });
    }

    if (myPendingBooking) {
      return res.status(409).json({ message: 'Bạn đã đặt khung giờ này rồi và đang chờ duyệt.' });
    }

    console.log('✅ Slot available, proceeding to create booking...');

    // Tạo booking mới và lưu vào database
    const booking = await Booking.create({
      fieldId,
      userId: req.user._id,
      fieldName: field.name,
      customer: user.name,
      date,
      time,
      timeSlot,
      status: 'pending',
      amount,
      amountValue: parseInt(amount.replace(/[^\d]/g, '')) || 0
    });

    console.log('✅ Booking created successfully:', { id: booking._id, userId: booking.userId });

    // Trả về booking đã được lưu vào database
    res.status(201).json(booking);
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi tạo booking' });
  }
};

export const checkAvailability = async (req, res) => {
  try {
    const { fieldId, date, userId } = req.query;

    if (!fieldId || !date) {
      return res.status(400).json({ message: 'Thiếu thông tin fieldId hoặc ngày.' });
    }

    console.log(`🔍 Checking availability for Field: ${fieldId}, Date: ${date}, User: ${userId || 'Guest'}`);

    // Logic:
    // 1. Lấy tất cả booking confirmed/completed (để hiện là đã đặt cho tất cả mọi người)
    // 2. Lấy booking pending CỦA USER ĐÓ (để hiện là đã đặt/chờ duyệt cho chính họ)
    // 3. Booking pending của người khác KHÔNG lấy (với họ thì slot đó vẫn trống)

    const query = {
      fieldId,
      date,
      $or: [
        { status: { $in: ['confirmed', 'CONFIRMED', 'completed'] } }, // Confirmed bookings are always blocked
        ...(userId ? [{ status: { $in: ['pending', 'PENDING'] }, userId }] : []) // Own pending bookings are shown
      ]
    };

    const bookings = await Booking.find(query).select('time timeSlot status');

    // Return list of booked times
    const bookedSlots = bookings.map(b => ({
      time: b.time,
      status: b.status
    }));

    res.json(bookedSlots);
  } catch (error) {
    console.error('❌ Error checking availability:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    console.log('🔍 getBookings called by user:', req.user.role, req.user.email);
    // Lấy dữ liệu từ database
    let query = {};

    // Owner (acting as Admin) can see all bookings
    if (req.user.role === 'owner') {
      console.log('✅ Owner (Admin) user - fetching all bookings');
      // No query filter - get all bookings
    } else {
      console.log('✅ Regular user - fetching own bookings');
      // Regular users only see their own bookings
      query.userId = req.user._id;
    }

    // Lấy tất cả bookings từ database với populate để lấy thông tin liên quan
    const bookings = await Booking.find(query)
      .populate('fieldId', 'name location image')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${bookings.length} bookings`);
    // Trả về dữ liệu từ database
    res.json(bookings);
  } catch (error) {
    console.error('❌ Error in getBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    // Lấy booking từ database theo ID
    const booking = await Booking.findById(req.params.id)
      .populate('fieldId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    }

    // Check access - admin can see all, owner can see their field bookings, user can see their own
    // Check access - owner (admin) can see all, user can see their own
    if (req.user.role !== 'owner') {
      if (booking.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền xem đơn đặt sân này.' });
      }
    }

    // Trả về dữ liệu từ database
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Notification from '../models/Notification.js';

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Lấy booking từ database
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    }

    // Lấy field từ database để kiểm tra quyền
    // Admin/Owner can update any booking
    if (req.user.role !== 'owner') {
      // Regular user can only update their own bookings
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật đơn này.' });
      }
    }

    // Nếu duyệt đơn (confirmed), kiểm tra xem khung giờ này đã có đơn nào được duyệt chưa
    if (status === 'confirmed') {
      const conflictingBooking = await Booking.findOne({
        _id: { $ne: booking._id }, // Không tính chính nó
        fieldId: booking.fieldId,
        date: booking.date,
        time: booking.time,
        status: 'confirmed'
      });

      if (conflictingBooking) {
        return res.status(409).json({
          message: 'Khung giờ này đã được duyệt cho một đội khác. Vui lòng từ chối đơn này hoặc hủy đơn đã duyệt trước đó.'
        });
      }
    }

    // Cập nhật status và lưu vào database
    booking.status = status;
    await booking.save();

    // Create notification for the user
    try {
      const statusText = status === 'confirmed' ? 'Duyệt' : status === 'cancelled' || status === 'rejected' ? 'Từ chối' : status;
      let message = `Đơn đặt sân ${booking.fieldName} của bạn (ngày ${booking.date} lúc ${booking.time}) đã được ${statusText}`;

      if (status === 'confirmed') {
        message = `✅ Đơn đặt sân ${booking.fieldName} của bạn đã được Xác nhận!\nNgày: ${booking.date}\nGiờ: ${booking.time}`;
      } else if (status === 'cancelled' || status === 'rejected') {
        message = `❌ Đơn đặt sân ${booking.fieldName} của bạn đã bị Từ chối/Hủy.\nNgày: ${booking.date}\nGiờ: ${booking.time}`;
      }

      await Notification.create({
        user: booking.userId,
        title: 'Cập nhật trạng thái đặt sân',
        message: message,
        type: status === 'confirmed' ? 'success' : 'error',
        link: `/chi-tiet-don-dat-san/${booking._id}`
      });
      console.log('🔔 Notification created for user:', booking.userId);
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError);
      // Don't fail the request if notification fails
    }

    // Trả về booking đã được cập nhật từ database
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy đơn đặt sân.' });
    }


    if (req.user.role !== 'owner') {
      // Regular user can only delete their own bookings
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa đơn này.' });
      }
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa đơn đặt sân thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════
//  BANKING PAYMENT FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

/**
 * Sinh booking_code ngẫu nhiên dạng DAT_SAN_XXXXXX
 */
const generateBookingCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DAT_SAN_${code}`;
};

/**
 * POST /api/bookings/banking
 * Tạo booking chuyển khoản: sinh bookingCode, tính depositAmount, set expireAt
 * Auth: user đã đăng nhập
 */
export const createBankingBooking = async (req, res) => {
  try {
    console.log('💳 Creating BANKING booking...');

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để đặt sân.' });
    }

    const { fieldId, date, time, timeSlot, amount } = req.body;

    if (!fieldId || !date || !time || !amount) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra field
    const field = await Field.findById(fieldId);
    if (!field) return res.status(404).json({ message: 'Sân không tồn tại' });

    // Kiểm tra user
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User không tồn tại' });

    // Kiểm tra slot đã được confirmed chưa
    const existingConfirmed = await Booking.findOne({
      fieldId, date, time,
      status: { $in: ['confirmed', 'CONFIRMED', 'completed'] }
    });
    if (existingConfirmed) {
      return res.status(409).json({ message: 'Khung giờ này đã được đặt. Vui lòng chọn giờ khác.' });
    }

    // Kiểm tra user đã đặt slot này chưa (đang PENDING banking)
    const myPending = await Booking.findOne({
      fieldId, date, time,
      userId: req.user._id,
      status: { $in: ['pending', 'PENDING'] }
    });
    if (myPending) {
      return res.status(409).json({ message: 'Bạn đã có đơn đặt sân này đang chờ xác nhận.' });
    }

    // Lấy cấu hình ngân hàng
    let bankConfig = await BankConfig.findOne();
    if (!bankConfig) {
      bankConfig = await BankConfig.create({
        bankCode: 'MB',
        accountNumber: '0336743580',
        accountName: 'TRAN LE HOANG THIEN',
        depositPercent: 30
      });
    }

    // Tính tiền
    const amountValue = parseInt(String(amount).replace(/[^\d]/g, '')) || 0;
    const depositAmount = Math.round(amountValue * bankConfig.depositPercent / 100);

    // Sinh booking code (đảm bảo unique)
    let bookingCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      bookingCode = generateBookingCode();
      const existing = await Booking.findOne({ bookingCode });
      if (!existing) isUnique = true;
      attempts++;
    }

    const expireAt = new Date(Date.now() + 15 * 60 * 1000); // +15 phút

    // Tạo booking
    const booking = await Booking.create({
      fieldId,
      userId: req.user._id,
      fieldName: field.name,
      customer: user.name,
      date,
      time,
      timeSlot: timeSlot || time,
      status: 'PENDING',
      amount: String(amount),
      amountValue,
      paymentMethod: 'banking',
      bookingCode,
      depositAmount,
      expireAt
    });

    console.log(`✅ Banking booking created: ${bookingCode}, deposit: ${depositAmount}đ, expires: ${expireAt}`);

    res.status(201).json({
      booking,
      bookingCode,
      depositAmount,
      expireAt,
      bankConfig: {
        bankCode: bankConfig.bankCode,
        accountNumber: bankConfig.accountNumber,
        accountName: bankConfig.accountName
      }
    });
  } catch (error) {
    console.error('❌ Error creating banking booking:', error);
    res.status(500).json({ message: error.message || 'Lỗi khi tạo booking' });
  }
};

/**
 * PUT /api/bookings/:id/confirm
 * Owner xác nhận đã nhận tiền → PENDING → CONFIRMED
 * Auth: owner only
 */
export const confirmPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('userId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

    if (booking.paymentMethod !== 'banking') {
      return res.status(400).json({ message: 'Booking này không phải chuyển khoản' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: `Không thể xác nhận booking đang ở trạng thái ${booking.status}` });
    }

    // Kiểm tra conflict slot
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      fieldId: booking.fieldId,
      date: booking.date,
      time: booking.time,
      status: { $in: ['confirmed', 'CONFIRMED'] }
    });
    if (conflict) {
      return res.status(409).json({ message: 'Khung giờ này đã được xác nhận cho đơn khác.' });
    }

    booking.status = 'CONFIRMED';
    await booking.save();

    // Gửi notification
    try {
      await Notification.create({
        user: booking.userId._id || booking.userId,
        title: '✅ Đặt sân thành công!',
        message: `Đơn đặt sân ${booking.fieldName} (${booking.date} - ${booking.time}) đã được xác nhận. Mã đơn: ${booking.bookingCode}`,
        type: 'success',
        link: `/chi-tiet-don-dat-san/${booking._id}`
      });
    } catch (e) { console.error('Notification error:', e.message); }

    // Gửi email cho user
    try {
      const userEmail = booking.userId?.email;
      if (userEmail) {
        await sendEmail({
          email: userEmail,
          subject: '✅ MatchHub – Đặt sân thành công!',
          message: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#16a34a">🏟️ Đặt sân thành công!</h2>
              <p>Xin chào <strong>${booking.userId?.name || booking.customer}</strong>,</p>
              <p>Chủ sân đã xác nhận đơn đặt sân của bạn.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;background:#f0fdf4"><strong>Mã đơn:</strong></td><td style="padding:8px">${booking.bookingCode}</td></tr>
                <tr><td style="padding:8px"><strong>Sân:</strong></td><td style="padding:8px">${booking.fieldName}</td></tr>
                <tr><td style="padding:8px;background:#f0fdf4"><strong>Ngày:</strong></td><td style="padding:8px">${booking.date}</td></tr>
                <tr><td style="padding:8px"><strong>Giờ:</strong></td><td style="padding:8px">${booking.time}</td></tr>
                <tr><td style="padding:8px;background:#f0fdf4"><strong>Tiền cọc đã thanh toán:</strong></td><td style="padding:8px">${booking.depositAmount?.toLocaleString('vi-VN')}đ</td></tr>
              </table>
              <p>Cảm ơn bạn đã sử dụng MatchHub! 🎉</p>
            </div>
          `
        });
        console.log('📧 Confirmation email sent to:', userEmail);
      }
    } catch (e) { console.error('Email error:', e.message); }

    res.json({ message: 'Xác nhận thanh toán thành công', booking });
  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/bookings/:id/cancel
 * User hủy booking: trước 24h → REFUND_PENDING, sau 24h → CANCELLED
 * Auth: user (chỉ hủy đơn của mình)
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('fieldId');

    if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

    // Chỉ owner của booking hoặc chủ sân mới được hủy
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Bạn không có quyền hủy đơn này' });
    }

    if (!['PENDING', 'CONFIRMED', 'pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: `Không thể hủy đơn đang ở trạng thái ${booking.status}` });
    }

    // [MỚI] Chỉ cho phép hủy đơn Banking. Đơn Tiền mặt không được hủy từ phía User.
    if (booking.paymentMethod === 'cash' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Đơn đặt sân thanh toán tiền mặt không thể hủy. Vui lòng liên hệ chủ sân.' });
    }

    // Kiểm tra 24h: booking.date + booking.time so với hiện tại
    const [year, month, day] = booking.date.split('-').map(Number);
    const [startHour] = booking.time.split(':').map(Number);
    const bookingDateTime = new Date(year, month - 1, day, startHour, 0, 0);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    let newStatus;
    let isRefundable = false;

    // Chỉ áp dụng hoàn tiền cho confirmed banking
    if (booking.paymentMethod === 'banking' && (booking.status === 'CONFIRMED' || booking.status === 'confirmed')) {
      if (diffHours >= 24) {
        newStatus = 'REFUND_PENDING';
        isRefundable = true;
      } else {
        newStatus = 'CANCELLED';
        isRefundable = false;
      }
    } else {
      // Các trường hợp khác (Cash hoặc chưa Confirm) hủy là xong
      newStatus = booking.paymentMethod === 'banking' ? 'CANCELLED' : 'cancelled';
    }

    booking.status = newStatus;
    booking.cancelledAt = now;
    await booking.save();

    // Notification cho User
    try {
      const userNotifTitle = isRefundable ? '💸 Đã hủy – Chờ hoàn tiền' : '❌ Đã hủy đặt sân';
      const userNotifMsg = isRefundable
        ? `Đơn ${booking.bookingCode} đã hủy trước 24h. Bạn sẽ nhận lại ${booking.depositAmount?.toLocaleString('vi-VN')}đ tiền cọc.`
        : (booking.paymentMethod === 'banking' && diffHours < 24)
          ? `Đơn ${booking.bookingCode} đã hủy trễ hạn. Theo chính sách, bạn không được hoàn lại tiền cọc.`
          : `Đơn đặt sân ${booking.fieldName} ngày ${booking.date} đã bị hủy.`;

      await Notification.create({
        user: booking.userId._id,
        title: userNotifTitle,
        message: userNotifMsg,
        type: isRefundable ? 'warning' : 'error',
        link: `/chi-tiet-don-dat-san/${booking._id}`
      });
    } catch (e) { console.error('User Notification error:', e.message); }

    // Notification cho Chủ Sân (Owner)
    try {
      const field = booking.fieldId;
      if (field && field.ownerId) {
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

        const ownerMsg = `Đơn ${booking.bookingCode || booking._id} đã bị hủy lúc ${timeStr} ngày ${dateStr}.\n${isRefundable ? '✅ Đủ điều kiện hoàn tiền.' : '❌ Không hoàn tiền (hủy trễ hạn).'}`;

        await Notification.create({
          user: field.ownerId,
          title: '📢 Khách vừa hủy đơn đặt sân',
          message: ownerMsg,
          type: 'info',
          link: '/owner-dashboard'
        });
      }
    } catch (e) { console.error('Owner Notification error:', e.message); }

    res.json({
      message: `Hủy đơn thành công.`,
      status: newStatus,
      isRefundable,
      booking
    });
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * PUT /api/bookings/:id/refunded
 * Owner đánh dấu đã hoàn tiền → REFUND_PENDING → REFUNDED
 * Auth: owner only
 */
export const markRefunded = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('userId', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking không tồn tại' });

    if (booking.status !== 'REFUND_PENDING') {
      return res.status(400).json({ message: `Booking không ở trạng thái REFUND_PENDING, hiện tại: ${booking.status}` });
    }

    booking.status = 'REFUNDED';
    booking.refundedAt = new Date();
    await booking.save();

    // Notification
    try {
      await Notification.create({
        user: booking.userId._id || booking.userId,
        title: '✅ Hoàn tiền thành công',
        message: `Chủ sân đã hoàn ${booking.depositAmount?.toLocaleString('vi-VN')}đ tiền cọc cho đơn ${booking.bookingCode}.`,
        type: 'success',
        link: `/chi-tiet-don-dat-san/${booking._id}`
      });
    } catch (e) { console.error('Notification error:', e.message); }

    // Gửi email hoàn tiền
    try {
      const userEmail = booking.userId?.email;
      if (userEmail) {
        await sendEmail({
          email: userEmail,
          subject: '💸 MatchHub – Hoàn tiền thành công',
          message: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#2563eb">💸 Hoàn tiền thành công</h2>
              <p>Xin chào <strong>${booking.userId?.name || booking.customer}</strong>,</p>
              <p>Chủ sân đã hoàn lại tiền cọc cho đơn hủy của bạn.</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr><td style="padding:8px;background:#eff6ff"><strong>Mã đơn:</strong></td><td style="padding:8px">${booking.bookingCode}</td></tr>
                <tr><td style="padding:8px"><strong>Số tiền hoàn:</strong></td><td style="padding:8px;color:#16a34a;font-weight:bold">${booking.depositAmount?.toLocaleString('vi-VN')}đ</td></tr>
                <tr><td style="padding:8px;background:#eff6ff"><strong>Sân:</strong></td><td style="padding:8px">${booking.fieldName}</td></tr>
              </table>
              <p>Cảm ơn bạn đã tin tưởng sử dụng MatchHub!</p>
            </div>
          `
        });
        console.log('📧 Refund email sent to:', userEmail);
      }
    } catch (e) { console.error('Email error:', e.message); }

    res.json({ message: 'Đã đánh dấu hoàn tiền thành công', booking });
  } catch (error) {
    console.error('❌ Error marking refunded:', error);
    res.status(500).json({ message: error.message });
  }
};


