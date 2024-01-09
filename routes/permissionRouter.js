const permissionController = require("../controllers/permissionController");
const { verifyToken } = require("../utils/auth");

const router = require("express").Router();

// Define routes for hotels
router.get("/", verifyToken, permissionController.getAllPermissions);
router.get("/:id", verifyToken, permissionController.getPermissionById);
router.post("/", permissionController.createPermission);
router.put("/:id", verifyToken, permissionController.updatePermission);
router.delete("/:id", verifyToken, permissionController.deletePermission);

module.exports = router;
