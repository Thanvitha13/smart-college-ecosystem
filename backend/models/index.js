import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  college: { type: String, trim: true, maxlength: 160, default: '' },
  department: { type: String, trim: true, maxlength: 120, default: '' },
  year: { type: String, trim: true, default: '' },
  skills: { type: [String], default: [] },
  interests: { type: [String], default: [] },
  role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
  profileImage: { type: String, default: '' },
  resume: { type: String, default: '' },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const opportunitySchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  organization: { type: String, required: true, trim: true, maxlength: 160 },
  category: { type: String, required: true, enum: ['Internship', 'Hackathon', 'Scholarship', 'Technical Event', 'Workshop', 'Coding Competition', 'Online Course', 'Research'] },
  description: { type: String, required: true, maxlength: 12000 },
  location: { type: String, trim: true, default: 'Remote' },
  eligibility: { type: String, trim: true, default: 'Open to enrolled students' },
  requiredSkills: { type: [String], default: [] },
  deadline: { type: Date, required: true, index: true },
  applicationLink: { type: String, required: true, trim: true },
  image: { type: String, default: '' },
  benefits: { type: [String], default: [] },
  applicationProcedure: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
opportunitySchema.index({ title: 'text', organization: 'text', description: 'text' });
opportunitySchema.index({ category: 1, deadline: 1, createdAt: -1 });

const applicationSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Applied', 'Under Review', 'Shortlisted', 'Selected', 'Rejected'], default: 'Applied' },
  personalStatus: { type: String, enum: ['Planning', 'Applied', 'Interviewing', 'Completed', 'Withdrawn'], default: 'Applied' },
}, { timestamps: true });
applicationSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

const savedOpportunitySchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: true });
savedOpportunitySchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['opportunity', 'deadline', 'application', 'system'], default: 'system' },
  relatedOpportunity: { type: Schema.Types.ObjectId, ref: 'Opportunity' },
  isRead: { type: Boolean, default: false },
  dedupeKey: { type: String, unique: true, sparse: true },
}, { timestamps: true });
notificationSchema.index({ userId: 1, createdAt: -1 });

const reportSchema = new Schema({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  opportunityId: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true, index: true },
  reason: { type: String, enum: ['Expired listing', 'Incorrect information', 'Application link issue', 'Other'], required: true },
  details: { type: String, trim: true, maxlength: 1200, default: '' },
  status: { type: String, enum: ['Open', 'Reviewed', 'Resolved'], default: 'Open', index: true },
}, { timestamps: true });
reportSchema.index({ studentId: 1, opportunityId: 1 }, { unique: true });

export const User = model('User', userSchema);
export const Opportunity = model('Opportunity', opportunitySchema);
export const Application = model('Application', applicationSchema);
export const SavedOpportunity = model('SavedOpportunity', savedOpportunitySchema);
export const Notification = model('Notification', notificationSchema);
export const Report = model('Report', reportSchema);
