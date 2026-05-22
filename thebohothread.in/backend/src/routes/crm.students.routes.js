const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/crm.students.controller');

router.use(protect, authorize('school_admin', 'admin'));

router.get('/',               ctrl.getAll);
router.get('/export',         ctrl.exportExcel);
router.get('/:id',            ctrl.getById);
router.post('/',              ctrl.create);
router.put('/:id',            ctrl.update);
router.delete('/:id',         ctrl.remove);

module.exports = router;
