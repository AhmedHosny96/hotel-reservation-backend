const mysql2 = require("mysql2");
require("dotenv").config();

const development = {
  HOST: process.env.DB_HOST_DEV,
  USER: process.env.DB_USER_DEV,
  PASSWORD: process.env.DB_PASSWORD_DEV,
  DB: process.env.DB_NAME_DEV,
  dialect: "mysql",
  dialectModule: mysql2,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

const production = {
  HOST: process.env.DB_HOST_PROD,
  USER: process.env.DB_USER_PROD,
  PASSWORD: process.env.DB_PASSWORD_PROD,
  DB: process.env.DB_NAME_PROD,
  dialect: "mysql",
  dialectModule: mysql2,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
const config = process.env.NODE_ENV === "production" ? production : development;

module.exports = config;
