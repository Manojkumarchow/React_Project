// same name as route
const { check, validationResult } = require("express-validator");
const User = require("./../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "User signed out successfully",
  });
};
exports.signup = (req, res) => {
  const errors = validationResult(req);
  // if errors are present
  if (!errors.isEmpty()) {
    // DB ERROR
    return res.status(422).json({
      error: errors.array()[0].msg,
      param: errors.array()[0].param,
    });
  }
  const user = new User(req.body); // GETTING THE USER OBJECT FROM REQ_BODY
  // SAVE USER TO DB
  user.save((error, user) => {
    if (error) {
      console.log(error);
      return res.status(400).json({
        error: "Not able to save the User to DB",
      });
    } else {
      res.json({
        name: user.name,
        email: user.email,
        id: user._id,
      });
    }
  });
};

exports.signin = (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  if (!errors.isEmpty()) {
    // DB ERROR
    return res.status(422).json({
      error: errors.array()[0].msg,
      param: errors.array()[0].param,
    });
  }
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User email does not exist",
      });
    }
    if (!user.authenticateUser(password)) {
      return res.status(401).json({
        error: "Email and password do not match",
      });
    }
    // CREATE A TOKEN AND PUT THAT TOKEN INTO THE COOKIES OF THE BROWSER
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY);
    // PUT TOKEN IN COOKIE
    res.cookie("token", token, { expire: new Date() + 9999 });
    //SEND RESPONSE TO FRONT-END
    const { _id, name, email, role } = user;
    return res.json({
      token,
      user: { _id, name, email, role },
    });
  });
};

// PROTECTED ROUTES
exports.isSignedIn = expressJwt({
  secret: process.env.SECRET_KEY,
  userProperty: "auth",
});

// CUSTOM MIDDLEWARES
exports.isAuthenticated = (req, res, next) => {
  // this auth is when the user is signedIn (POSTMAN example for protected route)
  // profile is going to be sent from the front-end
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({
      error: "Access ledu ra niku",
    });
  }
  next();
};
exports.isAdmin = (req, res, next) => {
  // next is a middleware
  // it is responsible for shifting the control from one middleware to the other
  if (req.profile.role != 1) {
    return res.status(403).json({
      error: "Nv Admin kaadhu",
    });
  }
  next();
};
