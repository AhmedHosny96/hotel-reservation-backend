const router = require("express").Router();
const userController = require("../controllers/userController");

const { verifyToken } = require("../utils/auth");

// Define routes for rooms
router.get("/", verifyToken, userController.getAllUsers);
router.get("/hotel/:hotelId", verifyToken, userController.getUsersByHotel);
router.get("/:id", verifyToken, userController.getUserById);
// router.post("/", userController.createRoom);
// router.put("/:id", userController.updateRoom);
// router.delete("/:id", userController.deleteRoom);

module.exports = router;
