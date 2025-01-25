const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_type: { type: String, enum: ['drink', 'bean'], required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, refPath: 'product_type', required: true }, // Dynamic ref
}, {
  timestamps: true,
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
