module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define(
    "Reservation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      checkInDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      checkOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      paymentMode: {
        type: DataTypes.ENUM("Cash", "Electronic"),
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
        type: DataTypes.ENUM("Paid", "Unpaid", "Refunded", "Pending"),
        defaultValue: "Paid",
      },
      status: {
        type: DataTypes.ENUM("Checked in", "Cancelled", "Checked out"),
        defaultValue: "Checked in",
      },
      createdAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    {
      // Disable automatic timestamps
      timestamps: false,
      hooks: {
        beforeValidate: (reservation, options) => {
          reservation.createdAt = new Date().toLocaleDateString();
          reservation.updatedAt = new Date().toLocaleDateString();
        },
        beforeUpdate: (reservation, options) => {
          reservation.updatedAt = new Date().toLocaleDateString();
        },
      },
    }
  );

  return Reservation;
};
