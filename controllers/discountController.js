const { Discount } = require("../models/db"); // Import the Discount model

const getAllDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.findAll();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to fetch discounts",
      details: error,
    });
  }
};

const getDiscountById = async (req, res) => {
  const { id } = req.params;

  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res
        .status(404)
        .json({ status: 404, message: "Discount not found" });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to fetch discount",
      details: error,
    });
  }
};
const getDiscountByHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const discount = await Discount.findAll({ hotelId });
    if (!discount) {
      return res
        .status(404)
        .json({ status: 404, message: "Discount not found" });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to fetch discount",
      details: error,
    });
  }
};

const createDiscount = async (req, res) => {
  const { name, type, value, hotelId } = req.body;
  const discount = await Discount.findOne({ where: { name } });
  if (discount) {
    return res
      .status(400)
      .json({ status: 400, message: "Discount with same name exits " });
  }

  try {
    // Create a new discount
    const newDiscount = await Discount.create({
      name,
      type,
      value,
      hotelId,
    });

    res.status(201).json(newDiscount);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to create discount" + error,
    });
  }
};

const updateDiscount = async (req, res) => {
  const { id } = req.params;
  const {
    /* extract necessary discount fields from req.body */
  } = req.body;

  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res
        .status(404)
        .json({ status: 404, message: "Discount not found" });
    }

    // Update the discount
    await discount.update({
      // Update with the extracted fields
    });

    res.json({ message: "Discount updated successfully" });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to update discount",
      details: error,
    });
  }
};

const deleteDiscount = async (req, res) => {
  const { id } = req.params;
  try {
    const discount = await Discount.findByPk(id);
    if (!discount) {
      return res
        .status(404)
        .json({ status: 404, message: "Discount not found" });
    }
    // Delete the discount
    await discount.destroy();
    res.json({ message: "Discount deleted successfully" });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to delete discount",
      details: error,
    });
  }
};

module.exports = {
  getAllDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getDiscountByHotel,
};
