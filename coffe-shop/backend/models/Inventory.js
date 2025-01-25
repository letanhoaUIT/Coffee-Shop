const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  product_type: { type: String, enum: ['drink', 'bean'], required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  quantity_in_stock: { type: Number, default: 0 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
