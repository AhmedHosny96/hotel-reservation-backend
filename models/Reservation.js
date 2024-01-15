module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define("Reservation", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paymentMode: {
      type: DataTypes.ENUM("Cash", "Electronic"), // Example statuses
      defaultValue: "Cash",
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extraService: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    extraServicePrice: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    paymentStatus: {
      type: DataTypes.ENUM("Paid", "Unpaid", "Refunded", "Pending"), // Example statuses
      defaultValue: "Paid",
    },
    status: {
      type: DataTypes.ENUM("Checked in", "Cancelled", "Checked out"), // Example statuses
      defaultValue: "Checked in",
    },
  });

  return Reservation;
};
