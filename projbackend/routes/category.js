const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategoryById,
  getCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("./../controllers/category");
const { getUserById } = require("./../controllers/user");
const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
} = require("./../controllers/auth");

//params
router.param("userId", getUserById);
router.param("categoryId", getCategoryById);

// actual routes
router.post(
  "/category/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createCategory
); // validate the user(so we're using userId from user controller)

// READ ROUTES
router.get("/category/:categoryId", getCategory);
router.get("/categories", getAllCategories);

// UPDATE ROUTES
router.put(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateCategory
);

// DELETE ROUTES
router.delete(
  "/category/:categoryId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteCategory
);

module.exports = router;
