// authMiddleware.js
const jwt = require("jsonwebtoken");

const { OTP } = require("../models/db");
const { Op } = require("sequelize");

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ status: 401, message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.jwtSecret); // Verify JWT token with your secret key
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ status: 401, message: "Invalid token" });
  }
};

const createOTP = async (otp, userId, hotelId) => {
  try {
    // Create an activity log record
    await OTP.create({
      otp,
      userId,
      hotelId,
    });
  } catch (error) {
    // Handle error or log it as needed
    console.error("Error creating OTP :", error.message);
    // You can throw the error to propagate it further or handle it differently
    throw error;
  }
};

// const deleteExpiredOTPRecords = async () => {
//   try {
//     // Find expired OTP records
//     const expiredRecords = await OTP.findAll({
//       where: {
//         expiresAt: {
//           [Op.lt]: new Date(), // Find records where expiresAt is less than the current time
//         },
//       },
//     });

//     // Delete the expired OTP records
//     await OTP.destroy({
//       where: {
//         expiresAt: {
//           [Op.lt]: new Date(), // Find records where expiresAt is less than the current time
//         },
//       },
//     });

//     console.log(`${expiredRecords.length} expired OTP records deleted.`);
//   } catch (error) {
//     console.error("Error deleting expired OTP records:", error);
//   }
// };

// // Schedule the job to run every minute (adjust as needed)
// setInterval(deleteExpiredOTPRecords, 60 * 1000);

module.exports = { verifyToken, createOTP };
