import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/matchhub';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@matchhub.vn' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@matchhub.vn',
      password: 'admin123', // Will be hashed by pre-save hook
      role: 'admin',
      phone: '0123456789'
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@matchhub.vn');
    console.log('🔑 Password: admin123');
    console.log('⚠️ Please change the password after first login!');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

