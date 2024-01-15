const router = require("express").Router();
const roleController = require("../controllers/roleController");
const { verifyToken } = require("../utils/auth");

// Define routes for roles
router.get("/", verifyToken, roleController.getAllRoles);
router.get("/hotel/:hotelId", verifyToken, roleController.getRolesByHotel);
router.get("/:id", verifyToken, roleController.getRoleById);
router.post("/", verifyToken, roleController.createRole);
router.put("/:id", verifyToken, roleController.updateRole);
router.delete("/:id", verifyToken, roleController.deleteRole);

module.exports = router;
