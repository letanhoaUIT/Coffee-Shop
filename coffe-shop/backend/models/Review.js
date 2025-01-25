const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_type: { type: String, enum: ['drink', 'bean'], required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating từ 1 đến 5
  comment: { type: String },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
