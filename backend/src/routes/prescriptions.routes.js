const router = require('express').Router();
const ctrl = require('../controllers/prescriptions.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);
router.get('/mine', ctrl.getMyPrescriptions);
router.get('/:id', ctrl.getPrescriptionById);
router.post('/', authorize('DOCTOR'), ctrl.createRules, validate, ctrl.createPrescription);
router.post('/:id/send', authorize('DOCTOR'), ctrl.sendPrescription);

module.exports = router;
