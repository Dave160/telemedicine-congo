const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middleware/validate');

router.post('/register', ctrl.registerRules, validate, ctrl.register);
router.post('/verify-otp', ctrl.verifyOTPRules, validate, ctrl.verifyOTP);
router.post('/login', ctrl.loginRules, validate, ctrl.login);
router.post('/resend-otp', ctrl.resendOTP);
router.post('/refresh-token', ctrl.refreshToken);
router.post('/logout', ctrl.logout);

module.exports = router;
