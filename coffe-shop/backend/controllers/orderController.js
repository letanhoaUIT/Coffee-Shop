const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const PaymentMethod = require('../models/PaymentMethod');
const CoffeeDrink = require('../models/CoffeeDrink');
const CoffeeBean = require('../models/CoffeeBean');

/**
 * 🛒 Tạo Đơn Hàng
 */
const createOrder = async (req, res) => {
  try {
    const { items, total_amount, payment_method_name } = req.body;

    // Kiểm tra user ID từ middleware
    if (!req.user?.id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Kiểm tra phương thức thanh toán
    const paymentMethod = await PaymentMethod.findOne({ method_name: payment_method_name });
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Tạo đơn hàng
    const order = new Order({
      user_id: req.user.id, // Sử dụng req.user.id từ middleware
      total_amount,
      payment_method_id: paymentMethod._id,
      status: 'Pending',
    });
    await order.save();

    // Thêm sản phẩm vào OrderItem
    const orderItems = items.map((item) => ({
      order_id: order._id,
      product_type: item.product_type,
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));
    await OrderItem.insertMany(orderItems);

    res.status(201).json({ message: 'Order created successfully', order_id: order._id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};


const getOrderHistory = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const orders = await Order.find({ user_id: req.user.id })
      .populate('payment_method_id', 'method_name')
      .sort({ createdAt: -1 });

    const detailedOrders = [];

    for (let order of orders) {
      const items = await OrderItem.find({ order_id: order._id }).lean();

      for (let item of items) {
        let product;

        if (item.product_type === 'drink') {
          product = await CoffeeDrink.findById(item.product_id, 'name');
        } else if (item.product_type === 'bean') {
          product = await CoffeeBean.findById(item.product_id, 'name');
        }

        item.name = product ? product.name : 'Unknown Product';
      }

      detailedOrders.push({
        _id: order._id,
        createdAt: order.createdAt,
        total_amount: order.total_amount,
        payment_method: order.payment_method_id?.method_name,
        items,
      });
    }

    res.json(detailedOrders);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

const getPaymentMethods = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const methods = await PaymentMethod.find();
    res.status(200).json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ message: 'Server error while fetching payment methods' });
  }
};

module.exports = { createOrder, getOrderHistory, getPaymentMethods };
