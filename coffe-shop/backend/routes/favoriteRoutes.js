const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');  
const authenticate = require('../middleware/authenticate');

// Kiểm tra sản phẩm có trong danh sách yêu thích của người dùng không
// router.get('/:product_id',authenticate, favoriteController.checkFavoriteStatus); 

// Lấy tất cả sản phẩm yêu thích của người dùng
router.get('/',authenticate, favoriteController.getFavorites);

// Thêm sản phẩm vào yêu thích
router.post('/',authenticate, favoriteController.addFavorite);

// Xóa sản phẩm khỏi yêu thích
router.delete('/:id',authenticate, favoriteController.removeFavorite);

module.exports = router;
