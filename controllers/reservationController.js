const { Op } = require("sequelize");
const {
  Reservation,
  Room,
  Hotel,
  Guest,
  Discount,
  sequelize,
} = require("../models/db"); // Import the Reservation model
const { createActivityLog } = require("../utils/activityLog");

// const createReservation = async (req, res) => {
//   const {
//     checkInDate,
//     checkOutDate,
//     paymentMode,
//     extraService,
//     extraServicePrice,
//     roomId,
//     hotelId,
//     guestId,
//   } = req.body;

//   try {
//     const room = await Room.findByPk(roomId);
//     if (!room) {
//       return res.status(404).json({ status: 404, message: "Room not found" });
//     }
//     const existingReservation = await Reservation.findOne({
//       where: {
//         guestId,
//         checkInDate: new Date(checkInDate),
//         status: "Checked in",
//       },
//     });

//     if (existingReservation) {
//       return res.status(400).json({
//         status: 400,
//         message: "Guest already checked in for the same date",
//       });
//     }

//     if (room.status !== "Available") {
//       return res
//         .status(400)
//         .json({ status: 400, message: "Room is not available for booking" });
//     }

//     const pricePerNight = room.pricePerNight; // Get price per night from the room

//     // Calculate duration of stay in milliseconds
//     const durationInMs = checkOutDate
//       ? new Date(checkOutDate) - new Date(checkInDate)
//       : 0;

//     const durationInDays = checkOutDate
//       ? durationInMs / (1000 * 60 * 60 * 24) // Convert to days
//       : 0;

//     const durationInDaysNumeric = parseFloat(durationInDays);
//     const pricePerNightNumeric = parseFloat(pricePerNight);
//     const extraServicePriceNumeric = parseFloat(extraServicePrice);

//     // Calculate total price including extra service
//     const totalPrice =
//       checkOutDate && durationInDaysNumeric
//         ? durationInDaysNumeric * pricePerNightNumeric +
//           extraServicePriceNumeric
//         : pricePerNightNumeric + extraServicePriceNumeric; // Default to price per night + extra service price if checkOutDate is unknown

//     const parsedCheckInDate = new Date(checkInDate);
//     const formattedCheckInDate = parsedCheckInDate.toISOString().split("T")[0];

//     const formattedCheckOutDate = checkOutDate
//       ? new Date(checkOutDate).toISOString().split("T")[0]
//       : null;

//     // Create the reservation
//     const newReservation = await Reservation.create({
//       checkInDate: formattedCheckInDate,
//       checkOutDate: formattedCheckOutDate,
//       totalPrice,
//       roomId,
//       paymentMode,
//       extraService,
//       extraServicePrice,
//       hotelId,
//       guestId,
//       paymentStatus: formattedCheckOutDate ? "Paid" : "Pending",
//       // Other reservation details...
//     });

//     await room.update({ status: "Booked" });

//     const { userId, client } = req.user;
//     const action = `Create reservation`;
//     const details = `Created reservation reservationId : ${newReservation.id}`;
//     //Log(userId, client, action, details);

//     res.status(201).json(newReservation);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ status: 500, message: "Failed to create reservation" + error });
//   }
// };

const createReservation = async (req, res) => {
  const {
    checkInDate,
    paymentMode,
    extraService,
    extraServicePrice,
    roomId,
    hotelId,
    guestId,
  } = req.body;

  try {
    const room = await Room.findByPk(roomId);
    if (!room) {
      return res.status(404).json({ status: 404, message: "Room not found" });
    }

    const existingReservation = await Reservation.findOne({
      where: {
        guestId,
        checkInDate: new Date(checkInDate),
        status: "Checked in",
      },
    });

    if (existingReservation) {
      return res.status(400).json({
        status: 400,
        message: "Guest already checked in for the same date",
      });
    }

    if (room.status !== "Available") {
      return res
        .status(400)
        .json({ status: 400, message: "Room is not available for booking" });
    }

    const pricePerNight = room.pricePerNight;

    const parsedCheckInDate = new Date(checkInDate);
    const formattedCheckInDate = parsedCheckInDate.toISOString().split("T")[0];

    // Calculate total price for the initial reservation
    const totalPrice = pricePerNight + parseFloat(extraServicePrice);

    // Create the initial reservation without a checkout date
    const newReservation = await Reservation.create({
      checkInDate: formattedCheckInDate,
      totalPrice,
      roomId,
      paymentMode,
      extraService,
      extraServicePrice,
      hotelId,
      guestId,
      paymentStatus: "Pending",
      // Other reservation details...
    });

    // Update the room status
    await room.update({ status: "Booked" });

    const { userId, client } = req.user;
    const action = "Create reservation";
    const details = `Created reservation reservationId: ${newReservation.id}`;
    // Log(userId, client, action, details);

    res.status(201).json(newReservation);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to create reservation: " + error });
  }
};

