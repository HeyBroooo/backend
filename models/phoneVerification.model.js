const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const phoneVerificationSchema = new mongoose.Schema({
  phoneNo: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

phoneVerificationSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET);
  return token;
};

const phoneVerificationModel = mongoose.model(
  "phoneVerification",
  phoneVerificationSchema
);

module.exports = phoneVerificationModel;
