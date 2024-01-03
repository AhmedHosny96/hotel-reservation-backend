const authController = require("../controllers/authController");

const router = require("express").Router();

// Define routes for hotels
router.post("/user", authController.createUser);
router.post("/auth", authController.login);
router.post("/change-password", authController.login);

module.exports = router;
