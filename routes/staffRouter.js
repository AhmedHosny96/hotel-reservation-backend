const router = require("express").Router();
const staffController = require("../controllers/staffController");
const { verifyToken } = require("../utils/auth");
const { upload } = require("../utils/upload");

// Define routes for roles
router.get("/", verifyToken, staffController.getAllStaff);
router.get("/hotel/:hotelId", verifyToken, staffController.getStaffByHotel);
router.get("/:id", verifyToken, staffController.getStaffById);
router.post("/", verifyToken, staffController.createStaff);
router.put("/:id", verifyToken, staffController.updateStaff);
router.delete("/:id", verifyToken, staffController.deleteStaff);

module.exports = router;
