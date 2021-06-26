const User = require("./../models/user");
const Order = require("./../models/order");
exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "No User found!",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getAllUsers = (req, res) => {
  User.find().exec((err, users) => {
    if (err || !users) {
      return res.status(400).json({
        error: "No User exists!",
      });
    }
    res.json(users);
    //  = users;
    // next();
  });
};

exports.getUser = (req, res) => {
  // TODO: get back here for password
  req.profile.salt = undefined;
  req.profile.encrypted_password = undefined;
  req.profile.createdAt = undefined;
  req.profile.updatedAt = undefined;
  req.profile.__v = undefined;
  // to disable the fields while sending a request for password etc...
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false },
    (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "You're not authorized to update the user",
        });
      }
      user.salt = undefined;
      user.encrypted_password = undefined;
      user.createdAt = undefined;
      user.updatedAt = undefined;
      // user.profile.__v = undefined;
      res.json(user);
    }
  );
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name email")
    .exec((err, order) => {
      if (err) {
        return res.status(400).json({
          error: "No Orders for this user",
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];
  req.body.order.products.forEach((product) => {
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      catgeory: product.catgeory,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    });
  });

  // store this in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } }, // updating DB purchases with Local Purchases
    { new: true }, // from the DB send me the updated object, so we use new as true
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list",
        });
      }
      next();
    }
  );
  
};
