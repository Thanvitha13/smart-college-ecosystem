import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { Application, Notification, Opportunity, Report, SavedOpportunity, User } from '../models/index.js';
import { adminOnly, protect, studentOnly } from '../middleware/auth.js';

const router = Router();
const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads');
const categories = ['Internship', 'Hackathon', 'Scholarship', 'Technical Event', 'Workshop', 'Coding Competition', 'Online Course', 'Research'];
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => done(null, uploadDir),
    filename: (req, file, done) => done(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, done) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (['.pdf', '.doc', '.docx'].includes(extension) && ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) return done(null, true);
    done(Object.assign(new Error('Upload a PDF, DOC, or DOCX resume (5 MB maximum).'), { status: 400 }));
  },
});
const profileImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => done(null, uploadDir),
    filename: (req, file, done) => done(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, done) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(extension) && ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return done(null, true);
    done(Object.assign(new Error('Upload a JPG, PNG, or WEBP profile image (2 MB maximum).'), { status: 400 }));
  },
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  next();
};
const makeToken = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, college: user.college, department: user.department, year: user.year, skills: user.skills, interests: user.interests, role: user.role, profileImage: user.profileImage, resume: user.resume });
const splitList = (value) => Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
const opportunityInput = (body) => ({
  title: String(body.title || '').trim(), organization: String(body.organization || '').trim(), category: body.category,
  description: String(body.description || '').trim(), location: String(body.location || 'Remote').trim(),
  eligibility: String(body.eligibility || '').trim(), requiredSkills: splitList(body.requiredSkills),
  deadline: body.deadline, applicationLink: String(body.applicationLink || '').trim(), image: String(body.image || '').trim(),
  benefits: splitList(body.benefits), applicationProcedure: String(body.applicationProcedure || '').trim(),
});
const validateOpportunity = (data) => {
  if (!data.title || !data.organization || !categories.includes(data.category) || !data.description || !data.deadline || !data.applicationLink) return 'Complete all required opportunity fields.';
  if (Number.isNaN(Date.parse(data.deadline))) return 'Enter a valid application deadline.';
  try {
    const url = new URL(data.applicationLink);
    if (!['http:', 'https:'].includes(url.protocol)) return 'Application links must use HTTP or HTTPS.';
  } catch { return 'Enter a valid application URL.'; }
  return null;
};
const getMatch = (user, opportunity) => {
  const profileTerms = [...(user.skills || []), ...(user.interests || [])].map((term) => term.toLowerCase());
  const wanted = [...(opportunity.requiredSkills || []), opportunity.category].map((term) => term.toLowerCase());
  if (!profileTerms.length) return 0;
  const hits = wanted.filter((term) => profileTerms.some((profileTerm) => profileTerm.includes(term) || term.includes(profileTerm)));
  return Math.min(100, Math.round((hits.length / Math.max(wanted.length, 1)) * 100));
};
const opportunityWithMatch = (user, opportunity) => ({ ...opportunity.toObject(), matchPercentage: getMatch(user, opportunity) });

router.post('/auth/register', [
  body('name').trim().notEmpty().withMessage('Enter your full name.'),
  body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
], validate, async (req, res, next) => {
  try {
    const user = await User.create({
      name: req.body.name, email: req.body.email, password: req.body.password,
      college: req.body.college || '', department: req.body.department || '', year: req.body.year || '',
      skills: splitList(req.body.skills), interests: splitList(req.body.interests),
    });
    res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
});

router.post('/auth/login', [body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail(), body('password').notEmpty().withMessage('Enter your password.')], validate, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
});
router.post('/auth/forgot-password', [body('email').isEmail().withMessage('Enter a valid email address.').normalizeEmail()], validate, async (req, res, next) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.MAIL_FROM) {
      return res.status(503).json({ message: 'Password recovery email is not configured. Ask your administrator to configure SMTP.' });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: 'If that account exists, a reset link is on its way.' });
    const resetToken = randomBytes(32).toString('hex');
    user.passwordResetTokenHash = createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const resetUrl = `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/reset-password/${resetToken}`;
    try {
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: 'Reset your OpportunityHub password',
        text: `Use this link within 30 minutes to reset your password: ${resetUrl}`,
        html: `<p>Use this link within 30 minutes to reset your OpportunityHub password:</p><p><a href="${resetUrl}">Reset password</a></p>`,
      });
    } catch (error) {
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      throw error;
    }
    res.json({ message: 'If that account exists, a reset link is on its way.' });
  } catch (error) { next(error); }
});
router.post('/auth/reset-password/:token', [body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.')], validate, async (req, res, next) => {
  try {
    const tokenHash = createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetExpires: { $gt: new Date() } }).select('+passwordResetTokenHash +passwordResetExpires');
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired.' });
    user.password = req.body.password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset. You can now sign in.' });
  } catch (error) { next(error); }
});
router.get('/auth/me', protect, (req, res) => res.json({ user: safeUser(req.user) }));

