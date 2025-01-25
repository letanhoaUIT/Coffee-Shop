const CartItem = require('../models/CartItem');

const getCart = async (req, res) => {
  try {
    const cart = await CartItem.find({ user_id: req.user._id });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

const addToCart = async (req, res) => {
  const { product_id, product_type, selectedSize, quantity } = req.body;
  try {
    let item = await CartItem.findOne({ user_id: req.user._id, product_id, selectedSize });
    if (item) {
      item.quantity += quantity;
      await item.save();
    } else {
      item = new CartItem({ user_id: req.user._id, product_id, product_type, selectedSize, quantity });
      await item.save();
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
};
const updateCartItem = async (req, res) => {
  try {
    const { id, selectedSize } = req.params;
    const { quantity, newSize } = req.body;

    // Tìm sản phẩm trong giỏ hàng
    const cart = await Cart.findOne({ user_id: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Cập nhật sản phẩm
    const item = cart.items.find(
      (i) => i.product_id.toString() === id && i.size === selectedSize
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (newSize) {
      item.size = newSize;
    }
    if (quantity) {
      item.quantity = quantity;
    }

    await cart.save();
    res.status(200).json(cart.items);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error updating cart item' });
  }
};


const removeCartItem = async (req, res) => {
  const { id, size } = req.params;
  try {
    await CartItem.findOneAndDelete({ user_id: req.user._id, product_id: id, selectedSize: size });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing cart item' });
  }
};

const countCartItems = async (req, res) => {
  console.log('countCartItems called');
  console.log('User ID:', req.user?._id);
  try {
    const cartItems = await CartItem.find({ user_id: req.user._id });
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ totalQuantity });
  } catch (error) {
    console.error('Error counting cart items:', error);
    res.status(500).json({ message: 'Error counting cart items' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, countCartItems };

