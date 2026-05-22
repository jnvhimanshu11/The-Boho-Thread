const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const FeeStructure = require('../models/FeeStructure.model');

// GET /api/crm/fee-structures
router.get('/', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const structures = await FeeStructure.find({ schoolId: req.user.schoolId });
  res.json({ success: true, data: structures });
});

// POST /api/crm/fee-structures
router.post('/', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const { class: cls, academicYear, tuitionFee, admissionFee, examFee, otherFees, dueDate } = req.body;

  const otherTotal = (otherFees || []).reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalAmount = (tuitionFee || 0) + (admissionFee || 0) + (examFee || 0) + otherTotal;

  const structure = await FeeStructure.create({
    schoolId: req.user.schoolId,
    class: cls,
    academicYear,
    tuitionFee,
    admissionFee,
    examFee,
    otherFees: otherFees || [],
    totalAmount,
    dueDate,
  });

  res.status(201).json({ success: true, data: structure, message: 'Fee structure created' });
});

// PUT /api/crm/fee-structures/:id
router.put('/:id', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const { tuitionFee, admissionFee, examFee, otherFees, dueDate } = req.body;

  const otherTotal = (otherFees || []).reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalAmount = (tuitionFee || 0) + (admissionFee || 0) + (examFee || 0) + otherTotal;

  const structure = await FeeStructure.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user.schoolId },
    { ...req.body, totalAmount },
    { new: true, runValidators: true }
  );

  if (!structure) return res.status(404).json({ success: false, message: 'Fee structure not found' });
  res.json({ success: true, data: structure, message: 'Fee structure updated' });
});

// DELETE /api/crm/fee-structures/:id
router.delete('/:id', protect, authorize('school_admin', 'admin'), async (req, res) => {
  const structure = await FeeStructure.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
  if (!structure) return res.status(404).json({ success: false, message: 'Fee structure not found' });
  res.json({ success: true, message: 'Fee structure deleted' });
});

module.exports = router;
