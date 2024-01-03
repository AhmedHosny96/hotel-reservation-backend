const permissionController = require("../controllers/permissionController");

const router = require("express").Router();

// Define routes for hotels
router.get("/", permissionController.getAllPermissions);
router.get("/:id", permissionController.getPermissionById);
router.post("/", permissionController.createPermission);
router.put("/:id", permissionController.updatePermission);
router.delete("/:id", permissionController.deletePermission);

module.exports = router;
