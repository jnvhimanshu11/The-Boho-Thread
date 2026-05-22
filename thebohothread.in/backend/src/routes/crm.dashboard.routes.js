const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const Student      = require('../models/Student.model');
const FeePayment   = require('../models/FeePayment.model');
const Attendance   = require('../models/Attendance.model');

// GET /api/crm/dashboard/stats
router.get('/stats', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const schoolId = req.user.schoolId;
  const today    = new Date().toISOString().split('T')[0];

  const [totalStudents, feesAgg, todayAtt, recentPayments] = await Promise.all([
    Student.countDocuments({ schoolId }),
    FeePayment.aggregate([
      { $match: { schoolId } },
      {
        $group: {
          _id: null,
          feesCollected: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amountPaid', 0] } },
          feesPending:   { $sum: { $cond: [{ $in: ['$status', ['pending', 'partial', 'overdue']] }, { $subtract: ['$totalAmount', '$amountPaid'] }, 0] } },
        },
      },
    ]),
    Attendance.aggregate([
      { $match: { schoolId, date: today } },
      {
        $group: {
          _id: null,
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          total:   { $sum: 1 },
        },
      },
    ]),
    FeePayment.find({ schoolId })
      .populate('studentId', 'name class section')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const attendanceRate = todayAtt[0]
    ? Math.round((todayAtt[0].present / todayAtt[0].total) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      totalStudents,
      feesCollected:  feesAgg[0]?.feesCollected  ?? 0,
      feesPending:    feesAgg[0]?.feesPending    ?? 0,
      todayAttendance: attendanceRate,
      recentPayments: recentPayments.map(p => ({
        ...p.toObject(),
        student: p.studentId,
        studentId: p.studentId?._id,
      })),
    },
  });
});

module.exports = router;
