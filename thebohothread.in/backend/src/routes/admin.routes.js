const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Note = require('../models/Note.model');

// GET /admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (role)   filter.role = role;
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [data, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: { data, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
});

// PATCH /admin/users/:id/toggle-active
router.patch('/users/:id/toggle-active', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, data: user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
});

// GET /admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  const [totalUsers, totalNotes, studentCount, adminCount] = await Promise.all([
    User.countDocuments(),
    Note.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'admin' }),
  ]);
  res.json({ success: true, data: { totalUsers, totalNotes, studentCount, adminCount } });
});

module.exports = router;
