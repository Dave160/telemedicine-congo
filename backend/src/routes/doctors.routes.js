const router = require('express').Router();
const ctrl = require('../controllers/doctors.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Routes publiques
router.get('/', ctrl.listDoctors);
router.get('/available-now', ctrl.getAvailableNow);
router.get('/:id', ctrl.getDoctorById);
router.get('/:doctorId/availabilities', authenticate, ctrl.getAvailabilities);

// Routes médecin authentifié
router.use(authenticate, authorize('DOCTOR'));
router.put('/profile', ctrl.profileRules, validate, ctrl.updateProfile);
router.get('/my/availabilities', ctrl.getAvailabilities);
router.post('/availabilities', ctrl.availabilityRules, validate, ctrl.createAvailability);
router.put('/availabilities/:id', ctrl.updateAvailability);
router.delete('/availabilities/:id', ctrl.deleteAvailability);
router.put('/status/toggle', ctrl.toggleOnlineStatus);

module.exports = router;
