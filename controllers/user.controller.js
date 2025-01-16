const phoneVerificationModel = require("../models/phoneVerification.model");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt"); // Removed the 'import' statement
const { db } = require("../db/db");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const userRef = db.ref("UserDataBase"); // Reference to the Firebase Realtime Database


const TwilioClient = require("twilio")(accountSid, authToken);

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./session" }),
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR code generated for WhatsApp");
});

client.on("ready", () => {
  console.log("WhatsApp client is ready!");
});

client.on("disconnected", (reason) => {
  console.log("WhatsApp disconnected:", reason);
  console.log("Reconnecting...");
  client.initialize();
});

client.initialize();

const handleValidationErrors = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return { isValid: false, errors: errors.array() };
  }
  return { isValid: true };
};

module.exports.registerUser = async (req, res) => {
  const validation = handleValidationErrors(req);
  if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
  }

  try {
      const { fullname, email, password } = req.body;


      const user = await userService.createUser({
          firstname: fullname.firstname,
          lastname: fullname.lastname,
          email,
          password: password,  
      });


      res.status(201).json({ user });
  } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};


module.exports.loginUser = async (req, res) => {
  const validation = handleValidationErrors(req);
  if (!validation.isValid) {
    return res.status(400).json({ errors: validation.errors });
  }

  try {
    const { email, password } = req.body;

    const snapshot = await db.ref("UserDataBase").orderByChild("email").equalTo(email).once("value");
    const userDataKey = snapshot.exists() ? Object.keys(snapshot.val())[0] : null;
    const userData = snapshot.exists() ? Object.values(snapshot.val())[0] : null;

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, userData.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ _id: userDataKey }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ _id: userDataKey }, process.env.JWT_SECRET, { expiresIn: "1y" });

    await db.ref(`UserDataBase/${userDataKey}`).update({ refreshToken });

    res.status(200).json({ token, user: userData, refreshToken });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




module.exports.sendOtp = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const message = `Your Verification Code is ${otp}`;

    await userService.createUserWithNo({ phoneNo, otp });
    console.log(`User created with OTP: ${otp}, PhoneNo: ${phoneNo}`);

    await TwilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phoneNo}`,
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in sendOtp:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again later." });
  }
};


function sendDynamicOtpMessage(otp, userName) {
  const currentHour = new Date().getHours();
  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
      greeting = "Good Morning";
  } else if (currentHour >= 12 && currentHour < 17) {
      greeting = "Good Afternoon";
  } else if (currentHour >= 17 && currentHour < 21) {
      greeting = "Good Evening";
  } else {
      greeting = "Hello"; 
  }

  const message = `${greeting}, Your verification code is ${otp}. 
Please use this code to complete your verification process.`;

  return message;
}



module.exports.sendWhatsAppOtp = async (req, res) => {
  try {
    const { phoneNo } = req.body;

    if (!phoneNo) {
      return res.status(400).json({ message: "Phone number is required." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const message = sendDynamicOtpMessage(otp, "User");

    await userService.createUserWithNo({ phoneNo, otp });
    console.log(`User created with OTP: ${otp}, PhoneNo: ${phoneNo}`);

    const formattedNumber = `91${phoneNo}@c.us`;
    await client.sendMessage(formattedNumber, message);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending WhatsApp OTP:", error);
    res.status(500).json({ message: "Failed to send WhatsApp OTP." });
  }
};

module.exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNo, email, otp } = req.body;

    if (!otp || (!phoneNo && !email)) {
      return res.status(400).json({ message: "OTP and either phone number or email are required." });
    }

    let snapshot;
    let userKey;

    if (phoneNo) {
      snapshot = await userRef
        .orderByChild("phoneNo")
        .equalTo(phoneNo)
        .once("value");
    } else if (email) {
      snapshot = await userRef
        .orderByChild("email")
        .equalTo(email)
        .once("value");
    }

    if (!snapshot.exists()) {
      return res.status(400).json({ message: "Invalid OTP or credentials." });
    }

    userKey = Object.keys(snapshot.val())[0]; 
    const userData = snapshot.val()[userKey];

    if (userData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const token = jwt.sign({ userId: userKey }, process.env.JWT_SECRET, {
      expiresIn: "1h", 
    });

    const refreshToken = jwt.sign({ userId: userKey }, process.env.JWT_SECRET, {
      expiresIn: "1y", 
    });

    await db.ref(`UserDataBase/${userKey}`).update({ refreshToken });

    console.log(`OTP Verified: ${otp}, PhoneNo/Email: ${phoneNo || email}`);
    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      refreshToken,
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error);
    res.status(500).json({ message: "Failed to verify OTP. Please try again later." });
  }
};



module.exports.getUserProfile = async (req, res) => {
  try {
    const { email, phoneNumber } = req.body; 
    console.log("Email:", email, "Phone Number:", phoneNumber);

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "User email or phone number is required." });
    }

    let userData = null;

    if (email) {
      const emailSnapshot = await db.ref("UserDataBase").orderByChild("email").equalTo(email).once("value");
      userData = emailSnapshot.exists() ? Object.values(emailSnapshot.val())[0] : null;
    }

    if (!userData && phoneNumber) {
      const phoneSnapshot = await db.ref("UserDataBase").orderByChild("phoneNumber").equalTo(phoneNumber).once("value");
      userData = phoneSnapshot.exists() ? Object.values(phoneSnapshot.val())[0] : null;
    }

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile. Please try again later." });
  }
};