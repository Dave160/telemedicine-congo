const router = require('express').Router();
const ctrl = require('../controllers/payments.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/callback', ctrl.paymentCallback); // Webhook public
router.use(authenticate);
router.post('/initiate', ctrl.initiateRules, validate, ctrl.initiatePayment);
router.get('/history', ctrl.getPaymentHistory);

module.exports = router;
