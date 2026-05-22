const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Inline controller for attendance
const Attendance = require('../models/Attendance.model');

// GET /crm/attendance?date=&class=
router.get('/', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const { date, class: cls } = req.query;
  const filter = { schoolId: req.user.schoolId };
  if (date) filter.date = new Date(date);
  if (cls)  filter.class = cls;

  const records = await Attendance.find(filter).populate('studentId', 'name rollNumber section');
  res.json({ success: true, data: records });
});

// POST /crm/attendance/bulk
router.post('/bulk', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const { records } = req.body;
  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Records array required' });
  }

  const ops = records.map((r) => ({
    updateOne: {
      filter: { studentId: r.studentId, date: new Date(r.date) },
      update: { $set: { ...r, schoolId: req.user.schoolId } },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);
  res.json({ success: true, data: { marked: records.length } });
});

// GET /crm/attendance/student/:studentId?month=
router.get('/student/:studentId', protect, authorize('school_admin', 'admin', 'student'), async (req, res) => {
  const { month } = req.query;
  const filter = { studentId: req.params.studentId, schoolId: req.user.schoolId };

  if (month) {
    const [year, m] = month.split('-');
    const start = new Date(year, m - 1, 1);
    const end   = new Date(year, m, 0);
    filter.date = { $gte: start, $lte: end };
  }

  const records = await Attendance.find(filter).sort({ date: 1 });
  const present = records.filter(r => r.status === 'present').length;
  const absent  = records.filter(r => r.status === 'absent').length;
  const late    = records.filter(r => r.status === 'late').length;

  res.json({ success: true, data: { present, absent, late, records } });
});

module.exports = router;
