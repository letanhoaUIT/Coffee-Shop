const express = require('express');
const router = express.Router();
const { getCoffeeDrinkById, getCoffeeBeanById } = require('../controllers/productController');
const authenticate = require('../middleware/authenticate');

// ☕️ Route lấy chi tiết Coffee Drink
router.get('/coffee-drinks/:id', authenticate, getCoffeeDrinkById);

// 🌱 Route lấy chi tiết Coffee Bean
router.get('/coffee-beans/:id', authenticate, getCoffeeBeanById);

module.exports = router;
