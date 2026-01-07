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

export const getBookings = async (req, res) => {
  try {
    console.log('🔍 getBookings called by user:', req.user.role, req.user.email);
    // Lấy dữ liệu từ database
    let query = {};

    // Admin can see all bookings
    if (req.user.role === 'admin') {
      console.log('✅ Admin user - fetching all bookings');
      // No query filter - get all bookings
    } else if (req.user.role === 'owner') {
      console.log('✅ Owner user - fetching bookings for owner fields');
      // If user is owner, get all bookings for their fields
      const fields = await Field.find({ ownerId: req.user._id });
      const fieldIds = fields.map(f => f._id);
      query.fieldId = { $in: fieldIds };
      console.log(`✅ Found ${fields.length} fields, ${fieldIds.length} fieldIds`);
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
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      if (booking.userId._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'owner') {
      // Owner can only see bookings for their fields
      const field = await Field.findById(booking.fieldId);
      if (field && field.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Trả về dữ liệu từ database
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Lấy booking từ database
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Lấy field từ database để kiểm tra quyền
    // Admin can update any booking
    if (req.user.role !== 'admin') {
      const field = await Field.findById(booking.fieldId);
      if (req.user.role === 'owner') {
        // Owner can only update bookings for their fields
        if (field && field.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else {
        // Regular user can only update their own bookings
        if (booking.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
    }

    // Cập nhật status và lưu vào database
    booking.status = status;
    await booking.save();

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

    // Check access - admin can delete any booking
    if (req.user.role !== 'admin') {
      if (req.user.role === 'owner') {
        // Owner can delete bookings for their fields
        const field = await Field.findById(booking.fieldId);
        if (field && field.ownerId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } else {
        // Regular user can only delete their own bookings
        if (booking.userId.toString() !== req.user._id.toString()) {
          return res.status(403).json({ message: 'Access denied' });
        }
      }
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


