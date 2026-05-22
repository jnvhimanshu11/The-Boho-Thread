const Razorpay = require('razorpay');
const crypto  = require('crypto');
const FeePayment   = require('../models/FeePayment.model');
const FeeStructure = require('../models/FeeStructure.model');
const Student      = require('../models/Student.model');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// GET /crm/fee-payments
exports.getAll = async (req, res) => {
  const { studentId, status, month, page = 1, limit = 20 } = req.query;
  const schoolId = req.user.schoolId;
  const filter = { schoolId };

  if (studentId) filter.studentId = studentId;
  if (status)    filter.status = status;
  if (month)     filter.month = month;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [data, total] = await Promise.all([
    FeePayment.find(filter)
      .populate('studentId', 'name rollNumber class section')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    FeePayment.countDocuments(filter),
  ]);

  // Rename populated field
  const mapped = data.map((p) => ({ ...p.toObject(), student: p.studentId, studentId: p.studentId?._id }));

  res.json({
    success: true,
    data: { data: mapped, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  });
};

// POST /crm/fee-payments/create-order  — Razorpay order
exports.createOrder = async (req, res) => {
  const { studentId, amount, feeStructureId } = req.body;

  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: `fee_${Date.now()}`,
    notes: { studentId, feeStructureId, schoolId: String(req.user.schoolId) },
  });

  res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency } });
};

// POST /crm/fee-payments/verify  — verify Razorpay signature
exports.verifyPayment = async (req, res) => {
  const { orderId, paymentId, signature, studentId, feeStructureId } = req.body;

  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSig !== signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  }

  const feeStructure = await FeeStructure.findById(feeStructureId);
  const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  // Upsert payment record
  const payment = await FeePayment.findOneAndUpdate(
    { studentId, feeStructureId, month },
    {
      $set: {
        schoolId: req.user.schoolId,
        status: 'paid',
        paymentMethod: 'online',
        transactionId: paymentId,
        paymentDate: new Date(),
        totalAmount: feeStructure?.totalAmount ?? 0,
        amountPaid: feeStructure?.totalAmount ?? 0,
        academicYear: new Date().getFullYear().toString(),
        month,
      },
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: payment, message: 'Payment recorded successfully' });
};

// POST /crm/fee-payments/cash  — record offline cash payment
exports.recordCash = async (req, res) => {
  const { studentId, feeStructureId, amountPaid, month } = req.body;
  const feeStructure = await FeeStructure.findById(feeStructureId);
  const totalAmount = feeStructure?.totalAmount ?? 0;

  const payment = await FeePayment.create({
    studentId,
    schoolId: req.user.schoolId,
    feeStructureId,
    amountPaid,
    totalAmount,
    status: amountPaid >= totalAmount ? 'paid' : 'partial',
    paymentMethod: 'cash',
    paymentDate: new Date(),
    month: month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
    academicYear: new Date().getFullYear().toString(),
  });

  res.status(201).json({ success: true, data: payment, message: 'Cash payment recorded' });
};

// GET /crm/fee-payments/summary
exports.getSummary = async (req, res) => {
  const schoolId = req.user.schoolId;

  const [collected, pending, overdue, monthly] = await Promise.all([
    FeePayment.aggregate([
      { $match: { schoolId, status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]),
    FeePayment.aggregate([
      { $match: { schoolId, status: { $in: ['pending', 'partial'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
    ]),
    FeePayment.aggregate([
      { $match: { schoolId, status: 'overdue' } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
    ]),
    FeePayment.aggregate([
      { $match: { schoolId } },
      { $group: { _id: '$month', collected: { $sum: '$amountPaid' }, pending: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalCollected: collected[0]?.total ?? 0,
      totalPending:   pending[0]?.total   ?? 0,
      totalOverdue:   overdue[0]?.total   ?? 0,
      monthlyData:    monthly,
    },
  });
};
