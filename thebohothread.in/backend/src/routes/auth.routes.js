const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

const validateLogin = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

const validateRegister = [
  body('name').isLength({ min: 2 }).withMessage('Name min 2 chars'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
];

router.post('/register', validateRegister, authController.register);
router.post('/login',    validateLogin,    authController.login);
router.post('/logout',   protect,          authController.logout);
router.get('/me',        protect,          authController.getMe);
router.post('/forgot-password',  authController.forgotPassword);
router.post('/reset-password',   authController.resetPassword);

module.exports = router;
