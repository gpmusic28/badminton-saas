const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Registration = require("../models/Registration");
const TournamentFinance = require("../models/TournamentFinance");
const auth = require("../middleware/auth");

// GET Tournament Finance Dashboard
router.get("/:tournamentId", auth, async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: "Tournament not found" });

    // 🔐 Security check
    if (tournament.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    // Get approved registrations
   const registrations = await Registration.find({
  tournament: tournamentId,
});



    // Get or create finance document
    let finance = await TournamentFinance.findOne({ tournamentId });

    if (!finance) {
      finance = await TournamentFinance.create({
        tournamentId,
        organizerId: req.user.id,
        expenses: [],
        sponsorships: []
      });
    }
console.log("Tournament categories:", tournament.categories);
   // =============================
// CALCULATIONS
// =============================

// Get tournament with categories

let entryIncome = 0;
let expectedRevenue = 0;

const categoryMap = {};

registrations.forEach(reg => {
  const category = tournament.categories.find(
    c => c.name?.trim() === reg.categoryName?.trim()
  );

  const fee = parseFloat(category?.entryFee) || 0;

  if (!categoryMap[reg.categoryName]) {
    categoryMap[reg.categoryName] = {
      categoryName: reg.categoryName,
      entryFee: fee,
      totalEntries: 0,
      verifiedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
      freeCount: 0,
      expectedRevenue: 0,
      collectedRevenue: 0
    };
  }

  const cat = categoryMap[reg.categoryName];

  cat.totalEntries += 1;
  cat.expectedRevenue += fee;
  expectedRevenue += fee;

  if (reg.paymentStatus === "verified") {
    cat.verifiedCount += 1;
    cat.collectedRevenue += fee;
    entryIncome += fee;
  } 
  else if (reg.paymentStatus === "submitted") {
    cat.pendingCount += 1;
  } 
  else if (reg.paymentStatus === "rejected") {
    cat.rejectedCount += 1;
  } 
  else if (reg.paymentStatus === "not_required") {
    cat.freeCount += 1;
  }
});

const categoryBreakdown = Object.values(categoryMap);

const sponsorshipIncome = finance.sponsorships.reduce(
  (sum, s) => sum + s.amount,
  0
);

const totalExpense = finance.expenses.reduce(
  (sum, e) => sum + e.amount,
  0
);

const totalIncome = entryIncome + sponsorshipIncome;
const netProfit = totalIncome - totalExpense;
    res.json({
      summary: {
  totalRegistrations: registrations.length,
  expectedRevenue,
  collectedRevenue: entryIncome,
  sponsorshipIncome,
  totalExpense,
  totalIncome: entryIncome + sponsorshipIncome,
  netProfit: (entryIncome + sponsorshipIncome) - totalExpense
},
      categories: categoryBreakdown,
      expenses: finance.expenses,
      sponsorships: finance.sponsorships
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Add Expense
router.post("/:tournamentId/expense", auth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { title, amount } = req.body;

    if (!title || !amount || amount <= 0)
      return res.status(400).json({ error: "Invalid expense data" });

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const finance = await TournamentFinance.findOne({ tournamentId });
    if (!finance)
      return res.status(404).json({ error: "Finance record not found" });

    finance.expenses.push({ title, amount });

    await finance.save();

    res.json({ message: "Expense added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Delete Expense
router.delete("/:tournamentId/expense/:expenseId", auth, async (req, res) => {
  try {
    const { tournamentId, expenseId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const finance = await TournamentFinance.findOne({ tournamentId });
    if (!finance)
      return res.status(404).json({ error: "Finance record not found" });

    finance.expenses = finance.expenses.filter(
      e => e._id.toString() !== expenseId
    );

    await finance.save();

    res.json({ message: "Expense removed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Add Sponsorship
router.post("/:tournamentId/sponsorship", auth, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { sponsor, amount } = req.body;

    if (!sponsor || !amount || amount <= 0)
      return res.status(400).json({ error: "Invalid sponsorship data" });

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const finance = await TournamentFinance.findOne({ tournamentId });
    if (!finance)
      return res.status(404).json({ error: "Finance record not found" });

    finance.sponsorships.push({ sponsor, amount });

    await finance.save();

    res.json({ message: "Sponsorship added successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Delete Sponsorship
router.delete("/:tournamentId/sponsorship/:id", auth, async (req, res) => {
  try {
    const { tournamentId, id } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    if (tournament.organizer.toString() !== req.user.id)
      return res.status(403).json({ error: "Unauthorized" });

    const finance = await TournamentFinance.findOne({ tournamentId });
    if (!finance)
      return res.status(404).json({ error: "Finance record not found" });

    finance.sponsorships = finance.sponsorships.filter(
      s => s._id.toString() !== id
    );

    await finance.save();

    res.json({ message: "Sponsorship removed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
module.exports = router;