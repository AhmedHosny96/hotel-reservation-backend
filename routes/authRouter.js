const authController = require("../controllers/authController");

const router = require("express").Router();

// Define routes for hotels
router.post("/user", authController.createUser);
router.post("/auth/otp", authController.generateOTP);
router.post("/auth", authController.loginWithOtp);
router.put("/change-password/:id", authController.changePassword);

module.exports = router;
