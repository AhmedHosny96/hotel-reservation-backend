// const { Reservation, sequelize } = require("../models/db");
// const schedule = require("node-schedule");

const { scheduleJob } = require("node-schedule");

// const fetchDataAndSendReport = async () => {
//   try {
//     // 1. Total Number of Reservations Made in the Last 24 Hours
//     const totalReservations = await Reservation.count({
//       where: {
//         createdAt: {
//           [sequelize.Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
//         },
//       },
//     });

//     // 2. Total Paid Amount of Reservations in the Last 24 Hours
//     const totalPaidAmount = await Reservation.sum("totalPrice", {
//       where: {
//         paymentStatus: "Paid",
//         createdAt: {
//           [sequelize.Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
//         },
//       },
//     });

//     // 3. Cancelled Reservations and Refunded Reservations
//     const cancelledRefundedReservations = await Reservation.findAll({
//       where: {
//         [sequelize.Op.or]: [
//           { status: "Cancelled" },
//           { paymentStatus: "Refunded" },
//         ],
//         createdAt: {
//           [sequelize.Op.gte]: new Date(new Date() - 24 * 60 * 60 * 1000),
//         },
//       },
//     });

//     // Log or send the results in your report
//     console.log("Total Reservations in the Last 24 Hours:", totalReservations);
//     console.log("Total Paid Amount in the Last 24 Hours:", totalPaidAmount);
//     console.log(
//       "Cancelled and Refunded Reservations in the Last 24 Hours:",
//       cancelledRefundedReservations
//     );

//     // You can send an email, save to a file, or perform other actions with the data
//   } catch (error) {
//     console.error("Error fetching and sending report:", error);
//   }
// };

// // Schedule the job at 7:30 PM every day
// const job = schedule.scheduleJob("31 19 * * *", fetchDataAndSendReport);

// // Log a message to indicate that the job is scheduled
// console.log("Job scheduled to run at 7:30 PM every day.");

const cron = require("cron");

const job = new cron.CronJob(
  "15 10 * * *",
  () => {
    // Your report generation logic here
    console.log("Scheduled job executed at 7:54 PM");
  },
  null,
  true,
  "UTC"
); // Adjust the timezone as needed

// job.start();

module.exports = job;
