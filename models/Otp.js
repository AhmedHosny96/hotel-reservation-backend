module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define(
    "OTP",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(new Date().getTime() + 5 * 60000),
      },
    },
    {
      // Define virtual field for isExpired
      getterMethods: {
        isExpired() {
          return this.expiresAt < new Date();
        },
      },
      // Optional: Define 'freezeTableName' and 'timestamps' if needed
      //   freezeTableName: true,
      //   timestamps: true,
    }
  );

  return OTP;
};
