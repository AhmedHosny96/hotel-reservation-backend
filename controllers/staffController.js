const { Staff } = require("../models/db"); // Path to your Staff model
const { createActivityLog } = require("../utils/activityLog");

// Get all staff
const getAllStaff = async (req, res) => {
  try {
    const allStaff = await Staff.findAll();

    res.status(200).json(allStaff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single staff member by ID
const getStaffById = async (req, res) => {
  const { id } = req.params;
  try {
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStaffByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const staff = await Staff.findAll({
      where: { hotelId },
      // include: {
      //   model: Hotel,
      // },
      raw: true,
    });

    if (staff.length > 0) {
      //   const userId = req.user.userId;
      const { userId, client } = req.user;

      const action = "View All Employees";
      const details = "User viewed all staff members";

      await createActivityLog(userId, client, action, details);

      res.json(staff); // Send response after activity log creation
    } else {
      res.status(404).json({
        status: 404,
        message: "Staff not found for this hotel",
      });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

// Create a new staff member
const createStaff = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    salary,
    role,
    contactPerson,
    contactPersonPhone,
    address,
    contactAddress,
    hotelId,
  } = req.body;

  // Check if the provided phone number matches the expected format
  //   const phoneRegex = /^\d{12}$/;
  //   if (!phoneRegex.test(phone)) {
  //     return res
  //       .status(400)
  //       .json({ status: 400, message: "Invalid phone number format" });
  //   }

  try {
    // Check if the contact person's phone number already exists in the database
    const existingStaff = await Staff.findOne({
      where: { phone },
    });
    if (existingStaff) {
      return res.status(400).json({
        status: 400,
        message: "Staff with phone number exists",
      });
    }
    const existingContact = await Staff.findOne({
      where: { contactPersonPhone },
    });
    if (existingContact) {
      return res.status(400).json({
        status: 400,
        message: "Contact phone number exists",
      });
    }

    // If the contact person's phone number exists, proceed to create the staff record
    const newStaff = await Staff.create({
      fullName,
      email,
      phone,
      salary,
      role,
      contactPerson,
      contactPersonPhone,
      address,
      contactAddress,
      hotelId,
    });
    const { userId, client } = req.user;

    const action = "Created new Employee";
    const details = `Created employee : ${newStaff}`;

    await createActivityLog(userId, client, action, details);

    res.status(201).json(newStaff);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

// Update a staff member's details
const updateStaff = async (req, res) => {
  const { id } = req.params;
  const updatedDetails = req.body;
  try {
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res
        .status(404)
        .json({ status: 404, message: "Staff member not found" });
    }
    await Staff.update(updatedDetails, { where: { id } });
    const updatedStaff = await Staff.findByPk(id);

    const { userId, client } = req.user;

    const action = `Updated Employee record`;
    const details = `Affected staff : ${updateStaff.phone}`;

    await createActivityLog(userId, client, action, details);

    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

// Delete a staff member
const deleteStaff = async (req, res) => {
  const { id } = req.params;
  try {
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res
        .status(404)
        .json({ status: 404, message: "Staff member not found" });
    }
    await Staff.destroy({ where: { id } });

    const { userId, client } = req.user;

    const action = `Deleted Employee record`;
    const details = `Affected staff : ${staff.phone}`;

    await createActivityLog(userId, client, action, details);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByHotel,
};
