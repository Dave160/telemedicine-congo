const router = require('express').Router();
const ctrl = require('../controllers/subscription.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('DOCTOR'));
router.post('/', ctrl.subscribeToPlatform);
router.get('/status', ctrl.getSubscriptionStatus);

module.exports = router;
