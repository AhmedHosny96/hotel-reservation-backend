const winston = require("winston");

module.exports = function () {
  winston.handleExceptions(
    new winston.transports.File({ filename: "unCaughtExceptions.log" })
  );

  process.on("unhandledRejection", (err) => {
    throw err;
  });

  winston.add(winston.transports.File, { filename: "logfile.log" });
};
