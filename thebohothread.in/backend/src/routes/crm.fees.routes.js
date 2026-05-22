const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/crm.fees.controller');

router.use(protect, authorize('school_admin', 'admin'));

router.get('/',                ctrl.getAll);
router.get('/summary',         ctrl.getSummary);
router.post('/create-order',   ctrl.createOrder);
router.post('/verify',         ctrl.verifyPayment);
router.post('/cash',           ctrl.recordCash);

module.exports = router;
