const express = require("express");
const expenseController = require("../controllers/expenseController");
const { verifyToken } = require("../utils/auth");

const router = express.Router();

router.get("/", verifyToken, expenseController.getAllExpenses);
router.get(
  "/hotel/:hotelId",
  verifyToken,
  expenseController.getExpensesByHotel
);
router.get("/:id", verifyToken, expenseController.getExpenseById);
router.post("/", verifyToken, expenseController.createExpense);
router.put("/:id", verifyToken, expenseController.updateExpenseById);
router.delete("/:id", verifyToken, expenseController.deleteExpenseById);

module.exports = router;
