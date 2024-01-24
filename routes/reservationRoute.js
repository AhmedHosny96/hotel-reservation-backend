const router = require("express").Router();
const reservationController = require("../controllers/reservationController");

const { fetchDataAndSendReport } = require("../AutomaticReports");

const { verifyToken } = require("../utils/auth");

// Define routes for roles
router.get("/", verifyToken, reservationController.getAllReservations);
router.get(
  "/hotel",
  // verifyToken,
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

router.get("/hotel/reports", reservationController.getReservationsLast24Hours);

// 0997

module.exports = router;
