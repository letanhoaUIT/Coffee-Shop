const express = require('express');
const CoffeeBean = require('../models/CoffeeBean');
const router = express.Router();

// Lấy tất cả coffee beans
router.get('/', async (req, res) => {
  try {
    const beans = await CoffeeBean.find().populate('category_id');
    res.json(beans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Lấy coffee bean theo id
router.get('/:id', async (req, res) => {
  try {
    const bean = await CoffeeBean.findById(req.params.id).populate('category_id');
    if (!bean) {
      return res.status(404).json({ message: 'Coffee Bean không tồn tại' });
    }
    res.json(bean);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm coffee bean mới
router.post('/', async (req, res) => {
  try {
    const { category_id, name, description, price_250mg, price_500mg, price_1000mg, image_url } = req.body;
    const bean = new CoffeeBean({ category_id, name, description, price_250mg, price_500mg, price_1000mg, image_url });
    await bean.save();
    res.status(201).json(bean);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
