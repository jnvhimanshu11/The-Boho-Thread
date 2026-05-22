const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'short', 'long'], required: true },
    subject: { type: String, required: true },
    class: { type: String, required: true, enum: ['6','7','8','9','10','11','12','College'] },
    chapter: { type: String, required: true },
    year: Number,
    isPYQ: { type: Boolean, default: false },
    options: [String],
    correctOption: Number,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    marks: { type: Number, default: 1 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

questionSchema.index({ class: 1, subject: 1, type: 1 });
questionSchema.index({ isPYQ: 1, year: -1 });

module.exports = mongoose.model('Question', questionSchema);
