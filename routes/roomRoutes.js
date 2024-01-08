const router = require("express").Router();
const roomController = require("../controllers/roomController");

const { verifyToken } = require("../utils/auth");

// Define routes for rooms
router.get("/", verifyToken, roomController.getAllRooms);
router.get("/hotel/", verifyToken, roomController.getAvailableRoomsByHotel);
router.get("/hotel/:hotelId", verifyToken, roomController.getRoomsByHotel);
router.get("/:id", verifyToken, roomController.getRoomById);
router.post("/", verifyToken, roomController.createRoom);
router.put("/:id", verifyToken, roomController.updateRoom);
router.delete("/:id", verifyToken, roomController.deleteRoom);

module.exports = router;
