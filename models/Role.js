module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define("Role", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    // Other role-related attributes can be added here
  });
  return Role;
};
