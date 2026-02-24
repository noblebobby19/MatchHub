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

export const createField = async (req, res) => {
  try {
    const fieldData = { ...req.body };

    // Nếu không có timeSlots hoặc timeSlots rỗng, sử dụng mặc định
    if (!fieldData.timeSlots || fieldData.timeSlots.length === 0) {
      fieldData.timeSlots = DEFAULT_TIME_SLOTS;
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

    // Cập nhật field trong database
    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      req.body,
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


