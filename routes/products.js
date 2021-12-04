const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.category) {
    filter = { category: req.query.category.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Product deleted successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Product Id" });
  }
  const category = await Category.findById(req.params.category);
  if (!category) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Category" });
  }
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    },
    {
      new: true,
    }
  );
  if (!product) {
    return res.status(404).send("Product cannot be Updated.");
  }
  res.status(201).send(product);
});

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments();

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({ productCount: productCount });
});

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featuredProduct = await Product.find({ isFeatured: true }).limit(
    +count
  );

  if (!featuredProduct) {
    res.status(500).json({ success: false });
  }
  res.send(featuredProduct);
});

router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.params.category);
  if (!category) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Category" });
  }
  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });

  product = await product.save();
  if (!product) {
    return res
      .status(500)
      .json({ success: false, message: "Cannot save product" });
  }
  return res.send(product);
});

module.exports = router;
