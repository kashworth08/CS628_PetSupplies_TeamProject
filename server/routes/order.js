const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { auth, admin } = require("../middleware/auth");

// @route POST /api/orders/add-order
// @desc Add Order
// @access Private
// @role User
router.post("/add-order", auth, async (req, res) => {
  try {
    const { UserID, OrderItems, ShippingAddress, PaymentMethod } = req.body;

    // Calculate total amount from order items
    let totalAmount = 0;
    for (const item of OrderItems) {
      const product = await Product.findById(item.ProductID);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product with ID ${item.ProductID} not found` });
      }
      totalAmount += product.Price * item.Quantity;
    }

    const order = new Order({
      UserID,
      TotalAmount: totalAmount,
      ShippingAddress,
      PaymentMethod,
    });

    const savedOrder = await order.save();

    // Create OrderItems
    const orderItemPromises = OrderItems.map(async (item) => {
      const product = await Product.findById(item.ProductID);
      const orderItem = new OrderItem({
        OrderID: savedOrder._id,
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        Price: product.Price, // Price at the time of order
      });
      await orderItem.save();
    });

    await Promise.all(orderItemPromises);

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/orders/:id
// @desc Get Order by ID
// @access Private
// @role Admin/User
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("UserID");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItems = await OrderItem.find({
      OrderID: req.params.id,
    }).populate("ProductID");

    res.json({ order, orderItems });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/orders/:id/status
// @desc Update Order Status
// @access Private
// @role Admin
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const { OrderStatus } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { OrderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route GET /api/orders/user/:userId
// @desc Get all orders by user ID
// @access Private
// @role Admin/User
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const orders = await Order.find({ UserID: req.params.userId }).populate(
      "UserID"
    );
    if (!orders) {
      return res.status(404).json({ message: "Orders not found" });
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
