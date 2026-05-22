const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const notesController = require('../controllers/notes.controller');
const upload = require('../config/multer');

router.get('/',         notesController.getAll);
router.get('/:id',      notesController.getById);
router.post('/:id/view', notesController.incrementView);

// Admin only
router.post('/',          ...adminOnly, upload.single('pdf'), notesController.create);
router.put('/:id',        ...adminOnly, upload.single('pdf'), notesController.update);
router.delete('/:id',     ...adminOnly, notesController.remove);

module.exports = router;
