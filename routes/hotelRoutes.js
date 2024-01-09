const hotelController = require("../controllers/hotelController");
const { verifyToken } = require("../utils/auth");

const router = require("express").Router();

// Define routes for hotels
router.get("/", verifyToken, hotelController.getAllHotels);
router.get("/:id", verifyToken, hotelController.getHotelById);
router.post("/", hotelController.createHotel);
router.put("/:id", verifyToken, hotelController.updateHotel);
router.delete("/:id", verifyToken, hotelController.deleteHotel);

module.exports = router;
