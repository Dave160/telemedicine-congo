const router = require('express').Router();
const ctrl = require('../controllers/articles.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Routes publiques
router.get('/', ctrl.listArticles);
router.get('/:id', ctrl.getArticleById);

// Routes admin
router.use(authenticate, authorize('ADMIN'));
router.get('/admin/all', ctrl.listAllArticles);
router.post('/', ctrl.articleRules, validate, ctrl.createArticle);
router.put('/:id', ctrl.updateArticle);
router.delete('/:id', ctrl.deleteArticle);

module.exports = router;
