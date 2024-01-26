const express = require("express");
const app = require("express")();
const winston = require("winston");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const path = require("path");

const AutomaticReports = require("./AutomaticReports");
const googleSheetReport = require("./googleSheetReport");

require("./utils/backgroundService");

// const hotelRoutes = require("./routes/hotelRoutes.js");
app.use(
  cors({
    origin: ["https://juba-hotel.vercel.app", "http://localhost:8000"], // Replace with your frontend URL
    credentials: true, // Enable credentials (cookies, authorization headers)
  })
);
app.use(cookieParser());

app.use("/tmp", express.static(path.join(__dirname, "tmp")));

require("dotenv").config();
require("./config/config");
// require("./routes/subjects.route")(app);
require("./routes")(app);
// // require("./startup/logging")();

// todo cron jobs

const port = process.env.PORT || 5000;
console.log(process.env.NODE_ENV);

// app.use("/api/hotels", hotelRoutes);

// Specify the port for your Socket.IO server

app.listen(port, () => {
  winston.info(`listening on port ${port}`);
});

// todo questions
