const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/webhook', chatbotController.handleWebhook);

module.exports = router;