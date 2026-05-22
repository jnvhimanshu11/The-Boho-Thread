const express = require('express');
const router = express.Router();

// Mount all CRM sub-routers
router.use('/students',       require('./crm.students.routes'));
router.use('/fee-payments',   require('./crm.fees.routes'));
router.use('/fee-structures', require('./crm.feestructure.routes'));
router.use('/attendance',     require('./crm.attendance.routes'));
router.use('/dashboard',      require('./crm.dashboard.routes'));

module.exports = router;
