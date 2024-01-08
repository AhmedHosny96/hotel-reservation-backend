const jwt = require("jsonwebtoken");
const { User, Role, Permission } = require("../models/db");
const { Op } = require("sequelize");
const emailSender = require("../utils/MailSender");

const bcrypt = require("bcrypt");
const { createActivityLog } = require("../utils/activityLog");

// CREATE USER

const createUser = async (req, res) => {
  const { username, phone, email, roleId, hotelId } = req.body;
  let user = await User.findOne({
    where: {
      [Op.or]: [{ email }, { phone }, { username }],
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
    username,
    email,
    phone,
    password: await bcrypt.hash(otp, 10),
    roleId,
    hotelId,
  };
  await User.create(payload);
  // send OTP to email
  emailSender.sendEmail(
    `Your One-Time Password (OTP) for verification is:`,
    email,
    username,
    otp
  );

  const { userId, client } = req.user;

  const action = `Create user`;
  const details = `User created new user  : ${JSON.stringify(payload)} `;
  await createActivityLog(userId, client, action, details);

  res.send(payload);
};
// LOGIN

const login = async (req, res) => {
  const { email, password } = req.body;

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

  if (!user) {
    // const { userId, client } = req.user;
    const action = `Login attempt`;
    const details = `Failed login attempt : ${email} `;
    await createActivityLog(null, null, action, details);

    return res
      .status(401)
      .send({ status: 401, message: "Invalid username or password" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    const action = `Login attempt`;
    const details = `Failed login attempt wrong password : ${email} `;
    await createActivityLog(null, null, action, details);

    return res
      .status(401)
      .send({ status: 401, message: "invalid username or password " });
  }

  console.log("USER", user);

  const role = user["Role.name"];

  console.log(role);

  // const permissionNames = user.role.permissions.map(
  //   (permission) => permission.permission
  // );

  console.log(user);

  const token = jwt.sign(
    {
      userId: user.id,
      email: email,
      role: role,
      client: user.hotelId,
      // permissions: permissionNames,
    },
    process.env.jwtSecret
  );

  const action = `Login `;
  const details = `Successful login email  : ${email} `;
  await createActivityLog(null, null, action, details);

  res
    // .cookie("X-AUTH-TOKEN", token, {
    //   httpOnly: true,
    //   secure: true, // Ensure it's sent only over HTTPS
    //   sameSite: "strict", // Optionally set 'sameSite' attribute
    // })
    .send({ status: 200, message: "Login successful", token: token });
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
      const { userId, client } = req.user;

      const action = `Change password attempt`;
      const details = `Failed change password attempt : ${email} `;
      await createActivityLog(userId, client, action, details);
    }

    // Update the password
    user.password = await bcrypt.hash(newPassword, 10);
    user.isFirstLogin = false;
    user.status = true;
    await user.save();

    const { userId, client } = req.user;

    const action = `Change password`;
    const details = `User successfully changed password : ${email} `;
    await createActivityLog(userId, client, action, details);

    res.json({ status: 200, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error while updating password:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

module.exports = {
  createUser,
  login,
  changePassword,
};
