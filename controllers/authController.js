const jwt = require("jsonwebtoken");
const { User, Role, Permission, OTP, sequelize } = require("../models/db");
const { Op } = require("sequelize");
const emailSender = require("../utils/MailSender");

const bcrypt = require("bcrypt");
const { createActivityLog } = require("../utils/activityLog");
const { createOTP } = require("../utils/auth");

function randomOTP() {
  const length = 6;
  const digits = "0123456789";
  let OTP = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    OTP += digits[randomIndex];
  }
  return OTP;
}

// CREATE USER

const createUser = async (req, res) => {
  const { phone, name, email, roleId, hotelId } = req.body;
  let user = await User.findOne({
    where: {
      [Op.or]: [{ email }, { phone }],
    },
  });
  if (user)
    return res
      .status(400)
      .send({ status: 200, message: "Email or phone number is taken" });
  // generate OTP
  function generateOTP() {
    const length = 6;
    const digits = "0123456789";
    let OTP = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      OTP += digits[randomIndex];
    }
    return OTP;
  }

  const otp = generateOTP();

  console.log("OTP" + otp);
  //
  let payload = {
    email,
    phone,
    name,
    roleId,
    hotelId,
  };
  await User.create(payload);
  // send OTP to email
  // emailSender.sendEmail(
  //   `Your One-Time Password (OTP) for verification is:`,
  //   email,
  //   username,
  //   otp
  // );

  // const { userId, client } = req?.user;

  const action = `Create user`;
  const details = `User created new user  : ${JSON.stringify(payload)} `;
  // await createActivityLog(
  //   req?.user?.userId,
  //   req?.user?.client,
  //   action,
  //   details
  // );

  res.send(payload);
};

// todo  admin OTP

const generateOTP = async (req, res) => {
  const { email } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .send({ status: 400, message: "Invalid email format" });
  }

  let user = await User.findOne({
    where: {
      email: email,
    },
    include: { model: Role, Permission },

    raw: true,
  });

  // if (user?.status !== "Active") {
  //   return res.status(401).json({
  //     status: 401,
  //     message: "User is deactivated! Please contact your system administrator",
  //   });
  // }

  if (!user) {
    // const { userId, client } = req.user;
    const action = `Login attempt`;
    const details = `Failed login attempt : ${email} `;
    await createActivityLog(null, null, action, details);

    return res.status(401).send({ status: 401, message: "Invalid email " });
  }
  if (user && user.status !== "Active") {
    return res.status(401).json({
      status: 401,
      message: "User is deactivated! Please contact your system administrator",
    });
  }

  // todo send the otp to the owner
  const otp = randomOTP();

  await createOTP(otp, user.id, user.hotelId);

  const action = `Login `;
  const details = `Successful login email  : ${email} `;
  await createActivityLog(null, null, action, details);

  res.send({
    status: 200,
    message: "Successful, Contact your system admin to get the OTP " + otp,
    // token: token,
  });
};

// todo login with otp
const loginWithOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Find the user based on the provided email
  const user = await User.findOne({
    where: { email },
    include: { model: Role, Permission },
    raw: true,
  });

  if (!user) {
    return res.status(401).json({ status: 401, message: "User not found" });
  }

  if (user?.status !== "Active") {
    return res.status(401).json({
      status: 401,
      message: "User is deactivated! Please contact your system administrator",
    });
  }

  // Retrieve OTP data for the user
  const storedOTP = await OTP.findOne({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]], // Order by createdAt in descending order to get the latest OTP
  });

  if (!storedOTP || storedOTP.isExpired) {
    return res.status(410).json({
      status: 410,
      message: "OTP expired, please request a new OTP",
    });
  }

  if (storedOTP.otp !== otp) {
    return res.status(401).json({ status: 401, message: "Invalid OTP" });
  }

  try {
    // Begin a transaction to ensure atomicity of operations

    const transaction = await sequelize.transaction();

    // Delete the used OTP record
    await storedOTP.destroy({ transaction });

    // Commit the transaction if everything succeeds
    await transaction.commit();

    // At this point, the OTP is valid - generate JWT token for authentication
    const role = user["Role.name"];
    const token = jwt.sign(
      {
        userId: user.id,
        email: email,
        role: role,
        client: user.hotelId,
        // other claims as needed
      },
      process.env.jwtSecret
    );

    const action = `Login with OTP`;
    const details = `Successful login with OTP for email: ${email}`;
    await createActivityLog(null, null, action, details);

    return res
      .status(200)
      .json({ status: 200, message: "Login successful", token });
  } catch (error) {
    // Roll back the transaction in case of any errors
    await transaction.rollback();
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

// CHANGE PASSWORD

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword, repeatNewPassword } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ status: 401, message: "Incorrect current password" });
    }

    if (newPassword !== repeatNewPassword) {
      return res
        .status(400)
        .json({ status: 400, message: "New passwords do not match" });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: 400,
        message: `Password must contain: 
          • At least 8 characters
          • Lowercase letters, numbers, and symbols (!@#$%^&*()_+)`,
      });
    }

    if (
      !user ||
      !passwordMatch ||
      (!newPassword !== repeatNewPassword) | !passwordRegex.test(newPassword)
    ) {
      // const { userId, client } = req.user;

      const action = `Change password attempt`;
      const details = `Failed change password attempt : ${user.email} `;
      await createActivityLog(null, null, action, details);
    }

    // Update the password
    user.password = await bcrypt.hash(newPassword, 10);
    user.isFirstLogin = false;
    user.status = true;
    await user.save();

    // const { userId, client } = req.user;

    const action = `Change password`;
    const details = `User successfully changed password : ${user.email} `;
    await createActivityLog(null, null, action, details);

    res.json({ status: 200, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error while updating password:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  generateOTP,
  changePassword,
  loginWithOtp,
};
