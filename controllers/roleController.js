const { Op } = require("sequelize");
const { Role, Permission, RolePermission, Hotel } = require("../models/db");

const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({});
    res.send(roles);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch roles" });
  }
};

const getRoleById = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch role" });
  }
};

const createRole = async (req, res) => {
  try {
    const { name, hotelId, permissionIds } = req.body;

    const existingRole = await Role.findOne({
      where: {
        [Op.and]: [{ name: name }, { hotelId: hotelId }],
      },
    });

    if (existingRole)
      return res
        .status(400)
        .send({ status: 400, message: "Role already exists" });

    const createdRole = await Role.create({ name, hotelId });

    const permissions = await Permission.findAll({
      where: { id: permissionIds },
    });

    const rolePermissions = permissions.map((permission) => ({
      RoleId: createdRole.id,
      PermissionId: permission.id,
    }));

    await RolePermission.bulkCreate(rolePermissions);

    res.status(201).send(createdRole); // Send the created role as the response
  } catch (error) {
    console.error("Error creating role:", error);
    res
      .status(500)
      .send({ status: 500, message: "Internal server error " + error });
  }
};

const getRolesByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const role = await Role.findAll({
      where: { hotelId: hotelId },
      include: {
        model: Hotel,
      },
    });

    if (role.length > 0) {
      res.json(role);
    } else {
      res.status(404).json({
        status: 404,
        message: "roles not found for this hotel",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch roles: " + error });
  }
};

// const createRole = async (req, res) => {
//   const { name, hotelId } = req.body;
//   try {
//     const existingRole = await Role.findOne({
//       where: { name: name },
//     });

//     if (existingRole) {
//       return res.status(409).json({
//         status: 409,
//         message: "Role with the same name already exists",
//       });
//     }

//     const newRole = await Role.create({
//       name,
//       hotelId,
//     });
//     res.status(201).json(newRole);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ state: 500, message: "Failed to create role " + error });
//   }
// };

const updateRole = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const role = await Role.findByPk(id);
    if (role) {
      await role.update({
        name,
        // Add other fields as needed
      });
      res.json({ message: "Role updated successfully" });
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
};

const deleteRole = async (req, res) => {
  const { id } = req.params;
  try {
    const role = await Role.findByPk(id);
    if (role) {
      await role.destroy();
      res.json({ message: "Role deleted successfully" });
    } else {
      res.status(404).json({ error: "Role not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role" });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolesByHotel,
};
