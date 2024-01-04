"use strict";
const path = require("path");
const config = require("../config/config");
const { Sequelize, DataTypes } = require("sequelize");

const db = {};
require("dotenv").config();

process.env.NODE_ENV = "development";

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorAliases: false,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => console.log("Connected to db"))
  .catch((error) => console.log("Failed to connect to db", error));

sequelize.options.logging = false;

// MODELS

db.Hotel = require("./Hotel")(sequelize, DataTypes);
db.Room = require("./Room")(sequelize, DataTypes);
db.Guest = require("./Guest")(sequelize, DataTypes);
db.Reservation = require("./Reservation")(sequelize, DataTypes);
db.Role = require("./Role")(sequelize, DataTypes);
db.User = require("./User")(sequelize, DataTypes);
db.Permission = require("./Permission")(sequelize, DataTypes);
db.RolePermission = require("./RolePermission")(sequelize, DataTypes);
db.Discount = require("./Discount")(sequelize, DataTypes);

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// model associations

db.User.belongsTo(db.Role, { foreignKey: "roleId" });
db.User.belongsTo(db.Hotel, { foreignKey: "hotelId" });
// db.Hotel.belongsTo(db.Role, { foreignKey: "roleId" }); 047322 sys , 000974 , adm

db.Role.belongsTo(db.Hotel, { foreignKey: "hotelId" });

db.Reservation.belongsTo(db.Hotel, { foreignKey: "hotelId" });
db.Reservation.belongsTo(db.Room, { foreignKey: "roomId" });
db.Reservation.belongsTo(db.Guest, { foreignKey: "guestId" });

db.Reservation.belongsTo(db.Discount, { foreignKey: "discountId" });
db.Discount.belongsTo(db.Hotel, { foreignKey: "hotelId" });

db.Guest.belongsTo(db.Hotel, { foreignKey: "hotelId" });
db.Room.belongsTo(db.Hotel, { foreignKey: "hotelId" });

db.Role.belongsToMany(db.Permission, { through: "rolePermission" });
db.Permission.belongsToMany(db.Role, { through: "rolePermission" });

db.sequelize.sync({ force: false }).then(() => {
  console.log("yes re-sync done");
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
