/**
 * One-time script to create an admin user.
 * Usage: node scripts/createAdmin.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const ADMIN = {
  name: 'Admin',
  email: 'admin@maidmatch.com',
  password: 'Admin@1234',
  phone: '9000000000',
  role: 'admin',
};

await mongoose.connect(process.env.MONGO_URI);

const exists = await User.findOne({ email: ADMIN.email });
if (exists) {
  console.log('Admin already exists:', ADMIN.email);
} else {
  await User.create(ADMIN);
  console.log('✅ Admin created!');
  console.log('   Email   :', ADMIN.email);
  console.log('   Password:', ADMIN.password);
}

await mongoose.disconnect();
