const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: {
      type: String,
      required: true,
      enum: ['Mathematics','Science','English','Hindi','Social Science','Physics',
             'Chemistry','Biology','History','Geography','Economics',
             'Political Science','Computer Science','Other'],
    },
    class: {
      type: String,
      required: true,
      enum: ['6','7','8','9','10','11','12','College'],
    },
    chapter: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    pdfUrl: String,
    pdfPublicId: String,
    tags: [String],
    isRevisionNote: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    viewCount:     { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

noteSchema.index({ class: 1, subject: 1 });
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ isRevisionNote: 1 });
noteSchema.index({ downloadCount: -1 });

module.exports = mongoose.model('Note', noteSchema);
