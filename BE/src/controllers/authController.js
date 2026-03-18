import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, address } = req.body;

    // --- BE Validation ---
    // 1. HỌ VÀ TÊN
    if (!name) return res.status(400).json({ message: 'Họ và tên không được để trống' });
    if (name.startsWith(' ') || name.endsWith(' ')) return res.status(400).json({ message: 'Họ và tên không được có khoảng trắng ở đầu hoặc cuối' });
    if (name.length < 5) return res.status(400).json({ message: 'Họ và tên phải có ít nhất 5 ký tự' });
    if (name.length > 100) return res.status(400).json({ message: 'Họ và tên không được vượt quá 100 ký tự' });
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(name)) return res.status(400).json({ message: 'Họ và tên không được chứa số hoặc ký tự đặc biệt' });
    if (/\s{2,}/.test(name)) return res.status(400).json({ message: 'Họ và tên không được có khoảng trắng liên tiếp' });

    // 2. EMAIL
    if (!email) return res.status(400).json({ message: 'Email không được để trống' });
    if (email.length > 254) return res.status(400).json({ message: 'Email không được vượt quá 254 ký tự' });
    if (email.includes(' ')) return res.status(400).json({ message: 'Email không được chứa khoảng trắng' });
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return res.status(400).json({ message: 'Email không đúng định dạng (ví dụ: ten@email.com)' });
    const [localPart, domainPart] = emailParts;
    if (!localPart || !domainPart) return res.status(400).json({ message: 'Email không đúng định dạng (ví dụ: ten@email.com)' });
    if (localPart.startsWith('.') || localPart.endsWith('.')) return res.status(400).json({ message: 'Phần tên email không được bắt đầu hoặc kết thúc bằng dấu chấm' });
    if (localPart.includes('..')) return res.status(400).json({ message: 'Phần tên email không được có dấu chấm liên tiếp' });
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return res.status(400).json({ message: 'Tên miền không được bắt đầu hoặc kết thúc bằng dấu chấm' });
    if (domainPart.includes('..')) return res.status(400).json({ message: 'Tên miền không được có dấu chấm liên tiếp' });
    if (!/^[a-zA-Z0-9.-]+$/.test(domainPart) || /[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]/.test(localPart)) return res.status(400).json({ message: 'Email chứa ký tự không hợp lệ' });
    if (!domainPart.includes('.')) return res.status(400).json({ message: 'Email không đúng định dạng (ví dụ: ten@email.com)' });

    // 3. ĐỊA CHỈ
    if (!address) return res.status(400).json({ message: 'Địa chỉ không được để trống' });
    if (address.trim().length < 10) return res.status(400).json({ message: 'Địa chỉ phải có ít nhất 10 ký tự' });
    if (address.length > 200) return res.status(400).json({ message: 'Địa chỉ không được vượt quá 200 ký tự' });
    if (/\s{2,}/.test(address)) return res.status(400).json({ message: 'Địa chỉ có quá nhiều khoảng trắng liên tiếp' });
    if (/[!@#$%^&*_=+|<>?]/.test(address)) return res.status(400).json({ message: 'Địa chỉ chứa ký tự không hợp lệ' });

    // 4. MẬT KHẨU
    if (!password) return res.status(400).json({ message: 'Mật khẩu không được để trống' });
    if (password.includes(' ')) return res.status(400).json({ message: 'Mật khẩu không được chứa khoảng trắng' });
    if (password.length < 8) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự' });
    if (password.length > 128) return res.status(400).json({ message: 'Mật khẩu không được vượt quá 128 ký tự' });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 1 chữ cái in hoa' });
    if (!/[a-z]/.test(password)) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 1 chữ cái thường' });
    if (!/[0-9]/.test(password)) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 1 chữ số' });
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)' });


    // Kiểm tra user đã tồn tại trong database chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Tạo user mới và lưu vào database
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      address: address || ''
    });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '1h' }
    );

    // Trả về thông tin user đã được lưu vào database
    res.status(201).json({
      message: 'Đăng ký tài khoản thành công.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    console.log('Login attempt:', { email, role });

    // --- BE Validation ---
    if (!email) return res.status(400).json({ message: 'Email không được để trống' });
    if (email.length > 254) return res.status(400).json({ message: 'Email không được vượt quá 254 ký tự' });
    if (email.includes(' ')) return res.status(400).json({ message: 'Email không được chứa khoảng trắng' });
    const emailParts = email.split('@');
    if (emailParts.length !== 2) return res.status(400).json({ message: 'Email không đúng định dạng (ví dụ: ten@email.com)' });
    const [localPart, domainPart] = emailParts;
    if (!localPart || !domainPart) return res.status(400).json({ message: 'Email không đúng định dạng (ví dụ: ten@email.com)' });
    if (localPart.startsWith('.') || localPart.endsWith('.')) return res.status(400).json({ message: 'Phần tên email không được bắt đầu hoặc kết thúc bằng dấu chấm' });
    if (localPart.includes('..')) return res.status(400).json({ message: 'Phần tên email không được có dấu chấm liên tiếp' });
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) return res.status(400).json({ message: 'Tên miền không được bắt đầu hoặc kết thúc bằng dấu chấm' });
    if (domainPart.includes('..')) return res.status(400).json({ message: 'Tên miền không được có dấu chấm liên tiếp' });
    if (!/^[a-zA-Z0-9.-]+$/.test(domainPart) || /[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]/.test(localPart)) return res.status(400).json({ message: 'Email chứa ký tự không hợp lệ' });
    if (!domainPart.includes('.')) return res.status(400).json({ message: 'Email không đúng định dạng (ví dụ: ten@email.com)' });

    if (!password) return res.status(400).json({ message: 'Mật khẩu không được để trống' });

    // Tìm user trong database
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    console.log('User found:', user.email);

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    console.log('Password valid for user:', email);

    // Check role if provided
    if (role && user.role !== role) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập với vai trò này.' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '1h' }
    );

    // Trả về thông tin user từ database
    res.json({
      message: 'Đăng nhập thành công.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    // Lấy thông tin user từ database
    const user = await User.findById(req.user._id).select('-password');

    // Trả về dữ liệu từ database
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    // Cập nhật thông tin user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleCallback = async (req, res) => {
  try {
    // Generate token
    const token = jwt.sign(
      { userId: req.user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '1h' }
    );

    // Sanitize CLIENT_URL
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Redirect to frontend with token
    res.redirect(`${clientUrl}/auth/google/callback?token=${token}`);
  } catch (error) {
    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');
    res.redirect(`${clientUrl}/dang-nhap?error=Google auth failed`);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Email này chưa được đăng ký tài khoản.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before saving
    user.resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Xin chào,</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản MatchHub.</p>
        <p>Mã OTP của bạn là:</p>
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #16a34a; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>Mã có hiệu lực trong 5 phút.</p>
        <p style="color: #ef4444;">Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">— MatchHub Team</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Mã OTP đặt lại mật khẩu MatchHub',
        message
      });

      res.status(200).json({ message: 'Mã OTP đã được gửi đến email.' });
    } catch (error) {
      console.error('EMAIL SEND ERROR:', error);
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại sau.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Hash provided OTP to compare
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    res.status(200).json({ message: 'OTP hợp lệ.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Mã OTP không đúng hoặc đã hết hạn.' });
    }

    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


