const router = require("express").Router();
const reservationReport = require("../../controllers/reports/reservationReports");

router.get("/bookings", reservationReport.getReservationReport);

module.exports = router;
