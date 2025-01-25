const { OAuth2Client } = require('google-auth-library');

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hàm đăng ký (register)
const register = async (req, res) => {
  try {
    const { username, email, full_name, password } = req.body;

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    // Mã hóa mật khẩu trước khi lưu vào database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mới user
    const newUser = new User({
      username,
      email,
      full_name,
      password_hash: hashedPassword // Lưu mật khẩu đã mã hóa
    });

    // Lưu user vào database
    await newUser.save();

    // Trả về thông báo thành công
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong during registration' });
  }
};


// Hàm đăng nhập (login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra xem user có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Tạo token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Trả về token và thông tin user
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { username: user.username, full_name: user.full_name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong during login' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header Authorization
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
    const user = await User.findById(decoded.userId).select('full_name username email'); // Chọn các trường cần thiết

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong while fetching user data' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Lấy token từ header Authorization
    if (!token) return res.status(401).json({ message: "Token not found" });

    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy thông tin người dùng cần cập nhật từ request body
    const { full_name, email, username, avatar } = req.body; // Avatar có thể là URL hoặc base64

    // Cập nhật thông tin người dùng trong database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { full_name, email, username, avatar }, // Cập nhật thông tin
      { new: true } // Trả về user đã được cập nhật
    );

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Trả về thông tin người dùng đã cập nhật
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu có khớp không
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    // Lấy thông tin người dùng từ token
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header Authorization
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Mã hóa mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới vào database
    user.password_hash = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error while changing password' });
  }
};

const getUserAddress = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ address: user.address || '' }); // Trả về địa chỉ hoặc chuỗi rỗng nếu chưa có
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserAddress = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { address } = req.body;

    if (!address) return res.status(400).json({ message: 'Address is required' });

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { address },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'Address updated successfully', address: updatedUser.address });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }

};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Xác minh token Google
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Thay bằng Client ID từ Google Cloud
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId } = payload;

    // Kiểm tra xem user đã tồn tại trong hệ thống chưa
    let user = await User.findOne({ email });

    if (!user) {
      // Tạo user mới nếu chưa tồn tại
      user = new User({
        email,
        full_name: name,
        avatar: picture,
        google_id: googleId,
      });

      await user.save();
    }

    // Tạo JWT token cho ứng dụng
    const appToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Trả về token và thông tin người dùng
    res.status(200).json({
      message: 'Google login successful',
      token: appToken,
      user: { username: user.username, full_name: user.full_name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error during Google login' });
  }
};
module.exports = { register, login, getUserProfile, updateUserProfile, changePassword, getUserAddress, updateUserAddress, googleLogin };
