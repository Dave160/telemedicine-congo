const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const articleCtrl = require('../controllers/articles.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate, authorize('ADMIN'));

router.get('/users', ctrl.getUsers);
router.get('/doctors/pending', ctrl.getPendingDoctors);
router.put('/doctors/:id/verify', ctrl.verifyDoctor);
router.put('/doctors/:id/subscribe', ctrl.subscribeDoctor);
router.get('/stats', ctrl.getStats);
router.get('/payments', ctrl.getAllPayments);

// Gestion des articles via admin
router.post('/articles', articleCtrl.articleRules, validate, articleCtrl.createArticle);
router.put('/articles/:id', articleCtrl.updateArticle);
router.delete('/articles/:id', articleCtrl.deleteArticle);

module.exports = router;
