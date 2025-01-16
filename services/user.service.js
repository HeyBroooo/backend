const bcrypt = require("bcrypt");
const { db } = require("../db/db");

const userRef = db.ref("UserDataBase"); // Reference to the Firebase database for user data

// Helper to validate email format
const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

// Create User (Email-based Registration)
module.exports.createUser = async ({ firstname, lastname, email, password }) => {
    if (!firstname || !email || !password) {
        throw new Error("All fields are required");
    }

    if (!validateEmail(email)) {
        throw new Error("Invalid email format");
    }

    // Check if the user already exists
    const snapshot = await userRef.orderByChild("email").equalTo(email).once("value");
    if (snapshot.exists()) {
        throw new Error("A user with this email already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const newUserRef = userRef.push();
    await newUserRef.set({
        fullname: { firstname, lastname },
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        type: "email", // To identify email-based users
    });

    return { userId: newUserRef.key, firstname, lastname, email };
};

// Create User (Phone-based Registration)
module.exports.createUserWithNo = async ({ phoneNo, otp }) => {
    if (!phoneNo || !otp) {
        throw new Error("All fields are required");
    }

    // Check if the user already exists
    const snapshot = await userRef.orderByChild("phoneNo").equalTo(phoneNo).once("value");
    if (snapshot.exists()) {
        throw new Error("A user with this phone number already exists");
    }

    // Create the phone-based user
    const newUserRef = userRef.push();
    await newUserRef.set({
        phoneNo,
        otp,
        createdAt: new Date().toISOString(),
        type: "phone", // To identify phone-based users
    });

    return { userId: newUserRef.key, phoneNo };
};

// Verify User (Phone Number with OTP or Email with Password)
module.exports.verifyUser = async ({ phoneNo, otp, email, password }) => {
    if ((!phoneNo || !otp) && (!email || !password)) {
        throw new Error("Provide either phone number with OTP or email with password");
    }

    let snapshot;

    if (phoneNo && otp) {
        // Verify phone number with OTP
        snapshot = await userRef.orderByChild("phoneNo").equalTo(phoneNo).once("value");

        if (!snapshot.exists()) {
            throw new Error("Phone number not found");
        }

        const userData = Object.values(snapshot.val())[0];
        if (userData.otp !== otp) {
            throw new Error("Invalid OTP");
        }
    } else if (email && password) {
        // Verify email with password
        snapshot = await userRef.orderByChild("email").equalTo(email).once("value");

        if (!snapshot.exists()) {
            throw new Error("Email not found");
        }

        const userData = Object.values(snapshot.val())[0];
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            throw new Error("Invalid password");
        }
    }

    return { userId: Object.keys(snapshot.val())[0] };
};

// Get User Profile
// module.exports.getUserProfile = async (req, res) => {
//     try {
//         const { email, phoneNumber } = req.body;

//         if (!email && !phoneNumber) {
//             return res.status(400).json({ message: "User email or phone number is required." });
//         }

//         // Query the database using email or phone number to find the user
//         const snapshot = await db.ref('UserDataBase').orderByChild('email').equalTo(email).once('value');

//         let userData = snapshot.exists() ? Object.values(snapshot.val())[0] : null;

//         if (!userData && phoneNumber) {
//             // If no user found by email, try by phone number
//             const phoneSnapshot = await db.ref('UserDataBase').orderByChild('phoneNumber').equalTo(phoneNumber).once('value');
//             userData = phoneSnapshot.exists() ? Object.values(phoneSnapshot.val())[0] : null;
//         }

//         if (!userData) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         // Return the user profile data
//         res.status(200).json(userData);
//     } catch (error) {
//         console.error("Error fetching user profile:", error);
//         res.status(500).json({ message: "Failed to fetch user profile. Please try again later." });
//     }
// };

// userService.js (Example service methods)

module.exports.getUserByEmail = async (email) => {
    // Replace this with your actual Firebase or DB query logic
    const snapshot = await userRef.orderByChild("email").equalTo(email).once("value");
    if (snapshot.exists()) {
      return snapshot.val();  // Assuming Firebase stores the user data this way
    }
    return null;
  };
  
  module.exports.getUserByPhoneNumber = async (phoneNumber) => {
    // Replace this with your actual Firebase or DB query logic
    const snapshot = await userRef.orderByChild("phoneNumber").equalTo(phoneNumber).once("value");
    if (snapshot.exists()) {
      return snapshot.val();  // Assuming Firebase stores the user data this way
    }
    return null;
  };
  
