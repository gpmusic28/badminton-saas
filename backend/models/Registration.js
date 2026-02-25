const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  categoryName: { type: String, required: true },
  teamName: String,
  player1: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    coach: String,
    arena: String
  },
  player2: {
    name: String,
    email: String,
    mobile: String,
    coach: String,
    arena: String
  },
  paymentScreenshot: String,
  paymentAmount: Number,
  paymentStatus: { type: String, enum: ['pending', 'submitted', 'verified', 'rejected'], default: 'pending' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewNotes: String,
  reviewedAt: Date,
  entryMode: { type: String, enum: ['form', 'manual', 'bulk'], default: 'form' }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);
