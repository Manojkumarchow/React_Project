const mongoose = require("mongoose");
const Schema = mongoose.Schema();
const crypto = require("crypto");
const uuidv4 = require("uuid/v1");
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  adminInfo: {
    type: String,
    trim: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  orders: {
    type: Array,
    default: [],
  },
  salt: String,
});

adminSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.password = this.makeHashPassword(this._password);
  })
  .get(function () {
    return this._password;
  });

adminSchema.method = {
  authenticateAdmin: function (enteredPassword) {
    return this.makeHashPassword(enteredPassword) === this.password;
  },

  makeHashPassword: function (plainText) {
    if (!plainText) return "";

    try {
      return crypto
        .createHash("md5", this.salt)
        .update(plainText)
        .digest("hex");
    } catch (err) {
      return err.message;
    }
  },
};

module.exports = mongoose.model("Admin", adminSchema);
