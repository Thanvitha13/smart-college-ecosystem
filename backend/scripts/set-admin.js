import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { User } from '../models/index.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, '../.env') });
dotenv.config();

try {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env before updating the admin.');
  }

  await connectDB();
  const admin = await User.findOne({ role: 'admin' });
  if (!admin) throw new Error('No admin account exists. Run npm run seed first.');

  admin.email = process.env.ADMIN_EMAIL;
  admin.password = process.env.ADMIN_PASSWORD;
  if (process.env.ADMIN_NAME) admin.name = process.env.ADMIN_NAME;
  await admin.save();

  console.log(`Updated admin credentials for ${admin.email}.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
