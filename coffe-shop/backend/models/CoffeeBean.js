// models/CoffeeBean.js
const mongoose = require('mongoose');

const coffeeBeanSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price_250mg: { type: Number, required: true },
  price_500mg: { type: Number, required: true },
  price_1000mg: { type: Number, required: true },
  image_url: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const CoffeeBean = mongoose.model('CoffeeBean', coffeeBeanSchema);
module.exports = CoffeeBean;
