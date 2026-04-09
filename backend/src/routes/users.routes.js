const router = require('express').Router();
const ctrl = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);
router.get('/me', ctrl.getMe);
router.put('/me', ctrl.updateProfileRules, validate, ctrl.updateMe);
router.put('/me/password', ctrl.changePasswordRules, validate, ctrl.changePassword);

module.exports = router;
