const Product = require("./../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs"); // fs - file system

exports.getProductId = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      // products will come based on category (using populate)
      if (err) {
        return res.status(400).json({
          error: "No Product Found!",
        });
      }
      req.product = product;
      // return res.json(product);
    });
  next();
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with the image uploaded.",
      });
    }
    // destructure the field
    const { name, description, price, category, stock } = fields;

    // restrictions on field
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let product = new Product(fields);
    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);
    // save to the DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Error in Saving photo to DB!",
        });
      }
      return res.json(product);
    });
  });
};

exports.getProduct = (req, res) => {
  const product = req.product;
  req.product.photo = undefined;
  return res.json(req.product);
};

// MIDDLEWARE
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  //
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to Delete the product!",
      });
    }
    return res.json({
      message: `Delete the product ${deletedProduct.name}`,
    });
  });
};

exports.updateProduct = (req, res) => {
  //
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with the image uploaded.",
      });
    }
    // destructure the field
    // const { name, description, price, category, stock } = fields;

    // // restrictions on field
    // // if (!name || !description || !price || !category || !stock) {
    // //   return res.status(400).json({
    // //     error: "Please include all fields",
    // //   });
    // // }

    // updation code - using lodash
    let product = req.product;
    product = _.extend(product, fields);
    // handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big",
        });
      }

      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);
    // save to the DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Error in updating product to DB!",
        });
      }
      return res.json(product);
    });
  });
};

// product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 5;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No Products found",
        });
      }
      return res.json(products);
    });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    //
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });
  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Operations Failed",
      });
    }
    // return res.json
    next();
  });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "No Categories Found!",
      });
    }
    return res.json(category);
  });
};
