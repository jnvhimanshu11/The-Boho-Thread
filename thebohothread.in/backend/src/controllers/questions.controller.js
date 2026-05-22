const Question = require('../models/Question.model');

exports.getAll = async (req, res) => {
  const { class: cls, subject, chapter, type, isPYQ, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (cls)    filter.class = cls;
  if (subject) filter.subject = subject;
  if (chapter) filter.chapter = new RegExp(chapter, 'i');
  if (type)   filter.type = type;
  if (isPYQ === 'true') filter.isPYQ = true;

  const skip = (page - 1) * parseInt(limit);
  const [data, total] = await Promise.all([
    Question.find(filter).sort({ isPYQ: -1, year: -1 }).skip(skip).limit(parseInt(limit)),
    Question.countDocuments(filter),
  ]);

  res.json({ success: true, data: { data, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
};

exports.getById = async (req, res) => {
  const q = await Question.findById(req.params.id);
  if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
  res.json({ success: true, data: q });
};

exports.create = async (req, res) => {
  const q = await Question.create({ ...req.body, uploadedBy: req.user._id });
  res.status(201).json({ success: true, data: q, message: 'Question created' });
};

exports.update = async (req, res) => {
  const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!q) return res.status(404).json({ success: false, message: 'Question not found' });
  res.json({ success: true, data: q });
};

exports.remove = async (req, res) => {
  await Question.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Question deleted' });
};
