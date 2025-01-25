const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  total_amount: { type: Number, required: true },
  payment_method_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentMethod', required: true },
  status: { type: String, default: 'Pending' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
