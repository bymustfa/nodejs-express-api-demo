const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const ex = file.originalname.split(".")[1];
    function uuidv4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    cb(null, uuidv4() + "." + ex);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg or png image upload."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, //5 MB
  },
  fileFilter: fileFilter,
});

const Product = require("../models/product");
// const ProductsController = require("../controllers/products");

router.get("/", (req, res, next) => {
  Product.find()
    .select("name price _id productImage")
    .exec()
    .then((docs) => {
      if (docs) {
        const response = {
          count: docs.length,
          products: docs.map((item) => {
            return {
              name: item.name,
              price: item.price,
              _id: item._id,
              productImage: item.productImage,
              request: {
                type: "GET",
                url:
                  `http://localhost:${process.env.PORT || 3001}/products/` +
                  item._id,
              },
            };
          }),
        };
        res.status(200).json(response);
      } else {
        res.status(404).json({ message: "No valid entry..." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          name: doc.name,
          price: doc.price,
          _id: doc._id,
          productImage: doc.productImage,
          request: {
            type: "GET",
            description: "Get all products",
            url: `http://localhost:${process.env.PORT || 3001}/products`,
          },
        });
      } else {
        res.status(404).json({ message: "No valid entry..." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
  });
  product
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Product save",
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: "POST",
            url:
              `http://localhost:${process.env.PORT || 3001}/products/` +
              result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.key] = ops.value;
  }
  Product.update(
    { _id: id },
    {
      $set: updateOps,
    }
  )
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product updated",
        request: {
          type: "GET",
          url: `http://localhost:${process.env.PORT || 3001}/products/` + id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:productId", checkAuth, (req, res, next) => {
  const id = req.params.productId;
  Product.remove({ _id: id })
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          message: "Product deleted.",
          request: {
            type: "POST",
            url: `http://localhost:${process.env.PORT || 3001}/products`,
            data: { name: "String", price: "Number" },
          },
        });
      } else {
        res.status(404).json({ message: "No valid entry..." });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
