const router = require("express").Router();
const reservationController = require("../controllers/reservationController");
const { verifyToken } = require("../utils/auth");

// Define routes for roles
router.get("/", verifyToken, reservationController.getAllReservations);
router.get(
  "/hotel/:hotelId",
  verifyToken,
  reservationController.getReservationsByHotel
);
router.get("/:id", verifyToken, reservationController.getReservationById);
router.put("/discount/:id", verifyToken, reservationController.applyDiscount);
router.post("/", verifyToken, reservationController.createReservation);
router.put("/:id", verifyToken, reservationController.updateReservation);
router.delete("/:id", verifyToken, reservationController.deleteReservation);
router.put(
  "/checkout/:id",
  verifyToken,
  reservationController.checkOutReservation
);

module.exports = router;
