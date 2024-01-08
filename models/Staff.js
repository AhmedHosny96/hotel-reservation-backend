module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define("Staff", {
    // Define columns for the Staff model
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true, // Depending on your business rules
    },
    contactPersonPhone: {
      type: DataTypes.STRING,
      allowNull: true, // Depending on your business rules
    },
    contactAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return Staff;
};
