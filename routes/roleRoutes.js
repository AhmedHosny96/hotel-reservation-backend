const router = require("express").Router();
const roleController = require("../controllers/roleController");

// Define routes for roles
router.get("/", roleController.getAllRoles);
router.get("/hotel/:hotelId", roleController.getRolesByHotel);
router.get("/:id", roleController.getRoleById);
router.post("/", roleController.createRole);
router.put("/:id", roleController.updateRole);
router.delete("/:id", roleController.deleteRole);

module.exports = router;
