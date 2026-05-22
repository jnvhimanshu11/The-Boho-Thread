const Student = require('../models/Student.model');
const ExcelJS = require('exceljs');

// GET /crm/students
exports.getAll = async (req, res) => {
  const { class: cls, section, search, page = 1, limit = 20 } = req.query;
  const schoolId = req.user.schoolId;
  const filter = { schoolId };

  if (cls)     filter.class = cls;
  if (section) filter.section = section;
  if (search)  filter.$or = [
    { name: new RegExp(search, 'i') },
    { rollNumber: new RegExp(search, 'i') },
    { parentPhone: new RegExp(search, 'i') },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [data, total] = await Promise.all([
    Student.find(filter).sort({ class: 1, rollNumber: 1 }).skip(skip).limit(parseInt(limit)),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { data, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  });
};

// GET /crm/students/:id
exports.getById = async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, schoolId: req.user.schoolId });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: student });
};

// POST /crm/students
exports.create = async (req, res) => {
  const schoolId = req.user.schoolId;
  const exists = await Student.findOne({ rollNumber: req.body.rollNumber, class: req.body.class, schoolId });
  if (exists) return res.status(400).json({ success: false, message: 'Roll number already exists in this class' });

  const student = await Student.create({ ...req.body, schoolId });
  res.status(201).json({ success: true, data: student, message: 'Student added successfully' });
};

// PUT /crm/students/:id
exports.update = async (req, res) => {
  const student = await Student.findOneAndUpdate(
    { _id: req.params.id, schoolId: req.user.schoolId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: student, message: 'Student updated' });
};

// DELETE /crm/students/:id
exports.remove = async (req, res) => {
  const student = await Student.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, message: 'Student deleted' });
};

// GET /crm/students/export  — Excel export
exports.exportExcel = async (req, res) => {
  const students = await Student.find({ schoolId: req.user.schoolId }).sort({ class: 1, rollNumber: 1 });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Students');

  sheet.columns = [
    { header: 'Roll No.', key: 'rollNumber', width: 12 },
    { header: 'Name',      key: 'name',       width: 25 },
    { header: 'Class',     key: 'class',      width: 8 },
    { header: 'Section',   key: 'section',    width: 10 },
    { header: 'Gender',    key: 'gender',     width: 10 },
    { header: 'DOB',       key: 'dob',        width: 14 },
    { header: 'Parent',    key: 'parentName', width: 22 },
    { header: 'Phone',     key: 'parentPhone',width: 15 },
    { header: 'Address',   key: 'address',    width: 30 },
  ];

  // Style header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  students.forEach((s) => sheet.addRow(s.toObject()));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};
