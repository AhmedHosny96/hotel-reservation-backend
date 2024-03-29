const fs = require("fs"); // For file system operations
const path = require("path"); // For working with file paths

const { Guest, Hotel, Reservation } = require("../models/db"); // Import the Guest model
const { upload } = require("../utils/upload");
const { Op } = require("sequelize");
const { createActivityLog } = require("../utils/activityLog");

const createGuest = async (req, res) => {
  const { fullName, gender, phone, hotelId } = req.body;

  // const photoID = req.file.path;

  try {
    // const existingGuest = await Guest.findOne({ where: { phone } });
    // if (existingGuest) {
    //   return res
    //     .status(409)
    //     .json({ status: 409, message: "Phone number already exists" });
    // }

    // const relativePhotoPath = path.relative("uploads", photoID);

    const newGuest = await Guest.create({
      fullName,
      gender,
      phone,
      hotelId,
      // Add other fields as needed
    });

    // const { userId, client } = ;
    // const action = `Create guest`;
    // const details = `User created guest : ${newGuest.id} `;
    // //Log(
    //   req?.user?.userId || null,
    //   req?.user?.client || null,
    //   action,
    //   details
    // );
    res.status(201).json(newGuest);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to create guest" + error.message });
  }
};

const getGuestById = async (req, res) => {
  const { id } = req.params;

  try {
    const guest = await Guest.findByPk(id);
    if (!guest) {
      return res.status(404).json({ status: 404, message: "Guest not found" });
    }
    const { userId, client } = req.user;
    const action = `View guest`;
    const details = `User viewed guest : ${guest.id} `;
    //Log(userId, client, action, details);
    res.status(200).json(guest);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to get guest" + error.message });
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
      const { userId, client } = req.user;
      const action = `View hotel guests`;
      const details = `User viewed hotel guests `;
      //Log(userId, client, action, details);
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

// todo available guests

const getAvailableGuests = async (req, res) => {
  const { hotelId, status } = req.query;

  try {
    const guests = await Guest.findAll({
      where: { hotelId },
      include: {
        model: Hotel,
      },
      raw: true,
    });

    if (guests.length > 0) {
      // Filter guests who are not checked in
      const notCheckedInGuests = await Promise.all(
        guests.map(async (guest) => {
          const reservations = await Reservation.findAll({
            where: {
              guestId: guest.id,
              status: { [Op.ne]: status }, // Guest status is not equal to the specified status
            },
          });
          return reservations.length === 0 ? guest : null;
        })
      );

      // Remove null values from the array
      const filteredGuests = notCheckedInGuests.filter(
        (guest) => guest !== null
      );

      if (filteredGuests.length > 0) {
        res.json(filteredGuests);
      } else {
        res.status(404).json({
          status: 404,
          message: "No guests found who are not checked in for this hotel.",
        });
      }
    } else {
      res.status(404).json({
        status: 404,
        message: "Guests not found for this hotel.",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to fetch guests: " + error });
  }
};

// const getAvailableGuests = async (req, res) => {
//   const { hotelId } = req.query;

//   const { userId, client } = req.user;
//   const action = `View hotel available guests`;
//   const details = `User viewed available guests `;
//   //Log(userId, client, action, details);

//   try {
//     const allGuests = await Guest.findAll({
//       where: { hotelId },
//       include: [
//         {
//           model: Reservation,
//           required: false, // Fetch guests even if they don't have reservations
//         },
//       ],
//       raw: true,
//     });

//     const guestsWithoutReservations = allGuests.filter((guest) => {
//       return guest.Reservations.length === 0; // Filter guests with no reservations
//     });

//     if (guestsWithoutReservations.length > 0) {
//       res.json(guestsWithoutReservations);
//     } else {
//       res.status(404).json({
//         status: 404,
//         message: "No guests without reservations found for this hotel",
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       status: 500,
//       message: "Failed to fetch guests without reservations: " + error,
//     });
//   }
// };

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

    const { userId, client } = req.user;
    const action = `Update guest`;
    const details = `User updated guest : ${guest.id} `;
    //Log(userId, client, action, details);

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

    const { userId, client } = req.user;
    const action = `Delete guest`;
    const details = `User deleted guest : ${guest.id}`;
    //Log(userId, client, action, details);
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

    const { userId, client } = req.user;
    const action = `View all guests`;
    const details = `User viewed all guests `;
    //Log(userId, client, action, details);
    res.status(200).json(guests);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to get guests", error });
  }
};

const getLast24Guests = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

    const reservations = await Guest.findAll({
      where: {
        createdAt: {
          [Op.gte]: twentyFourHoursAgo,
        },
        hotelId: req.params.hotelId,
      },
    });

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to get reservations in the last 24 hours",
      error,
    });
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
  getAvailableGuests,
  getLast24Guests,
};
