module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define("Room", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pricePerNight: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Available", "Booked", "Maintenance", "Reserved"), // Example statuses
      defaultValue: "Available",
    },

    // hotelId: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   references: {
    //     model: "hotels", // References the Room model
    //     key: "id", // References the id column in the Room model
    //   },
    // },
    // Other room-related attributes can be added here
  });

  return Room;
};
