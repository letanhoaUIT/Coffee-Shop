const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'product_type', required: true },
  product_type: { type: String, enum: ['bean', 'drink'], required: true },
  selectedSize: { type: String, required: true },
  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model('CartItem', cartItemSchema);
