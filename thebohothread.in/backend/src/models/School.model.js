const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    logo: String,
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subscriptionPlan: { type: String, enum: ['basic', 'pro', 'enterprise'], default: 'basic' },
    subscriptionExpiry: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    isActive: { type: Boolean, default: true },
    settings: {
      academicYear: { type: String, default: '2024-2025' },
      feeReminderDays: { type: Number, default: 5 },
      workingDays: { type: [String], default: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
    },
    totalStudents: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
