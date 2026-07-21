const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatLimiter } = require('../middleware/rateLimiter');
const { sendMessage, getChatHistory, getChatById, deleteChat } = require('../controllers/chatController');

// All chat routes are protected
router.use(protect);

router.post('/message', chatLimiter, sendMessage);
router.get('/history', getChatHistory);
router.get('/:chatId', getChatById);
router.delete('/:chatId', deleteChat);

module.exports = router;
