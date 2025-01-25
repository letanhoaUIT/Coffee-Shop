const CoffeeDrink = require('../models/CoffeeDrink');
const CoffeeBean = require('../models/CoffeeBean');

/**
 * ☕️ Lấy chi tiết Coffee Drink theo ID
 */
const getCoffeeDrinkById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL

    const coffeeDrink = await CoffeeDrink.findById(id);
    if (!coffeeDrink) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm Coffee Drink' });
    }

    res.status(200).json(coffeeDrink);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết Coffee Drink:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết Coffee Drink', error: error.message });
  }
};

/**
 * 🌱 Lấy chi tiết Coffee Bean theo ID
 */
const getCoffeeBeanById = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID từ URL

    const coffeeBean = await CoffeeBean.findById(id);
    if (!coffeeBean) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm Coffee Bean' });
    }

    res.status(200).json(coffeeBean);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết Coffee Bean:', error);
    res.status(500).json({ message: 'Lỗi khi lấy chi tiết Coffee Bean', error: error.message });
  }
};

module.exports = {
  getCoffeeDrinkById,
  getCoffeeBeanById,
};
