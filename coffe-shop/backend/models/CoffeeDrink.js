// models/CoffeeDrink.js
const mongoose = require('mongoose');

const coffeeDrinkSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  description: { type: String },
  price_s: { type: Number, required: true },
  price_m: { type: Number, required: true },
  price_l: { type: Number, required: true },
  image_url: { type: String }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const CoffeeDrink = mongoose.model('CoffeeDrink', coffeeDrinkSchema);
module.exports = CoffeeDrink;
