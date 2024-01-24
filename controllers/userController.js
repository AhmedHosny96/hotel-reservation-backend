const { Op } = require("sequelize");
const { Hotel, User, Role } = require("../models/db"); // Adjust the path as needed based on your file structure
const { createActivityLog } = require("../utils/activityLog");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Hotel,
        Role,
      },
    });
    res.send(users);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch users" + error });
  }
};

const getUsersByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const user = await User.findAll({
      where: { hotelId: hotelId },
      include: [
        { model: Hotel },
        { model: Role },
        // Add more associations if needed
      ],
      raw: true,
    });

    if (user.length > 0) {
      res.json(user);
    } else {
      res
        .status(404)
        .json({ status: 404, message: "user not found for this hotel" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch user: " + error });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
      include: {
        model: Role,
      },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ status: 404, message: "user not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch user" + error.message });
  }
};

const getUserByEmail = async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
      },
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ status: 404, message: "user not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch user" + error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, phone, status, roleId } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Check for existing users with the same userNumber excluding the current user being updated
    const existingUser = await User.findOne({
      where: {
        email,
        id: { [Op.not]: id }, // Exclude the current user being updated
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ status: 400, message: "User with details already exists" });
    }

    // Update the user
    await user.update({
      email,
      phone,
      status,
      roleId,
    });

    const { userId, client } = req.user;

    const action = `Update User`;
    const details = `User updated userId ${user.email}`;

    //Log(userId, client, action, details);
    res.json({ status: 200, message: "user updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to update room" + error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUsersByHotel,
  getUserByEmail,
  updateUser,
};
