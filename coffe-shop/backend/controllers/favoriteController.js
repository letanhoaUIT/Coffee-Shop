const Favorite = require('../models/Favorite');
const jwt = require('jsonwebtoken');

// Kiểm tra sản phẩm có trong danh sách yêu thích của người dùng không
const checkFavoriteStatus = async (req, res) => {
    try {
        const { product_id } = req.params;
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Kiểm tra sản phẩm trong danh sách yêu thích của người dùng
        const favorite = await Favorite.findOne({ user_id: userId, product_id });
        if (favorite) {
            return res.status(200).json({ message: 'Product is in favorites' });
        }

        res.status(404).json({ message: 'Product not found in favorites' });
    } catch (err) {
        console.error('Error checking favorite status', err);
        res.status(500).json({ message: 'Error checking favorite status' });
    }
};

// Thêm sản phẩm vào yêu thích
const addFavorite = async (req, res) => {
  try {
    const { product_id, product_type } = req.body;
    const user_id = req.user.id; // Lấy userId từ middleware authenticate

    // Kiểm tra bắt buộc
    if (!product_id || !product_type) {
      return res.status(400).json({ message: 'Product ID and product type are required.' });
    }

    // Kiểm tra sản phẩm đã có trong Favorites chưa
    const existingFavorite = await Favorite.findOne({ user_id, product_id });
    if (existingFavorite) {
      return res.status(400).json({ message: 'Product already exists in favorites.' });
    }

    // Thêm vào Favorites
    const favorite = new Favorite({ user_id, product_id, product_type });
    await favorite.save();

    res.status(201).json(favorite);
  } catch (err) {
    console.error('Error adding favorite:', err);
    res.status(500).json({ message: 'Error adding favorite', error: err.message });
  }
};


// Xóa sản phẩm khỏi yêu thích
const removeFavorite = async (req, res) => {
    try {
        const { id } = req.params; // ID của bản ghi Favorite
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const removed = await Favorite.findOneAndDelete({ _id: id, user_id: userId });
        if (!removed) {
            return res.status(404).json({ message: 'Favorite not found' });
        }

        res.status(200).json({ message: 'Product removed from favorites' });
    } catch (err) {
        console.error('Error removing favorite:', err);
        res.status(500).json({ message: 'Error removing favorite' });
    }
};

// Lấy tất cả sản phẩm yêu thích của người dùng
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy userId từ middleware authenticate

    const favorites = await Favorite.find({ user_id: userId });
    console.log(favorites);
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách yêu thích', error: error.message });
  }
};


// Export tất cả các hàm
module.exports = { getFavorites, addFavorite, removeFavorite, checkFavoriteStatus };
