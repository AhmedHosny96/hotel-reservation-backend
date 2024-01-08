const { Hotel, User } = require("../models/db"); // Adjust the path as needed based on your file structure
const bcrypt = require("bcrypt");
const { createActivityLog } = require("../utils/activityLog");

const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.findAll({});
    const { userId, client } = req.user;
    const action = `View all hotels`;
    const details = `User viewed all hotels permission `;
    await createActivityLog(userId, client, action, details);
    res.send(hotels);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch hotels" });
  }
};

const getHotelById = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await Hotel.findByPk(id);
    if (hotel) {
      const { userId, client } = req.user;
      const action = `View hotel`;
      const details = `User viewed hotel :${hotel.id} `;
      await createActivityLog(userId, client, action, details);
      res.json(hotel);
    } else {
      res.status(404).json({ status: 404, message: "Hotel not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to fetch hotel" });
  }
};

const createHotel = async (req, res) => {
  const { name, address, city, country, phone, email } = req.body;

  // Existence validation
  if (!name || !phone || !email) {
    return res.status(400).json({
      status: 400,
      message: "Name, phone, and email are required fields",
    });
  }
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ status: 400, message: "Invalid email format" });
  }
  // Validate phone number format
  const phoneRegex = /^(251|09)\d{8,10}$/; // Adjust this regex based on your phone number format
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ status: 400, message: "Invalid phone number format" });
  }

  try {
    // Check if the name already exists
    const existingName = await Hotel.findOne({
      where: { name: name },
    });

    if (existingName) {
      return res.status(409).json({
        status: 409,
        message: "Hotel with the same name already exists",
      });
    }

    // Check if the email already exists
    const existingEmail = await Hotel.findOne({
      where: { email: email },
    });

    if (existingEmail) {
      return res.status(409).json({
        status: 409,
        message: "Hotel with the same email already exists",
      });
    }

    // Check if the phone already exists
    const existingPhone = await Hotel.findOne({
      where: { phone: phone },
    });

    if (existingPhone) {
      return res.status(409).json({
        status: 409,
        message: "Hotel with the same phone number already exists",
      });
    }

    // Create a new hotel if it doesn't exist
    const newHotel = await Hotel.create({
      name,
      address,
      city,
      country,
      phone,
      email,
    });

    // // create user for the hotel
    // function generateOTP() {
    //   const length = 6;
    //   const digits = "0123456789";
    //   let OTP = "";

    //   for (let i = 0; i < length; i++) {
    //     const randomIndex = Math.floor(Math.random() * digits.length);
    //     OTP += digits[randomIndex];
    //   }
    //   return OTP;
    // }

    // const otp = generateOTP();

    // let userPayload = {
    //   username: name,
    //   phone,
    //   email,
    //   password: await bcrypt.hash(otp, 10),
    //   roleId,
    //   hotelId: newHotel.id,
    // };

    // await User.create(userPayload);

    // emailSender.sendEmail(email, fullName, otp);

    const { userId, client } = req.user;
    const action = `Create hotel`;
    const details = `User created hotel :${newHotel.id} `;
    await createActivityLog(userId, client, action, details);
    res.status(201).json(newHotel);
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to create hotel" });
  }
};

const updateHotel = async (req, res) => {
  const { id } = req.params;
  const { name, address, city, country, phone, email } = req.body;
  try {
    const hotel = await Hotel.findByPk(id);
    if (hotel) {
      await hotel.update({
        name,
        address,
        city,
        country,
        phone,
        email,

        // Add other fields as needed
      });
      const { userId, client } = req.user;
      const action = `Update hotel`;
      const details = `User updated hotel :${hotel.id} `;
      await createActivityLog(userId, client, action, details);
      res.json({ status: 200, message: "Hotel updated successfully" });
    } else {
      res.status(404).json({ status: 404, message: "Hotel not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to update hotel" });
  }
};

const deleteHotel = async (req, res) => {
  const { id } = req.params;
  try {
    const hotel = await Hotel.findByPk(id);
    if (hotel) {
      await hotel.destroy();
      const { userId, client } = req.user;
      const action = `Delete hotel`;
      const details = `User deleted hotel :${hotel.id} `;
      await createActivityLog(userId, client, action, details);
      res.json({ status: 200, message: "Hotel deleted successfully" });
    } else {
      res.status(404).json({ status: 404, message: "Hotel not found" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: "Failed to delete hotel" });
  }
};

module.exports = {
  getAllHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
