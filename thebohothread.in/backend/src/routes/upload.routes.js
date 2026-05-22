const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const cloudinary = require('../config/cloudinary');
const { protect, authorize } = require('../middleware/auth.middleware');

// ── Multer in-memory storage ──────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PDF and image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Helper: buffer → base64 data URI
const bufferToDataURI = (buffer, mimetype) =>
  `data:${mimetype};base64,${buffer.toString('base64')}`;

// POST /api/upload/pdf
router.post(
  '/pdf',
  protect,
  authorize('admin', 'school_admin'),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const result  = await cloudinary.uploader.upload(dataURI, {
      folder: 'studyhub/pdfs',
      resource_type: 'raw',
      public_id: `pdf_${Date.now()}`,
    });

    res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  }
);

// POST /api/upload/image
router.post(
  '/image',
  protect,
  upload.single('file'),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const dataURI = bufferToDataURI(req.file.buffer, req.file.mimetype);
    const result  = await cloudinary.uploader.upload(dataURI, {
      folder: 'studyhub/images',
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
    });

    res.json({ success: true, data: { url: result.secure_url, publicId: result.public_id } });
  }
);

// DELETE /api/upload/:publicId  — remove from Cloudinary
router.delete(
  '/:publicId',
  protect,
  authorize('admin'),
  async (req, res) => {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'File deleted from Cloudinary' });
  }
);

module.exports = router;
