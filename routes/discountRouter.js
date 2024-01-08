const express = require("express");
const discountController = require("../controllers/discountController");
const { verifyToken } = require("../utils/auth");

const router = express.Router();

router.get("/", verifyToken, discountController.getAllDiscounts);
router.get(
  "/hotel/:hotelId",
  verifyToken,
  discountController.getDiscountByHotel
);
router.get("/:id", verifyToken, discountController.getDiscountById);
router.post("/", verifyToken, discountController.createDiscount);
router.put("/:id", verifyToken, discountController.updateDiscount);
router.delete("/:id", verifyToken, discountController.deleteDiscount);

module.exports = router;
