const express = require('express');
const router = express.Router();
const { createMoMoPaymentUrl, handleMoMoReturn, handleMoMoIPN, getTotalRevenue } = require('../controllers/paymentController');

router.post('/create_momo_payment_url', createMoMoPaymentUrl);
router.get('/momo_return', handleMoMoReturn);
router.post('/momo_ipn', handleMoMoIPN);
router.get('/total-revenue', getTotalRevenue);

module.exports = router;