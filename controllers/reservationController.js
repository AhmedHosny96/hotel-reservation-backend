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
//   const { checkInDate, checkOutDate, paymentMode, roomId, hotelId, guestId } =
//     req.body;

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

//     await room.update({ status: "Booked" });

//     const pricePerNight = room.pricePerNight; // Get price per night from the room

//     // Calculate duration of stay in milliseconds
//     const durationInMs = new Date(checkOutDate) - new Date(checkInDate);
//     const durationInDays = durationInMs / (1000 * 60 * 60 * 24); // Convert to days

//     console.log(durationInDays);

//     const totalPrice = durationInDays * pricePerNight; // Calculate total price

//     const parsedCheckInDate = new Date(checkInDate);
//     const formattedCheckInDate = parsedCheckInDate.toISOString().split("T")[0];

//     const parsedCheckOutDate = new Date(checkOutDate);
//     const formattedCheckOutDate = parsedCheckOutDate
//       .toISOString()
//       .split("T")[0];
//     // Create the reservation
//     const newReservation = await Reservation.create({
//       checkInDate: formattedCheckInDate,
//       checkOutDate: checkOutDate ? formattedCheckOutDate : null,
//       totalPrice: checkOutDate ? totalPrice : pricePerNight,
//       roomId,
//       paymentMode,
//       hotelId,
//       guestId,
//       // Other reservation details...
//     });

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
    checkOutDate,
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

    const pricePerNight = room.pricePerNight; // Get price per night from the room

    // Calculate duration of stay in milliseconds
    const durationInMs = checkOutDate
      ? new Date(checkOutDate) - new Date(checkInDate)
      : 0;

    const durationInDays = checkOutDate
      ? durationInMs / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    const durationInDaysNumeric = parseFloat(durationInDays);
    const pricePerNightNumeric = parseFloat(pricePerNight);
    const extraServicePriceNumeric = parseFloat(extraServicePrice);

    // Calculate total price including extra service
    const totalPrice =
      checkOutDate && durationInDaysNumeric
        ? durationInDaysNumeric * pricePerNightNumeric +
          extraServicePriceNumeric
        : pricePerNightNumeric + extraServicePriceNumeric; // Default to price per night + extra service price if checkOutDate is unknown

    const parsedCheckInDate = new Date(checkInDate);
    const formattedCheckInDate = parsedCheckInDate.toISOString().split("T")[0];

    const formattedCheckOutDate = checkOutDate
      ? new Date(checkOutDate).toISOString().split("T")[0]
      : null;

    // Create the reservation
    const newReservation = await Reservation.create({
      checkInDate: formattedCheckInDate,
      checkOutDate: formattedCheckOutDate,
      totalPrice,
      roomId,
      paymentMode,
      extraService,
      extraServicePrice,
      hotelId,
      guestId,
      paymentStatus: formattedCheckOutDate ? "Paid" : "Pending",
      // Other reservation details...
    });

    await room.update({ status: "Booked" });

    const { userId, client } = req.user;
    const action = `Create reservation`;
    const details = `Created reservation reservationId : ${newReservation.id}`;
    //Log(userId, client, action, details);

    res.status(201).json(newReservation);
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to create reservation" + error });
  }
};

// todo : checkout feature
const checkOutReservation = async (req, res) => {
  const { id } = req.params;

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

    // Update reservation status to "Checked out"
    await reservation.update({ status: "Checked out" });

    // Update room status to "Available"
    await reservation.Room.update({ status: "Available" });

    // Update payment status or other relevant details as needed
    // reservation.update({ paymentStatus: "UpdatedStatus", ... });

    const { userId, client } = req.user;
    const action = `Checkout reservation`;
    const details = `User checked out reservation : ${reservation.id}`;
    //Log(userId, client, action, details);

    res.status(200).json({ status: 200, message: "Checkout successful" });
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to checkout" });
  }
};

