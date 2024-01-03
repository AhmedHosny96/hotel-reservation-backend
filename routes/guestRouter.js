const guestController = require("../controllers/guestController");

const router = require("express").Router();
const { upload } = require("../utils/upload");

// Define routes for hotels
router.get("/", guestController.getAllGuests);
router.get("/hotel/:hotelId", guestController.getGuestsByHotel);
router.get("/:id", guestController.getGuestById);
router.post("/", upload.single("photoID"), guestController.createGuest);
router.put("/:id", guestController.updateGuest);
router.delete("/:id", guestController.deleteGuest);
router.get("/hotel/:hotelId/guests", guestController.getUnReservedGuests);

module.exports = router;
