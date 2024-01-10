const { Activity, User, Role } = require("../models/db");

const getAllActivities = async (req, res) => {
  try {
    const allActivities = await Activity.findAll({
      order: [["id", "DESC"]], // Order by 'createdAt' in descending order
    });
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
      order: [["id", "DESC"]], // Order by 'createdAt' in descending order
      raw: true,
    });
    res.status(200).json(userActivities);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
const getActivityByEmail = async (req, res) => {
  const { userId } = req.params;
  try {
    const userActivities = await Activity.findAll({
      where: { userId },
      include: User,
      order: [["id", "DESC"]], // Order by 'createdAt' in descending order
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
        include: Role,
      },
      order: [["createdAt", "DESC"]], // Order by 'createdAt' in descending order
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
