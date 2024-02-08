const cron = require("node-cron");
const { Reservation, Room } = require("../models/db");
const { Op } = require("sequelize");

cron.schedule("00 11 * * *", async () => {
  try {
    // Get active reservations with the specified conditions
    const activeReservations = await Reservation.findAll({
      where: {
        checkOutDate: null,
        paymentStatus: "Paid",
        status: {
          [Op.not]: "Checked out",
        },
        createdAt: {
          [Op.lt]: new Date().toISOString().split("T")[0],
        },
      },
      include: [Room],
    });

    // Process each active reservation
    for (const reservation of activeReservations) {
      // Calculate next day's date
      const nextDay = new Date(reservation.checkInDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Check if a reservation for the next day already exists for the same guest
      const existingReservation = await Reservation.findOne({
        where: {
          guestId: reservation.guestId,
          checkInDate: nextDay.toISOString().split("T")[0],
        },
      });

      // If no reservation exists, create a new record for the next day
      if (!existingReservation) {
        const newRecord = await Reservation.create({
          checkInDate: nextDay.toISOString().split("T")[0],
          totalPrice: reservation.Room.pricePerNight,
          roomId: reservation.roomId,
          paymentMode: reservation.paymentMode,
          extraService: reservation.extraService,
          extraServicePrice: reservation.extraServicePrice,
          hotelId: reservation.hotelId,
          guestId: reservation.guestId,
          paymentStatus: "Pending",
          // Other reservation details...
        });
        console.log(
          `Created new reservation for guestId ${reservation.guestId} on ${
            nextDay.toISOString().split("T")[0]
          }`
        );
      } else {
        console.log(
          `Skipped reservation for guestId ${reservation.guestId} on ${
            nextDay.toISOString().split("T")[0]
          } because a reservation already exists.`
        );
      }
    }

    console.log("Daily reservation processing completed.");
  } catch (error) {
    console.error("Error processing daily reservations:", error);
  }
});
