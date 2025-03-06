const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const Category = require("../models/Category");
const { auth, admin } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

// Multer Configuration
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).array("productImages", 5); // Allow up to 5 images

// Check File Type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

// @route   POST /api/products/create-product
// @desc    Create a new product
// @access  Private/Admin
router.post("/create-product", auth, admin, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    try {
      const product = new Product(req.body);
      const savedProduct = await product.save();
      if (req.files) {
        const imagePromises = req.files.map(async (file) => {
          const productImage = new ProductImage({
            ProductID: savedProduct._id,
            ImagePath: file.path,
          });
          await productImage.save();
        });
        await Promise.all(imagePromises);
      }

      res.status(201).json(savedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// @route   GET /api/products/get-all
// @desc    Get all products
// @access  Public
router.get("/get-all", async (req, res) => {
  try {
    const products = await Product.find().populate("CategoryID"); // Populate category details
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch Products with Search and Filter Options
// @route   GET /api/products/products-filter
// @desc    Get products with search and filter options
// @access  Public
router.get("/products-filter", async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, sortOrder } =
      req.query;

    let filter = {};

    if (search) {
      filter.Name = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    if (category) {
      const foundCategory = await Category.findOne({ Name: category });
      if (foundCategory) {
        filter.CategoryID = foundCategory._id;
      } else {
        return res.status(400).json({ message: "Category not found" });
      }
    }

    if (minPrice) {
      filter.Price = { $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      filter.Price = { ...filter.Price, $lte: parseFloat(maxPrice) };
    }

    let sort = {};

    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;
    }

    const products = await Product.find(filter)
      .sort(sort)
      .populate("CategoryID");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get a product by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "CategoryID"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product by ID
// @access  Private/Admin
router.put("/:id", auth, admin, async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }

    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      ).populate("CategoryID");

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      if (req.files) {
        // Delete old images associated with the product
        await ProductImage.deleteMany({ ProductID: req.params.id });

        // Upload new images
        const imagePromises = req.files.map(async (file) => {
          const productImage = new ProductImage({
            ProductID: req.params.id,
            ImagePath: file.path,
          });
          await productImage.save();
        });
        await Promise.all(imagePromises);
      }

      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by ID
// @access  Private/Admin
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
