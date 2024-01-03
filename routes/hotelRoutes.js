const hotelController = require("../controllers/hotelController");

const router = require("express").Router();

// Define routes for hotels
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);
router.post("/", hotelController.createHotel);
router.put("/:id", hotelController.updateHotel);
router.delete("/:id", hotelController.deleteHotel);

module.exports = router;