const getReservationsByHotel = async (req, res) => {
  const { hotelId, checkInDate } = req.query;

  try {
    const reservations = await Reservation.findAll({
      where: {
        hotelId: hotelId,
        checkInDate: sequelize.literal(`DATE(checkInDate) = '${checkInDate}'`),
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

    const { hotelId, checkInDate, status } = req.query;
    // Get count of reservations
    const reservationCount = await Reservation.count({
      where: {
        hotelId: hotelId,
        checkInDate: sequelize.literal(`DATE(checkInDate) = '${checkInDate}'`),
        paymentStatus: status,
      },
    });

    // Get total paid amount of reservations
    const totalPaidAmount = await Reservation.sum("totalPrice", {
      where: {
        hotelId: hotelId,
        checkInDate: sequelize.literal(`DATE(checkInDate) = '${checkInDate}'`),
        paymentStatus: status,
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

    const room = reservation.Room;

    // Calculate total price based on the provided check-in and check-out dates
    let updatedTotalPrice = reservation.totalPrice;

    if (checkInDate && checkOutDate) {
      const parsedCheckInDate = new Date(checkInDate);
      const parsedCheckOutDate = new Date(checkOutDate);

      const durationInMs = parsedCheckOutDate - parsedCheckInDate;
      const durationInDays = durationInMs / (1000 * 60 * 60 * 24);

      // Add the room price and extra service price to the total price
      updatedTotalPrice =
        durationInDays * room.pricePerNight + parseFloat(extraServicePrice);
    }

    // Update the reservation with the provided data
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
    });

    // Log the update activity
    const { userId, client } = req.user;
    const action = "Update reservation";
    const details = `Updated reservation: ${reservation.id}`;
    //Log(userId, client, action, details);

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
// };

const applyDiscount = async (req, res) => {
  const { discountId } = req.body;
  const { id } = req.params;

  try {
    const reservation = await Reservation.findOne({
      where: { id },
      include: { model: Room, raw: true },
    });

    if (!reservation) {
      return res
        .status(404)
        .json({ status: 404, message: "Reservation not found" });
    }

    const durationInMs = reservation.checkOutDate
      ? new Date(reservation.checkOutDate) - new Date(reservation.checkInDate)
      : 0;
    const durationInDays = reservation.checkOutDate
      ? durationInMs / (1000 * 60 * 60 * 24)
      : 0;

    if (reservation.paymentStatus !== "Paid") {
      return res
        .status(400)
        .json({ status: 400, message: "Payment is not made or cancelled" });
    }

    if (!reservation.checkOutDate) {
      return res
        .status(400)
        .json({ status: 400, message: "Checkout date is not set" });
    }

    const discount = await Discount.findOne({ where: { id: discountId } });

    if (!discount) {
      return res
        .status(404)
        .json({ status: 404, message: "Discount not found" });
    }

    const totalPriceBeforeDiscount = reservation.totalPrice;

    if (discount.type === "Percentage") {
      const discountAmount = (discount.value / 100) * totalPriceBeforeDiscount;
      reservation.totalPrice = totalPriceBeforeDiscount - discountAmount;
    } else {
      reservation.totalPrice = totalPriceBeforeDiscount - discount.value;
    }

    reservation.discountId = discountId;

    await reservation.save();

    const { userId, client } = req.user;
    const action = `Apply discount`;
    const details = `User applied discount - ${JSON.stringify(
      discount.type
    )} - ${JSON.stringify(discount.value)} for reservationId : ${
      reservation.id
    }`;
    //Log(userId, client, action, details);

    res.status(200).json({
      status: 200,
      message: "Discount applied successfully",
      updatedReservation: reservation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 500, message: "Failed to apply discount" + error });
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

function calculateDiscountPercentage(totalPrice, discount) {
  // if (discount) {
  if (discount && discount.type === "Percentage") {
    const discountAmount = (discount.value / 100) * totalPrice;
    return totalPrice - discountAmount;
    // } else if (discount.type === "Fixed") {

    //   return totalPrice - discount.value;
    // }
  }
  return totalPrice; // Return original price if no discount
}

function calculateDiscountFixed(originalPrice, discount) {
  if (discount && discount.type === "Fixed") {
    const discountAmount = originalPrice - discount.value;
    return discountAmount >= 0 ? discountAmount : 0;
  }
  return 0; // Return 0 if no discount or invalid discount type
}

module.exports = {
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  getAllReservations,
  getReservationsByHotel,
  checkOutReservation,
  applyDiscount,

  // get last 24 hours
  getReservationsLast24Hours,
};
