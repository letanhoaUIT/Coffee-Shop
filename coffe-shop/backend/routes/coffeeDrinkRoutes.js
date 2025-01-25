const express = require('express');
const CoffeeDrink = require('../models/CoffeeDrink');
const router = express.Router();

// Lấy tất cả coffee drinks
router.get('/', async (req, res) => {
  try {
    const drinks = await CoffeeDrink.find().populate('category_id');
    res.json(drinks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy coffee drink theo id
router.get('/:id', async (req, res) => {
  try {
    const drink = await CoffeeDrink.findById(req.params.id).populate('category_id');
    if (!drink) {
      return res.status(404).json({ message: 'Coffee Drink không tồn tại' });
    }
    res.json(drink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm coffee drink mới
router.post('/', async (req, res) => {
  try {
    const { category_id, name, description, price_s, price_m, price_l, image_url } = req.body;
    const drink = new CoffeeDrink({ category_id, name, description, price_s, price_m, price_l, image_url });
    await drink.save();
    res.status(201).json(drink);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
