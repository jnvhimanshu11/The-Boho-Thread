const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/questions.controller');

router.get('/',      ctrl.getAll);
router.get('/:id',   ctrl.getById);
router.post('/',     ...adminOnly, ctrl.create);
router.put('/:id',   ...adminOnly, ctrl.update);
router.delete('/:id',...adminOnly, ctrl.remove);

module.exports = router;
