const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');

router.post('/create', authenticate, orderController.createOrder);
router.get('/history', authenticate, orderController.getOrderHistory);
router.get('/payment-methods', authenticate,  orderController.getPaymentMethods);

module.exports = router;
