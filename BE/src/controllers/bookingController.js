import Booking from '../models/Booking.js';
import Field from '../models/Field.js';
import User from '../models/User.js';

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
      status: { $in: ['confirmed', 'completed'] }
    });

    // Tuy nhiên, nếu user hiện tại đã đặt slot này rồi (đang chờ duyệt) thì báo đã đặt
    const myPendingBooking = await Booking.findOne({
      fieldId,
      date,
      time,
      userId: req.user._id,
      status: 'pending'
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
      return res.status(400).json({ message: 'Missing fieldId or date' });
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
        { status: { $in: ['confirmed', 'completed'] } }, // Confirmed bookings are always blocked
        ...(userId ? [{ status: 'pending', userId }] : []) // Own pending bookings are shown
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
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check access - admin can see all, owner can see their field bookings, user can see their own
    // Check access - owner (admin) can see all, user can see their own
    if (req.user.role !== 'owner') {
      if (booking.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
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
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Lấy field từ database để kiểm tra quyền
    // Admin/Owner can update any booking
    if (req.user.role !== 'owner') {
      // Regular user can only update their own bookings
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
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
      return res.status(404).json({ message: 'Booking not found' });
    }


    if (req.user.role !== 'owner') {
      // Regular user can only delete their own bookings
      if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


