const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    class: { type: String, required: true },
    academicYear: { type: String, required: true },
    tuitionFee: { type: Number, required: true, default: 0 },
    admissionFee: { type: Number, default: 0 },
    examFee: { type: Number, default: 0 },
    otherFees: [{ name: String, amount: Number }],
    totalAmount: { type: Number, required: true },
    dueDate: { type: String, required: true },
    frequency: { type: String, enum: ['monthly', 'quarterly', 'annual'], default: 'monthly' },
  },
  { timestamps: true }
);

feeStructureSchema.index({ schoolId: 1, class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
