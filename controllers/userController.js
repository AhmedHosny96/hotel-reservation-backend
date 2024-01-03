const { Hotel, User, Role } = require("../models/db"); // Adjust the path as needed based on your file structure

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
    res.status(500).json({ status: 500, message: "Failed to fetch users" });
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
    const user = await User.findByPk({
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
    res.status(500).json({ status: 500, message: "Failed to fetch user" });
  }
};

module.exports = { getAllUsers, getUserById, getUsersByHotel };
