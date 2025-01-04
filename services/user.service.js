const userModel = require('../models/user.model');
const phoneVerificationModel = require('../models/phoneVerification.model');

module.exports.createUser = async ({ firstname, lastname, email, password }) => {
    if (!firstname || !email || !password) {
        throw new Error('All fields are required');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        throw new Error('Invalid email format');
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new Error('A user with this email already exists');
    }

    const user = await userModel.create({
        fullname: { firstname, lastname },
        email,
        password,
    });

    return user;
};

module.exports.createUserWithNo = async ({ phoneNo, otp }) => {
    if (!phoneNo || !otp) {
        throw new Error('All fields are required');
    }

    const existingUserWithNo = await phoneVerificationModel.findOne({ phoneNo });
    if (existingUserWithNo) {
        await phoneVerificationModel.deleteOne({ phoneNo });
    }

    const userWithNo = await phoneVerificationModel.create({
        phoneNo,
        otp,
    });

    return userWithNo;
};


module.exports.verifyOtp = async (phoneNo, otp) => {
    if (!phoneNo || !otp) {
        throw new Error('All fields are required');
    }

    const existingUserWithNo = await phoneVerificationModel.findOne({ phoneNo, otp});

    return existingUserWithNo;
}