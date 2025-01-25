const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderItemSchema = new Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_type: { type: String, enum: ['drink', 'bean'], required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  size: { type: String, enum: ['S', 'M', 'L', '250mg', '500mg', '1000mg'], required: true },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const OrderItem = mongoose.model('OrderItem', orderItemSchema);
module.exports = OrderItem;
