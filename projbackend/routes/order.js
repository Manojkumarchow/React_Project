const express = require("express");
const router = express.Router();
const { getUserById, userPurchaseList } = require("./../controllers/user");
const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
} = require("./../controllers/auth");
const { updateStock } = require("./../controllers/product");
const {
  getOrderById,
  createOrder,
  getAllOrders,
  getOrderStatus,
  updateStatus,
} = require("./../controllers/order");

//params
router.param("userId", getUserById);
router.param("orderId", getOrderById);

//actual routes

// create

router.post(
  "/order/create/:userId",
  isSignedIn,
  isAuthenticated,
  userPurchaseList,
  updateStock,
  createOrder
);

// read

router.get(
  "/order/all/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAllOrders
);

// status of the order

router.get(
  "/order/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getOrderStatus
);
router.put(
  "/order/:orderId/status/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateStatus
);

module.exports = router;
