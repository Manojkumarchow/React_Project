const mongoose = require("mongoose");
const crypto = require("crypto");
const uuidv1 = require("uuid/v1");
// const Schema = mongoose.schema;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 32,
    trim: true,
  },
  lastName: {
    type: String,
    maxlength: 32,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  userInfo: {
    type: String,
    trim: true,
  },
  encrypted_password: {
    type: String,
    required: true,
  },
  salt: String,
  role: {
    type: Number,
    default: 0,
  },
  purchases: {
    type: Array,
    default: [],
  },
}, {timestamps: true});
userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.encrypted_password = this.securedPassword(password);
  })
  .get(function () {
    return this._password;
  });

userSchema.methods = {
  authenticateUser: function (password) {
    return this.securedPassword(password) === this.encrypted_password;
  },
  securedPassword: function (password) {
    if (!password) {
      return "";
    }
    try {
      return crypto
        .createHmac("sha256", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return err.message;
    }
  },
};

module.exports = mongoose.model("User", userSchema);
