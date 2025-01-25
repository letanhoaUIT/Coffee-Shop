const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = { id: decoded.userId }; // Thêm user ID vào request
    next();
  } catch (error) {
    console.error('Token error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
