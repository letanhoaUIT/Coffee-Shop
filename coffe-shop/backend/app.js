const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/userRoutes');
const categoriesRoutes = require('./routes/categoryRoutes');
const coffeeBeanRoutes = require('./routes/coffeeBeanRoutes');
const coffeeDrinkRoutes = require('./routes/coffeeDrinkRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');

// Khởi tạo Express app
const app = express();

// Middleware
app.use(express.json()); // Xử lý JSON body
app.use(cors()); // Cấu hình CORS cho phép truy cập từ frontend

// Kết nối tới MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/coffeeBeans', coffeeBeanRoutes);
app.use('/api/coffeeDrinks', coffeeDrinkRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
