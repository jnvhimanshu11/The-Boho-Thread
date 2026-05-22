const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isPDF = file.mimetype === 'application/pdf';
    return {
      folder: isPDF ? 'studyhub/pdfs' : 'studyhub/images',
      resource_type: isPDF ? 'raw' : 'image',
      allowed_formats: isPDF ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'],
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed. Upload PDF or image only.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

module.exports = upload;