router.get('/opportunities/stats', async (req, res, next) => {
  try {
    const now = new Date();
    const [total, internships, events, students] = await Promise.all([
      Opportunity.countDocuments({ deadline: { $gte: now } }),
      Opportunity.countDocuments({ category: 'Internship', deadline: { $gte: now } }),
      Opportunity.countDocuments({ category: { $in: ['Hackathon', 'Technical Event', 'Workshop', 'Coding Competition'] }, deadline: { $gte: now } }),
      User.countDocuments({ role: 'student' }),
    ]);
    res.json({ total, internships, events, students });
  } catch (error) { next(error); }
});

router.get('/opportunities/recommended', protect, studentOnly, async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({ deadline: { $gte: new Date() } }).sort({ deadline: 1 }).limit(80);
    res.json(opportunities.map((item) => opportunityWithMatch(req.user, item)).sort((a, b) => b.matchPercentage - a.matchPercentage || new Date(a.deadline) - new Date(b.deadline)).slice(0, 12));
  } catch (error) { next(error); }
});
router.get('/opportunities', async (req, res, next) => {
  try {
    const filter = req.query.includeExpired === 'true' ? {} : { deadline: { $gte: new Date() } };
    if (categories.includes(req.query.category)) filter.category = req.query.category;
    if (req.query.location) filter.location = { $regex: String(req.query.location).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (req.query.skill) filter.requiredSkills = { $regex: String(req.query.skill).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (req.query.eligibility) filter.eligibility = { $regex: String(req.query.eligibility).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (req.query.search) {
      const escaped = String(req.query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['title', 'organization', 'description'].map((field) => ({ [field]: { $regex: escaped, $options: 'i' } }));
    }
    const sort = req.query.sort === 'deadline' ? { deadline: 1 } : { createdAt: -1 };
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 24));
    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter).sort(sort).skip((page - 1) * limit).limit(limit), Opportunity.countDocuments(filter),
    ]);
    res.json({ opportunities, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});
router.get('/opportunities/:id', async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    res.json(opportunity);
  } catch (error) { next(error); }
});
router.post('/opportunities', protect, adminOnly, async (req, res, next) => {
  try {
    const data = opportunityInput(req.body);
    const issue = validateOpportunity(data);
    if (issue) return res.status(400).json({ message: issue });
    const opportunity = await Opportunity.create({ ...data, createdBy: req.user.id });
    const students = await User.find({ role: 'student' }).select('_id').lean();
    if (students.length) await Notification.insertMany(students.map(({ _id }) => ({ userId: _id, title: 'A new opportunity just landed', message: `${opportunity.title} from ${opportunity.organization} is now open.`, type: 'opportunity', relatedOpportunity: opportunity.id, dedupeKey: `${_id}:new:${opportunity.id}` })), { ordered: false });
    res.status(201).json(opportunity);
  } catch (error) { next(error); }
});
router.put('/opportunities/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const data = opportunityInput(req.body);
    const issue = validateOpportunity(data);
    if (issue) return res.status(400).json({ message: issue });
    const opportunity = await Opportunity.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    res.json(opportunity);
  } catch (error) { next(error); }
});
router.delete('/opportunities/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findByIdAndDelete(req.params.id);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    await Promise.all([SavedOpportunity.deleteMany({ opportunityId: opportunity.id }), Application.deleteMany({ opportunityId: opportunity.id })]);
    res.json({ message: 'Opportunity and related student records removed.' });
  } catch (error) { next(error); }
});

