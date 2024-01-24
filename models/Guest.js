module.exports = (sequelize, DataTypes) => {
  const Guest = sequelize.define("Guest", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // gender: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photoID: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Guest;
};