// todo : checkout feature
const checkOutReservation = async (req, res) => {
  const { id } = req.params;
  const { checkOutDate } = req.body;

  try {
    const reservation = await Reservation.findByPk(id, {
      include: [{ model: Room }],
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ status: 404, message: "Reservation not found" });
    }

    if (reservation.status !== "Checked in") {
      return res.status(400).json({
        status: 400,
        message: "Reservation is not checked in or already checked out",
      });
    }

    // Check if checkout date is set
    if (!checkOutDate) {
      return res.status(400).json({
        status: 400,
        message:
          "Checkout date is mandatory and must be set before checking out.",
      });
    }

    // Validate if checkOutDate is within an acceptable range (e.g., not in the past or too far in the future)
    const currentDateTime = new Date();
    const checkOutDateTime = new Date(checkOutDate);

    if (checkOutDateTime < currentDateTime) {
      return res.status(400).json({
        status: 400,
        message: "Checkout date cannot be set to a past date.",
      });
    }

    // You can define a maximum acceptable future date as needed
    const maxFutureDate = new Date();
    maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1); // Example: 1 year in the future

    if (checkOutDateTime > maxFutureDate) {
      return res.status(400).json({
        status: 400,
        message: "Checkout date cannot be set too far in the future.",
      });
    }

    if (reservation.paymentStatus !== "Paid") {
      return res.status(400).json({
        status: 400,
        message: "Please pay the pending amounts, then checkout",
      });
    }

    // Update reservation status to "Checked out"
    reservation.status = "Checked out";
    reservation.checkOutDate = checkOutDate;

    // Update room status to "Available"
    await reservation.save();
    await reservation.Room.update({ status: "Available" });

    const { userId, client } = req.user;
    const action = `Checkout reservation`;
    const details = `User checked out reservation : ${reservation.id}`;
    // Log(userId, client, action, details);

    res.status(200).json({
      status: 200,
      message: "Checkout successful",
      updatedReservation: reservation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to checkout" + error });
  }
};

const getReservationsByHotel = async (req, res) => {
  const { hotelId, createdAt, status } = req.query;

  try {
    const reservations = await Reservation.findAll({
      where: {
        hotelId: hotelId,
        createdAt: {
          [Op.gte]: new Date(`${createdAt}T00:00:00.000Z`), // Greater than or equal to the specified date
          [Op.lt]: new Date(`${createdAt}T23:59:59.999Z`), // Less than the next day
        },
        status: status,
      },
      include: [
        { model: Hotel },
        {
          model: Guest,
          // attributes: [
          //   ['fullName', 'guestName'], // Alias 'fullName' as 'guestName'
          //   ['phoneNumber', 'guestPhone'], // Alias 'phoneNumber' as 'guestPhone'
          // ],
        },
        { model: Room },
        { model: Discount },
      ],
      order: [["id", "DESC"]],
      // raw: true,
    });

    if (reservations.length > 0) {
      // const { userId, client } = req.user;
      // const action = `View Hotel reservations`;
      // const details = `User viewed hotel reservation`;
      // Log(userId, client, action, details);
      res.json(reservations);
    } else {
      res.status(404).json({
        status: 404,
        message: "Reservations not found for this hotel and check-in date.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to fetch reservations: " + error.message,
    });
  }
};

const getReservationById = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res
        .status(404)
        .json({ status: 404, message: "Reservation not found" });
    }
    const { userId, client } = req.user;
    const action = `View reservation`;
    const details = `User viewed reservation : ${reservation.id}`;
    //Log(userId, client, action, details);
    res.status(200).json(reservation);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to get reservation", error });
  }
};

// todo get last 24 reservations
const getReservationsLast24Hours = async (req, res) => {
  try {
    // const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

    const { hotelId, createdAt, status } = req.query;
    // Get count of reservations
    const reservationCount = await Reservation.count({
      where: {
        hotelId: hotelId,
        createdAt: {
          [Op.gte]: new Date(`${createdAt}T00:00:00.000Z`), // Greater than or equal to the specified date
          [Op.lt]: new Date(`${createdAt}T23:59:59.999Z`), // Less than the next day
        },
        paymentStatus: status,
        status: "Checked in",
      },
    });

    // Get total paid amount of reservations
    const totalPaidAmount = await Reservation.sum("totalPrice", {
      where: {
        hotelId: hotelId,
        createdAt: {
          [Op.gte]: new Date(`${createdAt}T00:00:00.000Z`), // Greater than or equal to the specified date
          [Op.lt]: new Date(`${createdAt}T23:59:59.999Z`), // Less than the next day
        },
        paymentStatus: status,
        status: "Checked in",
      },
    });

    res.status(200).json({
      reservationCount,
      totalPaidAmount: totalPaidAmount || 0,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message:
        "Failed to get reservations in the last 24 hours" + error.message,
      error,
    });
  }
};

