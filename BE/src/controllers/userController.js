import User from '../models/User.js';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        // Build query
        const query = {};

        // Search by name or email
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role && role !== 'all') {
            query.role = role;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const users = await User.find(query)
            .select('-password') // Don't return passwords
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Count total documents
        const total = await User.countDocuments(query);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
    }
};
