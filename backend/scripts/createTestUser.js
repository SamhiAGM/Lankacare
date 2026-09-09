/**
 * Dev-only script to create a test user for OTP password-reset testing.
 * Run: node --require dotenv/config scripts/createTestUser.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  password: String,
  role: { type: String, default: 'CITIZEN' },
  phone: String,
  isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function run() {
  await mongoose.connect(uri);

  const User = mongoose.model('User', UserSchema);

  const email = 'jdmaster1948@gmail.com';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`\n✅ User already exists: ${email}\n`);
    await mongoose.disconnect();
    return;
  }

  const hashedPw = await bcrypt.hash('Lankacare@2026', 12);
  const user = await User.create({
    name: 'Test User',
    email,
    password: hashedPw,
    role: 'CITIZEN',
    phone: '+94771234567',
    isVerified: true,
    isActive: true,
  });

  console.log(`\n✅ Test user created successfully!`);
  console.log(`   Email    : ${user.email}`);
  console.log(`   Password : Lankacare@2026`);
  console.log(`\n   You can now use forgot-password with this email.\n`);

  await mongoose.disconnect();
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
