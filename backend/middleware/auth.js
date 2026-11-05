import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Your account is no longer available.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
  }
}

export function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Administrator access is required.' });
  next();
}

export function studentOnly(req, res, next) {
  if (req.user?.role !== 'student') return res.status(403).json({ message: 'Student access is required.' });
  next();
}