router.get('/students/profile', protect, studentOnly, (req, res) => res.json({ user: safeUser(req.user) }));
router.put('/students/profile', protect, studentOnly, async (req, res, next) => {
  try {
    const fields = ['name', 'college', 'department', 'year'];
    for (const field of fields) if (req.body[field] !== undefined) req.user[field] = String(req.body[field]).trim();
    if (req.body.skills !== undefined) req.user.skills = splitList(req.body.skills);
    if (req.body.interests !== undefined) req.user.interests = splitList(req.body.interests);
    const user = await req.user.save();
    res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
});
router.put('/students/password', protect, studentOnly, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(req.body.currentPassword || ''))) return res.status(400).json({ message: 'Current password is incorrect.' });
    if (typeof req.body.newPassword !== 'string' || req.body.newPassword.length < 8) return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password updated.' });
  } catch (error) { next(error); }
});
router.post('/students/resume', protect, studentOnly, upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose a resume file first.' });
    req.user.resume = `/uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ resume: req.user.resume, user: safeUser(req.user) });
  } catch (error) { next(error); }
});
router.post('/students/profile-image', protect, studentOnly, profileImageUpload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Choose a profile image first.' });
    req.user.profileImage = `/uploads/${req.file.filename}`;
    await req.user.save();
    res.json({ user: safeUser(req.user) });
  } catch (error) { next(error); }
});
router.get('/students/dashboard', protect, studentOnly, async (req, res, next) => {
  try {
    const [savedCount, applicationCount, upcoming] = await Promise.all([
      SavedOpportunity.countDocuments({ studentId: req.user.id }),
      Application.countDocuments({ studentId: req.user.id }),
      Opportunity.find({ deadline: { $gte: new Date(), $lte: new Date(Date.now() + 14 * 86400000) } }).sort({ deadline: 1 }).limit(5),
    ]);
    res.json({ savedCount, applicationCount, upcomingDeadlines: upcoming });
  } catch (error) { next(error); }
});

router.post('/saved/:opportunityId', protect, studentOnly, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    const saved = await SavedOpportunity.findOneAndUpdate(
      { studentId: req.user.id, opportunityId: opportunity.id },
      { $setOnInsert: { studentId: req.user.id, opportunityId: opportunity.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(201).json({ saved: true, item: saved });
  } catch (error) { next(error); }
});
router.get('/saved', protect, studentOnly, async (req, res, next) => {
  try {
    const saved = await SavedOpportunity.find({ studentId: req.user.id }).sort({ savedAt: -1 }).populate('opportunityId');
    res.json(saved.filter((item) => item.opportunityId));
  } catch (error) { next(error); }
});
router.delete('/saved/:opportunityId', protect, studentOnly, async (req, res, next) => {
  try {
    await SavedOpportunity.deleteOne({ studentId: req.user.id, opportunityId: req.params.opportunityId });
    res.json({ saved: false });
  } catch (error) { next(error); }
});

router.post('/applications', protect, studentOnly, async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findOne({ _id: req.body.opportunityId, deadline: { $gte: new Date() } });
    if (!opportunity) return res.status(404).json({ message: 'This opportunity is no longer accepting applications.' });
    const application = await Application.create({ studentId: req.user.id, opportunityId: opportunity.id });
    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You already applied to this opportunity.' });
    next(error);
  }
});
router.get('/applications/my', protect, studentOnly, async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user.id }).sort({ appliedAt: -1 }).populate('opportunityId');
    res.json(applications.filter((application) => application.opportunityId));
  } catch (error) { next(error); }
});
router.patch('/applications/:id/tracking', protect, studentOnly, async (req, res, next) => {
  try {
    const allowed = ['Planning', 'Applied', 'Interviewing', 'Completed', 'Withdrawn'];
    if (!allowed.includes(req.body.personalStatus)) return res.status(400).json({ message: 'Choose a valid personal tracking status.' });
    const application = await Application.findOneAndUpdate({ _id: req.params.id, studentId: req.user.id }, { personalStatus: req.body.personalStatus }, { new: true, runValidators: true }).populate('opportunityId');
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    res.json(application);
  } catch (error) { next(error); }
});
router.patch('/applications/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const allowed = ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid application status.' });
    const application = await Application.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    await Notification.create({ userId: application.studentId, title: 'Application status updated', message: `Your application status is now ${application.status}.`, type: 'application', relatedOpportunity: application.opportunityId });
    res.json(application);
  } catch (error) { next(error); }
});

router.get('/notifications', protect, studentOnly, async (req, res, next) => {
  try {
    const horizon = new Date(Date.now() + 7 * 86400000);
    const [saved, applied] = await Promise.all([
      SavedOpportunity.find({ studentId: req.user.id }).populate({ path: 'opportunityId', match: { deadline: { $gte: new Date(), $lte: horizon } } }),
      Application.find({ studentId: req.user.id }).populate({ path: 'opportunityId', match: { deadline: { $gte: new Date(), $lte: horizon } } }),
    ]);
    const seen = new Set();
    const reminders = [...saved, ...applied].filter((entry) => entry.opportunityId && !seen.has(String(entry.opportunityId.id)) && seen.add(String(entry.opportunityId.id))).map((entry) => {
      const opportunity = entry.opportunityId;
      const daysLeft = Math.max(0, Math.ceil((new Date(opportunity.deadline) - Date.now()) / 86400000));
      const deadlineDay = new Date(opportunity.deadline).toISOString().slice(0, 10);
      return { updateOne: { filter: { dedupeKey: `${req.user.id}:deadline:${opportunity.id}:${deadlineDay}` }, update: { $setOnInsert: { userId: req.user.id, title: 'Deadline approaching', message: `${opportunity.title} closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`, type: 'deadline', relatedOpportunity: opportunity.id, dedupeKey: `${req.user.id}:deadline:${opportunity.id}:${deadlineDay}` } }, upsert: true } };
    });
    if (reminders.length) await Notification.bulkWrite(reminders);
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100).populate('relatedOpportunity', 'title category deadline');
    res.json(notifications);
  } catch (error) { next(error); }
});
router.patch('/notifications/:id/read', protect, studentOnly, async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json(notification);
  } catch (error) { next(error); }
});
router.patch('/notifications/read-all', protect, studentOnly, async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) { next(error); }
});

router.post('/reports/:opportunityId', protect, studentOnly, async (req, res, next) => {
  try {
    const reasons = ['Expired listing', 'Incorrect information', 'Application link issue', 'Other'];
    if (!reasons.includes(req.body.reason)) return res.status(400).json({ message: 'Choose a reason for reporting this listing.' });
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found.' });
    const report = await Report.create({ studentId: req.user.id, opportunityId: opportunity.id, reason: req.body.reason, details: String(req.body.details || '').trim() });
    res.status(201).json(report);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'You have already reported this listing.' });
    next(error);
  }
});

router.get('/admin/dashboard', protect, adminOnly, async (req, res, next) => {
  try {
    const [students, opportunities, applications, pending, recentOpportunities] = await Promise.all([
      User.countDocuments({ role: 'student' }), Opportunity.countDocuments(), Application.countDocuments(),
      Application.countDocuments({ status: 'Applied' }), Opportunity.find().sort({ createdAt: -1 }).limit(6),
    ]);
    res.json({ students, opportunities, applications, pending, recentOpportunities });
  } catch (error) { next(error); }
});
router.get('/admin/students', protect, adminOnly, async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student' }).sort({ createdAt: -1 }).select('name email college department year createdAt');
    res.json(students);
  } catch (error) { next(error); }
});
router.get('/admin/applications', protect, adminOnly, async (req, res, next) => {
  try {
    const applications = await Application.find().sort({ appliedAt: -1 }).limit(250)
      .populate('studentId', 'name email college')
      .populate('opportunityId', 'title organization');
    res.json(applications);
  } catch (error) { next(error); }
});
router.get('/admin/reports', protect, adminOnly, async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).limit(250)
      .populate('studentId', 'name email')
      .populate('opportunityId', 'title organization deadline');
    res.json(reports);
  } catch (error) { next(error); }
});
router.patch('/admin/reports/:id', protect, adminOnly, async (req, res, next) => {
  try {
    if (!['Open', 'Reviewed', 'Resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Choose a valid report status.' });
    const report = await Report.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json(report);
  } catch (error) { next(error); }
});
router.get('/admin/statistics', protect, adminOnly, async (req, res, next) => {
  try {
    const [byCategory, applicationsByStatus] = await Promise.all([
      Opportunity.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);
    res.json({ byCategory, applicationsByStatus });
  } catch (error) { next(error); }
});

export default router;
