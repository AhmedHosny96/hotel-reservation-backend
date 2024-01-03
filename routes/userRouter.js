const router = require("express").Router();
const userController = require("../controllers/userController");

const { verifyToken } = require("../utils/auth");

// Define routes for rooms
router.get("/", userController.getAllUsers);
router.get("/hotel/:hotelId", userController.getUsersByHotel);
router.get("/:id", userController.getUserById);
// router.post("/", userController.createRoom);
// router.put("/:id", userController.updateRoom);
// router.delete("/:id", userController.deleteRoom);

module.exports = router;
