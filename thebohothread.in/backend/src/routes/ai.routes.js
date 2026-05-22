const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const aiController = require('../controllers/ai.controller');

router.post('/solve-doubt',    protect, aiController.solveDoubt);
router.post('/summarize',      protect, aiController.summarizeNotes);
router.post('/homework',       protect, aiController.homeworkHelper);
router.post('/essay',          protect, aiController.essayWriter);
router.post('/generate-quiz',  protect, aiController.generateQuiz);

module.exports = router;
