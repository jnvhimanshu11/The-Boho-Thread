const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    date: {
      type: String,    // stored as YYYY-MM-DD string for easy filtering
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true,
    },
    class: String,
    section: String,
    subject: String,
    remark: String,
  },
  { timestamps: true }
);

// Compound index: one record per student per day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ schoolId: 1, date: 1 });
attendanceSchema.index({ schoolId: 1, studentId: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
