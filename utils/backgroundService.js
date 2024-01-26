const cron = require("node-cron");
const { Reservation } = require("../models/db");

cron.schedule("09 16 * * *", async () => {
  try {
    // Get reservations that are still checked in and need to be processed
    const activeReservations = await Reservation.findAll({
      where: {
        checkOutDate: null,
        paymentStatus: "Paid",
        status: "Checked in",
      },
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
          checkInDate: reservation.checkInDate,
          totalPrice: reservation.totalPrice, // You may need to adjust this based on your logic
          roomId: reservation.roomId,
          paymentMode: reservation.paymentMode,
          extraService: reservation.extraService,
          extraServicePrice: reservation.extraServicePrice,
          hotelId: reservation.hotelId,
          guestId: reservation.guestId,
          paymentStatus: "Pending",
          // Other reservation details...
        });
      }
    }

    console.log("Daily reservation processing completed.");
  } catch (error) {
    console.error("Error processing daily reservations:", error);
  }
});
