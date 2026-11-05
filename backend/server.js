import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir } from 'node:fs/promises';
import { connectDB } from './config/db.js';
import apiRouter from './routes/api.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(currentDir, '.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const uploadsDir = path.join(currentDir, 'uploads');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required. Set it in backend/.env before starting the API.');

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadsDir, { maxAge: '1d' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use('/api', apiRouter);
app.use((req, res) => res.status(404).json({ message: 'That API route does not exist.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: 'That record already exists.' });
  if (error.name === 'MulterError') return res.status(400).json({ message: error.message });
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'An unexpected server error occurred.' });
});

await mkdir(uploadsDir, { recursive: true });
await connectDB();
app.listen(port, () => console.log(`OpportunityHub API listening on http://localhost:${port}`));
