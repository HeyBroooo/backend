// const bcrypt = require("bcrypt");

// const plainTextPassword = "testmebro"; // Replace with the user-entered password
// const hashedPasswordFromDB = "$2b$10$JlJzHDMrPNKQWDhkrRh5JOw2XKa/dEJF1walkvSQLufb.u6zCamcm"; // From your DB

// // Generate a hash of the plain text password for comparison
// const saltRounds = 10;
// bcrypt.hash(plainTextPassword, saltRounds, (err, newHash) => {
//     if (err) return console.error("Hashing error:", err);

//     console.log("Generated hash for comparison:", newHash);

//     bcrypt.compare(plainTextPassword, hashedPasswordFromDB, (err, result) => {
//         if (err) return console.error("Error in comparison:", err);

//         console.log("Do passwords match?", result);
//     });
// });


// function sendDynamicOtpMessage(otp, userName) {
//   const currentHour = new Date().getHours();
//   let greeting;

//   // Determine the time of day to create a greeting
//   if (currentHour >= 5 && currentHour < 12) {
//       greeting = "Good Morning";
//   } else if (currentHour >= 12 && currentHour < 17) {
//       greeting = "Good Afternoon";
//   } else if (currentHour >= 17 && currentHour < 21) {
//       greeting = "Good Evening";
//   } else {
//       greeting = "Hello"; // Late night or fallback
//   }

//   // Compose the message dynamically
//   const message = `${greeting}, Your verification code is ${otp}. 
// Please use this code to complete your verification process.`;

//   return message;
// }

// const dynamicMessage = sendDynamicOtpMessage(otp = "4049", userName="mohit");
// console.log(dynamicMessage);