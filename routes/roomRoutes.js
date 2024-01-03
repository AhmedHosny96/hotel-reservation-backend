const router = require("express").Router();
const roomController = require("../controllers/roomController");

const { verifyToken } = require("../utils/auth");

// Define routes for rooms
router.get("/", roomController.getAllRooms);
router.get("/hotel/", roomController.getAvailableRoomsByHotel);
router.get("/hotel/:hotelId", roomController.getRoomsByHotel);
router.get("/:id", roomController.getRoomById);
router.post("/", roomController.createRoom);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

module.exports = router;
