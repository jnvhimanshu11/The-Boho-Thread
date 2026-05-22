const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    feeStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'FeeStructure', required: true },
    amountPaid: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['paid', 'partial', 'pending', 'overdue'], default: 'pending' },
    paymentDate: Date,
    paymentMethod: { type: String, enum: ['online', 'cash', 'cheque'], default: 'online' },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    month: { type: String, required: true }, // e.g. "2024-06"
    academicYear: { type: String, required: true },
    remarks: String,
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feePaymentSchema.index({ schoolId: 1, status: 1 });
feePaymentSchema.index({ studentId: 1, month: 1 });
feePaymentSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
