const router = require('express').Router();
const ctrl = require('../controllers/messages.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/conversations', ctrl.getConversations);
router.get('/conversations/:id/messages', ctrl.getMessages);
router.post('/conversations/:id/messages', ctrl.sendMessage);
router.put('/messages/:id/read', ctrl.markRead);

module.exports = router;
