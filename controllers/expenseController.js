// expenseController.js

const { Op } = require("sequelize");
const { Expense, Hotel, Staff } = require("../models/db");
const { createActivityLog } = require("../utils/activityLog");

// Controller to get all expenses
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll();

    const { userId, client } = req.user;
    const action = `View all expnses`;
    const details = `User viewed all expenses `;
    //Log(userId, client, action, details);
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to create a new expense
const createExpense = async (req, res) => {
  const { description, amount, category, date, hotelId } = req.body;

  try {
    const existingExpense = await Expense.findOne({
      where: { category, amount, date },
    });

    if (existingExpense) {
      return res.status(400).json({
        message:
          "Expense with the same category, amount, and date already exists",
      });
    }
    let newExpense;

    if (category === "Salary") {
      const totalEmployeeSalaries = await Staff.sum("salary");
      newExpense = await Expense.create({
        description,
        amount: totalEmployeeSalaries,
        category,
        date,
        hotelId,
      });
    } else {
      newExpense = await Expense.create({
        description,
        amount,
        category,
        date,
        hotelId,
      });
    }
    const { userId, client } = req.user;
    const action = `Create expense`;
    const details = `User created expense : ${newExpense.id} `;
    //Log(userId, client, action, details);

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// todo 24 hours expense

const getLast24ExpenseTotal = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

    const reservations = await Expense.sum("amount", {
      where: {
        createdAt: {
          [Op.gte]: twentyFourHoursAgo,
        },
        hotelId: req.params.hotelId,
      },
    });

    res.status(200).json({ totalExpense: reservations || 0 });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Failed to get reservations in the last 24 hours",
      error,
    });
  }
};

// Controller to get an expense by ID
const getExpenseById = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    const { userId, client } = req.user;
    const action = `View expense`;
    const details = `User viewed expense : ${expense.id} `;
    //Log(userId, client, action, details);
    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExpensesByHotel = async (req, res) => {
  const { hotelId } = req.params;

  try {
    const expense = await Expense.findAll({
      where: { hotelId: hotelId },
      include: {
        model: Hotel,
      },
      raw: true,
    });

    if (expense.length > 0) {
      const { userId, client } = req.user;
      const action = `View hotel expense`;
      const details = `User viewed hotel expense : ${hotelId} `;
      //Log(userId, client, action, details);
      res.json(expense);
    } else {
      res.status(404).json({
        status: 404,
        message: "expenses not found for this hotel",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to update an expense by ID
const updateExpenseById = async (req, res) => {
  const { id } = req.params;
  const { description, amount, category, date } = req.body;

  try {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.update(
      {
        description,
        amount,
        category,
        date,
      },
      {
        where: { id },
      }
    );

    const updatedExpense = await Expense.findByPk(id);

    const { userId, client } = req.user;
    const action = `Update expense`;
    const details = `User updated expense : ${updatedExpense.id} `;
    //Log(userId, client, action, details);
    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to delete an expense by ID
const deleteExpenseById = async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await Expense.destroy({ where: { id } });
    const { userId, client } = req.user;
    const action = `Delete expense`;
    const details = `User deleted expense : ${expense.id} `;
    //Log(userId, client, action, details);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllExpenses,
  createExpense,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
  getExpensesByHotel,
  getLast24ExpenseTotal,
};
