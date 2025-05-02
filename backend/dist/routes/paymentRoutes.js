const express = require('express');
const router = express.Router();
const { createMoMoPaymentUrl, handleMoMoReturn, handleMoMoIPN } = require('../controllers/paymentController');

router.post('/create_momo_payment_url', createMoMoPaymentUrl);
router.get('/momo_return', handleMoMoReturn);
router.post('/momo_ipn', handleMoMoIPN);

module.exports = router;