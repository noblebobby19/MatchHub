import Field from '../models/Field.js';

export const getFields = async (req, res) => {
  try {
    const { search, size, type, available } = req.query;

    // Xây dựng query để lấy dữ liệu từ database
    let query = {
      status: 'active' // Only show active fields to public
    };

    // Search by name or location
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by size
    if (size && size !== 'all') {
      query.size = size;
    }

    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }

    // Filter by available
    if (available !== undefined) {
      query.available = available === 'true';
    }

    // Lấy tất cả fields từ database
    const fields = await Field.find(query).populate('ownerId', 'name email');

    // Trả về dữ liệu từ database
    res.json(fields);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyFields = async (req, res) => {
  try {
    console.log('🔍 getMyFields called by user:', req.user.role, req.user.email, req.user._id);
    let query = {};

    // Admin can see all fields
    // Owner (Admin) can see all fields
    if (req.user.role === 'owner') {
      console.log('✅ Owner (Admin) user - fetching ALL fields from database');
      // No query filter - get all fields
      query = {};
    } else {
      // Regular users shouldn't be calling getMyFields typically, but if they do:
      console.log('⚠️ Regular user calling getMyFields - restricted');
      query.ownerId = req.user._id;
    }

    console.log('📋 Query:', JSON.stringify(query));

    const fields = await Field.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${fields.length} fields`);
    if (fields.length > 0) {
      console.log('📝 First field sample:', {
        id: fields[0]._id,
        name: fields[0].name,
        ownerId: fields[0].ownerId
      });
    }

    res.json(fields);
  } catch (error) {
    console.error('❌ Error in getMyFields:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFieldById = async (req, res) => {
  try {
    // Lấy field từ database theo ID
    const field = await Field.findById(req.params.id).populate('ownerId', 'name email phone');

    if (!field) {
      return res.status(404).json({ message: 'Không tìm thấy sân.' });
    }

    // Trả về dữ liệu từ database
    res.json(field);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const DEFAULT_TIME_SLOTS = [
  { time: '06:00 - 08:00', price: '200.000đ' },
  { time: '08:00 - 10:00', price: '300.000đ' },
  { time: '10:00 - 12:00', price: '350.000đ' },
  { time: '12:00 - 14:00', price: '350.000đ' },
  { time: '14:00 - 16:00', price: '350.000đ' },
  { time: '16:00 - 18:00', price: '400.000đ' },
  { time: '18:00 - 20:00', price: '450.000đ' },
  { time: '20:00 - 22:00', price: '450.000đ' },
  { time: '22:00 - 23:00', price: '300.000đ' }
];

/**
 * Parse openTime dạng "H:MM - H:MM" hoặc "HH:MM - HH:MM"
 * Trả về mảng timeSlots tự động chia theo khung 2 tiếng.
 * Slot cuối cùng có thể ít hơn 2 tiếng nếu tổng thời gian không chia đều.
 * @param {string} openTime - ví dụ: "15:00 - 22:00" hoặc "5:00 - 23:00"
 * @param {string} defaultPrice - giá base để format, ví dụ: "150000"
 * @returns {Array<{time: string, price: string, available: boolean}>}
 */
const generateTimeSlotsFromOpenTime = (openTime, defaultPrice) => {
  try {
    // Parse openTime: hỗ trợ cả "5:00 - 23:00" và "05:00 - 23:00"
    const match = openTime.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return DEFAULT_TIME_SLOTS;

    const startHour = parseInt(match[1], 10);
    const startMin = parseInt(match[2], 10);
    const endHour = parseInt(match[3], 10);
    const endMin = parseInt(match[4], 10);

    const startTotal = startHour * 60 + startMin; // tổng phút từ 00:00
    const endTotal = endHour * 60 + endMin;

    if (endTotal <= startTotal) return DEFAULT_TIME_SLOTS;

    // Format giá: nếu là số thuần → format VNĐ, nếu đã có "đ" giữ nguyên
    let formattedPrice = defaultPrice || '200.000đ';
    const numericPrice = parseInt(String(defaultPrice).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      formattedPrice = numericPrice.toLocaleString('vi-VN') + 'đ';
    }

    const slots = [];
    const SLOT_DURATION = 120; // 2 tiếng = 120 phút
    let cursor = startTotal;

    while (cursor < endTotal) {
      const slotEnd = Math.min(cursor + SLOT_DURATION, endTotal);

      const fromH = String(Math.floor(cursor / 60)).padStart(2, '0');
      const fromM = String(cursor % 60).padStart(2, '0');
      const toH = String(Math.floor(slotEnd / 60)).padStart(2, '0');
      const toM = String(slotEnd % 60).padStart(2, '0');

      slots.push({
        time: `${fromH}:${fromM} - ${toH}:${toM}`,
        price: formattedPrice,
        available: true
      });

      cursor = slotEnd;
    }

    return slots.length > 0 ? slots : DEFAULT_TIME_SLOTS;
  } catch (e) {
    console.error('generateTimeSlotsFromOpenTime error:', e);
    return DEFAULT_TIME_SLOTS;
  }
};

export const createField = async (req, res) => {
  try {
    const fieldData = { ...req.body };

    // Nếu không có timeSlots hoặc timeSlots rỗng:
    // Ưu tiên tạo tự động từ openTime nếu có, ngược lại dùng DEFAULT_TIME_SLOTS
    // Nếu Frontend đã gửi timeSlots (tùy chỉnh giá), ta giữ nguyên!
    if (!fieldData.timeSlots || fieldData.timeSlots.length === 0) {
      if (fieldData.openTime) {
        fieldData.timeSlots = generateTimeSlotsFromOpenTime(fieldData.openTime, fieldData.price);
      } else {
        fieldData.timeSlots = DEFAULT_TIME_SLOTS;
      }
    }

    // Tạo field mới và lưu vào database
    const field = await Field.create({
      ...fieldData,
      ownerId: req.user._id
    });

    // Trả về field đã được lưu vào database
    res.status(201).json(field);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateField = async (req, res) => {
  try {
    // Lấy field từ database
    const field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({ message: 'Không tìm thấy sân.' });
    }

    // Check if user is owner or admin
    // Check if user is owner (admin) - Allow all owners to edit any field
    if (req.user.role !== 'owner') {
      if (field.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa sân này.' });
      }
    }

    const updateData = { ...req.body };

    // KIỂM TRA MẢNG timeSlots TỪ FRONTEND
    // Frontend hiện đã gửi kèm timeSlots có giá tùy chỉnh.
    // Nếu mảng timeSlots từ frontend RỖNG, hoặc không gửi lên, ta mới generate lại.
    // Nếu frontend gửi lên mảng timeSlots có dữ liệu, ta DÙNG LUÔN mảng đó (để giữ giá tùy chỉnh).
    if (!updateData.timeSlots || updateData.timeSlots.length === 0) {
      const openTimeToUse = updateData.openTime || field.openTime;
      if (openTimeToUse) {
        const priceToUse = updateData.price || field.price;
        updateData.timeSlots = generateTimeSlotsFromOpenTime(openTimeToUse, priceToUse);
        console.log(`🕐 Regenerated ${updateData.timeSlots.length} time slots from openTime: "${openTimeToUse}"`);
      }
    } else {
      console.log(`🕐 Preserved ${updateData.timeSlots.length} custom time slots provided by frontend`);
    }

    // Cập nhật field trong database
    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Trả về field đã được cập nhật từ database
    res.json(updatedField);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);

    if (!field) {
      return res.status(404).json({ message: 'Không tìm thấy sân.' });
    }

    // Check if user is owner or admin
    // Check if user is owner (admin)
    if (req.user.role !== 'owner') {
      if (field.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa sân này.' });
      }
    }

    await Field.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa sân thành công.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


