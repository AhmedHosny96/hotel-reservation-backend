const express = require("express");
const hotelRoutes = require("./routes/hotelRoutes");
const roomRoutes = require("./routes/roomRoutes");
const roleRoutes = require("./routes/roleRoutes");
const authRouter = require("./routes/authRouter");
const reservationRoute = require("./routes/reservationRoute");
const guestRouter = require("./routes/guestRouter");
const permissionRouter = require("./routes/permissionRouter");
const userRouter = require("./routes/userRouter");
const discountRouter = require("./routes/discountRouter");

module.exports = (app) => {
  app.use(express.json());
  app.use("/api/v1/hotels", hotelRoutes);
  app.use("/api/v1/rooms", roomRoutes);
  app.use("/api/v1/roles", roleRoutes);
  app.use("/api/v1/permissions", permissionRouter);
  app.use("/api/v1/reservations", reservationRoute);
  app.use("/api/v1/guests", guestRouter);
  app.use("/api/v1/discounts", discountRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1", authRouter);
};
