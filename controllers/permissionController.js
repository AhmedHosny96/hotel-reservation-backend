const { Permission } = require("../models/db");

const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({});
    res.send(permissions);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch permissions" });
  }
};

const getPermissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Permission.findByPk(id);
    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ status: 404, message: "permission not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch permission" });
  }
};

const createPermission = async (req, res) => {
  const { name, hotelId } = req.body;
  try {
    const existingPermission = await Permission.findOne({
      where: { name: name },
    });

    if (existingPermission) {
      return res.status(409).json({
        status: 409,
        message: "Permission with the same name already exists",
      });
    }

    const newPermission = await Permission.create({
      name,
      hotelId,
    });
    res.status(201).json(newPermission);
  } catch (error) {
    res
      .status(500)
      .json({ state: 500, message: "Failed to create permission " + error });
  }
};

const updatePermission = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const permission = await Permission.findByPk(id);
    if (permission) {
      await permission.update({
        name,
        // Add other fields as needed
      });
      res.json({ message: "Permission updated successfully" });
    } else {
      res.status(404).json({ error: "Permission not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update Permission" });
  }
};

const deletePermission = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Permission.findByPk(id);
    if (role) {
      await role.destroy();
      res.json({ message: "role deleted successfully" });
    } else {
      res.status(404).json({ error: "role not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role" });
  }
};

module.exports = {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
};
