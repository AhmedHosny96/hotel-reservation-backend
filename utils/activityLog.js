const { Activity } = require("../models/db");

const createActivityLog = async (userId, hotelId, action, details) => {
  try {
    // Create an activity log record
    await Activity.create({
      action,
      details,
      userId,
      hotelId,
    });
  } catch (error) {
    // Handle error or log it as needed
    console.error("Error creating activity log:", error.message);
    // You can throw the error to propagate it further or handle it differently
    throw error;
  }
};
module.exports = { createActivityLog };
