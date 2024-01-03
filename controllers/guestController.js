const fs = require("fs"); // For file system operations
const path = require("path"); // For working with file paths

const { Guest, Hotel, Reservation } = require("../models/db"); // Import the Guest model
const { upload } = require("../utils/upload");

const createGuest = async (req, res) => {
  const { fullName, gender, phone, hotelId } = req.body;

  const photoID = req.file.path;

  try {
    const existingGuest = await Guest.findOne({ where: { phone } });
    if (existingGuest) {
      return res
        .status(409)
        .json({ status: 409, message: "Phone number already exists" });
    }

    const relativePhotoPath = path.relative("uploads", photoID);

    const newGuest = await Guest.create({
      fullName,
      gender,
      phone,
      hotelId,
      photoID: relativePhotoPath,
      // Add other fields as needed
    });

    res.status(201).json(newGuest);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to create guest", error });
  }
};

const getGuestById = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ status: 404, message: "Guest not found" });
    }
    res.status(200).json(guest);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to get guest", error });
  }
};

const getGuestsByHotel = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const guest = await Guest.findAll({
      where: { hotelId: hotelId },
      include: {
        model: Hotel,
      },
      raw: true,
    });

    if (guest.length > 0) {
      res.json(guest);
    } else {
      res.status(404).json({
        status: 404,
        message: "guests not found for this hotel",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch guests: " + error });
  }
};

const getUnReservedGuests = async (req, res) => {
  const { hotelId } = req.params;
  try {
    const guests = await Guest.findAll({
      where: { hotelId },
      include: [
        {
          model: Reservation,
          where: { guestId: null }, // To find guests without reservations
          required: false, // Ensures it's a left join to retrieve guests without reservations
        },
        {
          model: Hotel,
        },
      ],
      order: [["id", "DESC"]], // Order by ID in descending order
      raw: true,
    });

    if (guests.length > 0) {
      res.json(guests);
    } else {
      res.status(404).json({
        status: 404,
        message: "No guests without reservations found for this hotel",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch guests: " + error });
  }
};

const updateGuest = async (req, res) => {
  const { id } = req.params;
  const { fullName, gender, phone, hotelId } = req.body;

  try {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ status: 404, message: "Guest not found" });
    }

    // Update the guest fields
    await guest.update({
      fullName,
      gender,
      phone,
      hotelId,
      // Add other fields as needed
    });

    res.status(200).json(guest);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to update guest", error });
  }
};

const deleteGuest = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ status: 404, message: "Guest not found" });
    }

    await guest.destroy();
    res.status(204).end(); // No content in response for successful deletion
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to delete guest", error });
  }
};

const getAllGuests = async (req, res) => {
  try {
    const guests = await Guest.findAll();
    res.status(200).json(guests);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to get guests", error });
  }
};

module.exports = {
  createGuest,
  getGuestById,
  updateGuest,
  deleteGuest,
  getAllGuests,
  getGuestsByHotel,
  getUnReservedGuests,
};
