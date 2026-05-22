const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    class: {
      type: String,
      required: true,
      enum: ['1','2','3','4','5','6', '7', '8', '9', '10', '11', '12'],
    },
    section: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    },
    parentName: { type: String, required: true, trim: true },
    parentPhone: { type: String, required: true },
    parentEmail: String,
    address: String,
    dob: { type: String, required: true },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    photo: String,
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bloodGroup: String,
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS'],
      default: 'General',
    },
    isActive: { type: Boolean, default: true },
    academicYear: {
      type: String,
      default: () => {
        const now = new Date();
        const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        return `${year}-${year + 1}`;
      },
    },
  },
  { timestamps: true }
);

// Compound index: roll number unique within school + class + section
studentSchema.index({ schoolId: 1, class: 1, section: 1, rollNumber: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, name: 'text' });
studentSchema.index({ parentPhone: 1 });

module.exports = mongoose.model('Student', studentSchema);
