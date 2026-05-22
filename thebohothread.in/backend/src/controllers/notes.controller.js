const Note = require('../models/Note.model');
const cloudinary = require('../config/cloudinary');

const paginate = (query, page = 1, limit = 12) => ({
  skip: (page - 1) * limit,
  limit: parseInt(limit),
});

exports.getAll = async (req, res) => {
  const { class: cls, subject, chapter, search, isRevisionNote, page = 1, limit = 12 } = req.query;
  const filter = { isPublished: true };

  if (cls)      filter.class = cls;
  if (subject)  filter.subject = subject;
  if (chapter)  filter.chapter = new RegExp(chapter, 'i');
  if (isRevisionNote === 'true') filter.isRevisionNote = true;
  if (search)   filter.$text = { $search: search };

  const { skip, limit: lim } = paginate({}, page, limit);
  const [data, total] = await Promise.all([
    Note.find(filter).sort({ downloadCount: -1 }).skip(skip).limit(lim).select('-content'),
    Note.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { data, total, page: parseInt(page), limit: lim, totalPages: Math.ceil(total / lim) },
  });
};

exports.getById = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  res.json({ success: true, data: note });
};

exports.incrementView = async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  res.json({ success: true });
};

exports.create = async (req, res) => {
  const { title, subject, class: cls, chapter, content, tags, isRevisionNote } = req.body;
  let pdfUrl, pdfPublicId;

  if (req.file) {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'studyhub/pdfs', resource_type: 'raw' });
    pdfUrl = result.secure_url;
    pdfPublicId = result.public_id;
  }

  const note = await Note.create({
    title, subject, class: cls, chapter, content,
    tags: tags ? tags.split(',').map(t => t.trim()) : [],
    isRevisionNote: isRevisionNote === 'true',
    pdfUrl, pdfPublicId,
    uploadedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: note, message: 'Note created' });
};

exports.update = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });

  const updates = { ...req.body };
  if (req.body.tags) updates.tags = req.body.tags.split(',').map(t => t.trim());

  if (req.file) {
    if (note.pdfPublicId) await cloudinary.uploader.destroy(note.pdfPublicId, { resource_type: 'raw' });
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'studyhub/pdfs', resource_type: 'raw' });
    updates.pdfUrl = result.secure_url;
    updates.pdfPublicId = result.public_id;
  }

  const updated = await Note.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: updated, message: 'Note updated' });
};

exports.remove = async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
  if (note.pdfPublicId) await cloudinary.uploader.destroy(note.pdfPublicId, { resource_type: 'raw' }).catch(() => {});
  await note.deleteOne();
  res.json({ success: true, message: 'Note deleted' });
};
