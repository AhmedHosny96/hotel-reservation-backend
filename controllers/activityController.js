const { Activity, User, Role } = require("../models/db"); // Assuming your Activity model is appropriately defined

const getAllActivities = async (req, res) => {
  try {
    const allActivities = await Activity.findAll();
    res.status(200).json(allActivities);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

const getActivitiesByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userActivities = await Activity.findAll({
      where: { userId },
      include: User,
      raw: true,
    });
    res.status(200).json(userActivities);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

const getActivitiesByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const hotelActivities = await Activity.findAll({
      where: { hotelId },
      include: {
        model: User,
        include: Role, // Assuming 'roles' is the association alias in your User model
      },
      raw: true,
    });
    res.status(200).json(hotelActivities);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = {
  getAllActivities,
  getActivitiesByUser,
  getActivitiesByHotel,
};
