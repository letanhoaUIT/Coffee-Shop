const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');

router.get('/cart', authenticate, cartController.getCart);
router.post('/cart', authenticate, cartController.addToCart);
router.put('/cart/:id/:selectedSize', authenticate, cartController.updateCartItem);
router.delete('/cart/:id/:size', authenticate, cartController.removeCartItem);

// Đếm số lượng sản phẩm trong giỏ hàng
router.get('/count', authenticate, cartController.countCartItems);

module.exports = router;