const updateReservation = async (req, res) => {
  const { id } = req.params;
  const {
    checkInDate,
    checkOutDate,
    paymentMode,
    description,
    paymentStatus,
    extraService,
    extraServicePrice,
    roomId,
    hotelId,
    discountId,
  } = req.body;

  try {
    const reservation = await Reservation.findByPk(id, {
      include: [
        {
          model: Room,
          as: "Room",
        },
      ],
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ status: 404, message: "Reservation not found" });
    }

    // Calculate total price based on the provided check-in and check-out dates
    let updatedTotalPrice = reservation.totalPrice;

    await reservation.update({
      checkInDate,
      checkOutDate,
      totalPrice: updatedTotalPrice,
      paymentMode,
      description,
      paymentStatus,
      extraService,
      extraServicePrice: parseFloat(extraServicePrice),
      roomId,
      hotelId,
      discountId,
    });

    // Log the update activity
    const { userId, client } = req.user;
    const action = "Update reservation";
    const details = `Updated reservation: ${reservation.id}`;
    //Log(userId, client, action, details);

    if (discountId) {
      await applyDiscount(reservation, discountId);
    }

    // Send the updated reservation in the response

    res.status(200).json(reservation);
  } catch (error) {
    // Log the error details
    console.error("Error updating reservation:", error.message);

    res.status(500).json({
      status: 500,
      message: "Failed to update reservation",
      error: error.message,
    });
  }
};

// todo : apply discount to reservations

// const applyDiscount = async (req, res) => {
//   const { discountId } = req.body;
//   const { id } = req.params;

//   try {
//     // Fetch reservation by ID
//     const reservation = await Reservation.findOne({
//       where: { id },
//     });

//     if (!reservation) {
//       return res
//         .status(404)
//         .json({ status: 404, message: "Reservation not found" });
//     }

//     // Check if the reservation status is "Paid"
//     if (reservation.paymentStatus !== "Paid") {
//       return res
//         .status(400)
//         .json({ status: 400, message: "Payment is not made or cancelled" });
//     }

//     if (!reservation.checkOutDate) {
//       return res
//         .status(400)
//         .json({ status: 400, message: "Checkout date is not set" });
//     }

//     const discount = await Discount.findOne({ where: { id: discountId } });

//     if (!discount) {
//       return res
//         .status(404)
//         .json({ status: 404, message: "Discount not found" });
//     }

//     // Calculate discount based on type
//     if (discount.type === "Percentage") {
//       const discountAmount = (reservation.totalPrice * discount.value) / 100;
//       reservation.totalPrice -= discountAmount;
//     } else {
//       reservation.totalPrice -= discount.value;
//     }

//     // Apply extra service price
//     if (extraServicePrice) {
//       reservation.totalPrice += parseFloat(reservation.extraServicePrice);
//     }

//     // Save the reservation after applying discount and extra service price
//     await reservation.save();

//     const { userId, client } = req.user;
//     const action = `Apply discount`;
//     const details = `User applied discount - ${JSON.stringify(
//       discount.type
//     )} - ${JSON.stringify(discount.value)} for reservationId: ${
//       reservation.id
//     }`;
//     //Log(userId, client, action, details);

//     res.status(200).json({
//       status: 200,
//       message: "Discount applied successfully",
//       updatedReservation: reservation,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ status: 500, message: "Failed to apply discount" + error });
//   }
// };che

// todo : DISCOUNT
const applyDiscount = async (reservation, discountId) => {
  try {
    const discount = await Discount.findOne({ where: { id: discountId } });

    if (!discount) {
      return new Error("not discount");
    }

    const totalPriceBeforeDiscount = reservation.totalPrice;

    // Assuming the discount type is always "Fixed"
    reservation.totalPrice = totalPriceBeforeDiscount - discount.value;

    reservation.discountId = discountId;

    await reservation.save();

    const { userId, client } = req.user; // Note: req is not defined here, consider passing userId and client as parameters
    const action = `Apply discount`;
    const details = `User applied discount - ${discount.type} - ${discount.value} for reservationId : ${reservation.id}`;
    // Log(userId, client, action, details);

    return reservation;
  } catch (error) {
    return new Error("Error occurred while applying discount");
  }
};

const deleteReservation = async (req, res) => {
  const { id } = req.params;

  try {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res
        .status(404)
        .json({ status: 404, message: "Reservation not found" });
    }

    await reservation.destroy();
    const { userId, client } = req.user;
    const action = `Delete reservation`;
    const details = `Affected reservation id - 
      ${reservation.id}
    }`;
    //Log(userId, client, action, details);

    res.status(204).end(); // No content in response for successful deletion
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to delete reservation", error });
  }
};

// todo : RESERVATION BY GUEST

const getReservationByGuest = async (req, res) => {
  const { guestId } = req.params;

  try {
    const bookings = await Reservation.findAll({
      where: { guestId },
      include: [Hotel, Guest, Room, Discount],
      order: [["createdAt", "DESC"]], // Order by createdAt in descending order
      // Include any associations or attributes you need
    });

    if (bookings.length > 0) {
      res.json(bookings);
    } else {
      res.status(404).json({ message: "No bookings found for this guest." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: error.message });
  }
};
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      include: [Hotel, Guest, Room],
      raw: true,
    });

    const { userId, client } = req.user;
    const action = `View all reservations`;
    const details = `User viewed all reservations`;
    //Log(userId, client, action, details);

    res.status(200).json(reservations);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to get reservations", error });
  }
};

module.exports = {
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  getAllReservations,
  getReservationsByHotel,
  checkOutReservation,
  // applyDiscount,
  getReservationByGuest,

  // get last 24 hours
  getReservationsLast24Hours,
};
