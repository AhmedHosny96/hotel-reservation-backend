const router = require("express").Router();
const reservationController = require("../controllers/reservationController");

// Define routes for roles
router.get("/", reservationController.getAllReservations);
router.get("/hotel/:hotelId", reservationController.getReservationsByHotel);
router.get("/:id", reservationController.getReservationById);
router.put("/discount/:id", reservationController.applyDiscount);
router.post("/", reservationController.createReservation);
router.put("/:id", reservationController.updateReservation);
router.delete("/:id", reservationController.deleteReservation);
router.put("/checkout/:id", reservationController.checkOutReservation);

module.exports = router;
