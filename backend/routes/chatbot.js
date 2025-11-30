const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// Public routes (anyone can chat)
router.post('/', chatbotController.sendMessage);
router.get('/suggestions', chatbotController.getSuggestions);

// Protected routes (authenticated users get personalized responses)
router.post('/auth', protect, chatbotController.sendMessage);

module.exports = router;
