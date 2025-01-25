const express = require('express');
const { register, login, getUserProfile, updateUserProfile, changePassword, getUserAddress, updateUserAddress, googleLogin } = require('../controllers/userController');
const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

router.get('/profile', getUserProfile);

router.put('/profile', updateUserProfile);

router.put('/change-password', changePassword);

router.get('/user/address', getUserAddress); // Lấy địa chỉ

router.put('/user/address', updateUserAddress); 

router.post('/google-login', googleLogin);
module.exports = router;
