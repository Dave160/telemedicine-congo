const router = require('express').Router();
const ctrl = require('../controllers/appointments.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate);
router.post('/', ctrl.bookRules, validate, ctrl.bookAppointment);
router.get('/', ctrl.listAppointments);
router.get('/:id', ctrl.getAppointmentById);
router.put('/:id/confirm', ctrl.confirmAppointment);
router.put('/:id/cancel', ctrl.cancelAppointment);
router.put('/:id/complete', ctrl.completeAppointment);

module.exports = router;
