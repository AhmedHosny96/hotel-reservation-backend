module.exports = (sequelize, DataTypes) => {
  const RolePermission = sequelize.define("rolePermission", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
  });
  return RolePermission;
};
