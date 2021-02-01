const Product = require("../models/product");

exports.products_get_all = (req, res, next) => {
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
};
