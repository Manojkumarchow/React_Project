const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const { signout, signup, signin, isSignedIn } = require("../controllers/auth");
const regularExpression =
  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

router.get("/signout", signout);
router.post(
  "/signup",
  [
    check("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(regularExpression)
      .withMessage(
        "Password must contain a number, a capital letter and a special character and a lowercase letter"
      ),
    check("email").isEmail().withMessage("Invalid Email address"),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("password").isLength({ min: 1 }).withMessage("Password is required"),
    check("email").isEmail().withMessage("Email address is required"),
  ],
  signin
);
router.get("/test", isSignedIn, (req, res) => {
  res.json(req.auth);
});
module.exports = router;
