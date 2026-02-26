const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const sponsorshipSchema = new mongoose.Schema({
  sponsor: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const tournamentFinanceSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tournament",
    required: true,
    unique: true
  },
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expenses: [expenseSchema],
  sponsorships: [sponsorshipSchema]
}, { timestamps: true });

module.exports = mongoose.model("TournamentFinance", tournamentFinanceSchema);