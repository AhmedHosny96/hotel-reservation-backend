module.exports = (sequelize, DataTypes) => {
  const UserActivity = sequelize.define("ActivityLog", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Timestamps
  });

  return UserActivity;
};
