const activityController = require("../controllers/activityController");

const router = require("express").Router();

// Define routes for hotels
router.get("/", activityController.getAllActivities);
router.get("/hotel/:hotelId", activityController.getActivitiesByHotel);
router.get("/user/:userId", activityController.getActivitiesByUser);

module.exports = router;
