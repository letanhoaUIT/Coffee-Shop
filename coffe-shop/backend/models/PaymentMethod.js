const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  method_name: { type: String, required: true, unique: true },
  description: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);
module.exports = PaymentMethod;
