const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/register', [
    body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
    body('fullname.lastname').isLength({ min: 3 }).withMessage('Last name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.registerUser)


router.post('/login', [
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], userController.loginUser)

router.post('/send-otp', [
    body('phoneNo').isMobilePhone().withMessage('Phone number is not valid')
], userController.sendOtp)


router.post('/verify-otp', [
    body('phoneNo').isMobilePhone().withMessage('Phone number is not valid'),
    body('otp').isLength({ min: 4, max: 4 }).withMessage('OTP must be 4 characters long')
], userController.verifyOtp)


router.get('/profile', authMiddleware.authUser, userController.getUserProfile);




module.exports = router;