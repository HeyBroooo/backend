const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/**
 * User Schema and Model
 */
const userSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: [true, "First name is required"],
      minlength: [3, "First name must be at least 3 characters long"],
      trim: true,
    },
    lastname: {
      type: String,
      minlength: [3, "Last name must be at least 3 characters long"],
      trim: true,
    },
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    minlength: [5, "Email must be at least 5 characters long"],
    validate: {
      validator: function (value) {
        return /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(value);
      },
      message: (props) => `${props.value} is not a valid email address`,
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    select: false,
  },
});

// Instance Methods
userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Static Methods
userSchema.methods.hashPassword = async function (password) {
  return bcrypt.hash(password, 10);
};

const UserModel = mongoose.model("User", userSchema);

/**
 * Phone Verification Schema and Model
 */
const phoneSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    required: [true, "Phone number is required"],
    unique: true,
    validate: {
      validator: function (value) {
        return /^\d{10}$/.test(value);
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
  otp: {
    type: String,
    required: [true, "OTP is required"],
    minlength: [4, "OTP must be 4 characters long"],
    maxlength: [4, "OTP must be 4 characters long"],
  },
});

// Instance Methods
phoneSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const PhoneVerificationModel = mongoose.model("PhoneVerification", phoneSchema);

module.exports = {
  UserModel,
  PhoneVerificationModel,
};
