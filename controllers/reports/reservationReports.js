const { Op } = require("sequelize");
const {
  Reservation,
  Room,
  Hotel,
  Guest,
  Discount,
  sequelize,
} = require("../../models/db"); // Import the Reservation model

const getReservationReport = async (req, res) => {
  const { fromDate, toDate, status } = req.query;

  try {
    const reservations = await Reservation.findAll({
      where: {
        checkInDate: {
          [Op.between]: [fromDate, toDate],
        },
        paymentStatus: status,
      },
      include: [
        {
          model: Room,
          attributes: [], // Define attributes needed from the Room model
          include: [
            {
              model: Hotel,
              attributes: [], // Define attributes needed from the Hotel model
            },
          ],
        },
        {
          model: Guest,
          attributes: [], // Define attributes needed from the Guest model
        },
        {
          model: Discount,
        },
      ],
      attributes: [
        "checkInDate", // Include necessary reservation attributes
        "totalPrice",
      ],
      raw: true,
    });

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to fetch reservations: " + error.message,
    });
  }
};

module.exports = { getReservationReport };
