const guestController = require("../controllers/guestController");
const { verifyToken } = require("../utils/auth");

const router = require("express").Router();
const { upload } = require("../utils/upload");

// Define routes for hotels
router.get("/", verifyToken, guestController.getAllGuests);
router.get("/hotel", verifyToken, guestController.getAvailableGuests);
router.get("/hotel/:hotelId", verifyToken, guestController.getGuestsByHotel);
router.get("/:id", verifyToken, guestController.getGuestById);
router.post(
  "/",
  // verifyToken,
  // upload.single("photoID"),
  guestController.createGuest
);
router.put("/:id", verifyToken, guestController.updateGuest);
router.delete("/:id", verifyToken, guestController.deleteGuest);
router.get(
  "/hotel/:hotelId/guests",
  verifyToken,
  guestController.getUnReservedGuests
);

// todo reports
router.get("/report/:hotelId", guestController.getLast24Guests);

module.exports = router;
