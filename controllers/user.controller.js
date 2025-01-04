const phoneVerificationModel = require("../models/phoneVerification.model");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

module.exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, email, password } = req.body;

  const hashPassword = await userModel.hashPassword(password);

  const user = await userService.createUser({
    firstname: fullname.firstname,
    lastname: fullname.lastname,
    email,
    password: hashPassword,
  });

  const token = user.generateAuthToken();

  res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid password" });
  }

  const token = user.generateAuthToken();

  res.status(200).json({ token, user });
};

module.exports.sendOtp = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    const message = `Your Verification Code is ${otp}`;

    const userWithNo = await userService.createUserWithNo({ phoneNo, otp });
    console.log(
      `User created with OTP: ${otp}, PhoneNo: ${phoneNo}`,
      userWithNo
    );

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phoneNo}`,
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp:", error);

    if (error.message.includes("All fields are required")) {
      return res
        .status(400)
        .json({ message: "Phone number and OTP are required." });
    }

    res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNo, otp } = req.body;

    if (!phoneNo || !otp) {
      return res.status(400).json({ message: "Phone number and OTP are required." });
    }

    const user = await phoneVerificationModel.findOne({ phoneNo, otp });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or phone number." });
    }

    const token = user.generateAuthToken();

    console.log(`OTP Verified: ${otp}, PhoneNo: ${phoneNo}`);

    return res.status(200).json({ 
      message: "OTP verified successfully", 
      token 
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};
