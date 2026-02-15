const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/auth");

// Add Transaction
router.post("/", authMiddleware, async (req, res) => {
  try {
    const transaction = new Transaction({
      userId: req.user.id,
      title: req.body.title,
      amount: req.body.amount,
      category: req.body.category,
      date: req.body.date,
      notes: req.body.notes
    });

    await transaction.save();
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error adding transaction" });
  }
});

// Get All Transactions for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// Delete Transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// Summary API (Total + Category breakdown)
router.get("/summary/data", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    let total = 0;
    let categories = {};

    transactions.forEach(t => {
      total += t.amount;
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    res.json({ total, categories });
  } catch (err) {
    res.status(500).json({ message: "Summary error" });
  }
});

module.exports = router;
