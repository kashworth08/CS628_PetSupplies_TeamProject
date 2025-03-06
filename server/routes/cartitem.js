const express = require("express");
const router = express.Router();
const CartItem = require("../models/CartItem");
const ProductImage = require("../models/ProductImage");
const { auth } = require("../middleware/auth");

// @route GET /cart/add-to-cart
// @desc Add to Cart
// @access Private
// @role User
router.post("/add-to-cart", auth, async (req, res) => {
  try {
    const cartItem = new CartItem(req.body);
    const savedCartItem = await cartItem.save();
    res.status(201).json(savedCartItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/// @route GET /cart/get-all
// @desc Get All CartItems
// @access Private
// @role User
router.get("/get-all", auth, async (req, res) => {
  try {
    const cartItems = await CartItem.find()
      .populate({
        path: "ProductID",
        populate: {
          path: "CategoryID",
        },
      })
      .populate("UserID");

    // Retrieve product images for each cart item
    const cartItemsWithImages = await Promise.all(
      cartItems.map(async (cartItem) => {
        const productImages = await ProductImage.find({
          ProductID: cartItem.ProductID._id,
        });
        return {
          ...cartItem.toObject(), // Convert mongoose document to plain object
          productImages,
        };
      })
    );

    res.json(cartItemsWithImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /cart/:id
// @desc Update CartItem
// @access Private
// @role User
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedCartItem = await CartItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    ).populate("UserID ProductID");
    if (!updatedCartItem) {
      return res.status(404).json({ message: "CartItem not found" });
    }
    res.json(updatedCartItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route DELETE /cart/:id
// @desc Delete CartItem
// @access Private
// @role User
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedCartItem = await CartItem.findByIdAndDelete(req.params.id);
    if (!deletedCartItem) {
      return res.status(404).json({ message: "CartItem not found" });
    }
    res.json({ message: "CartItem deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
