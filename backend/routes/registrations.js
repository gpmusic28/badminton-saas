const express = require('express');
const Registration = require('../models/Registration');
const Tournament = require('../models/Tournament');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const xlsx = require('xlsx');
const router = express.Router();

// Public: Submit registration with payment screenshot
// Public: Secure Submit Registration
router.post('/submit', upload.single('paymentScreenshot'), async (req, res) => {
  try {
    const {
      tournamentId,
      categoryName,
      teamName,
      player1Name,
      player1Email,
      player1Mobile,
      player1Coach,
      player1Arena,
      player2Name,
      player2Email,
      player2Mobile,
      player2Coach,
      player2Arena,
      paymentAmount
    } = req.body;

    // 1️⃣ Validate tournament
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament)
      return res.status(404).json({ error: "Tournament not found" });

    // 2️⃣ Validate category
    const category = tournament.categories.find(
      c => c.name === categoryName
    );
    if (!category)
      return res.status(400).json({ error: "Invalid category" });

    const requiredAmount = Number(category.entryFee || 0);
    const paidAmount = Number(paymentAmount || 0);

    // 3️⃣ Validate payment amount
    if (requiredAmount !== paidAmount) {
      return res.status(400).json({ error: "Invalid payment amount" });
    }

    // 4️⃣ Screenshot required for paid categories
    if (requiredAmount > 0 && !req.file) {
      return res.status(400).json({ error: "Payment screenshot required" });
    }

    const reg = await Registration.create({
      tournament: tournamentId,
      categoryName,
      teamName,
      player1: {
        name: player1Name,
        email: player1Email,
        mobile: player1Mobile,
        coach: player1Coach,
        arena: player1Arena
      },
      player2: player2Name ? {
        name: player2Name,
        email: player2Email,
        mobile: player2Mobile,
        coach: player2Coach,
        arena: player2Arena
      } : undefined,
      paymentScreenshot: req.file ? `/uploads/${req.file.filename}` : null,
      paymentAmount: requiredAmount,
      paymentStatus: requiredAmount === 0 ? "not_required" : "submitted",
      status: requiredAmount === 0 ? "approved" : "pending",
      entryMode: "form"
    });

    res.status(201).json({
      message: "Registration submitted successfully!",
      id: reg._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Public: Check registration status
router.get('/status/:id', async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).select('-paymentScreenshot');
    if (!reg) return res.status(404).json({ error: 'Registration not found' });
    res.json(reg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Organizer: Get all registrations for a tournament
router.get('/tournament/:tournamentId', auth, async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = { tournament: req.params.tournamentId };
    if (status) filter.status = status;
    if (category) filter.categoryName = category;
    const regs = await Registration.find(filter).sort({ createdAt: -1 });
    const counts = {
      total: await Registration.countDocuments({ tournament: req.params.tournamentId }),
      pending: await Registration.countDocuments({ tournament: req.params.tournamentId, status: 'pending' }),
      approved: await Registration.countDocuments({ tournament: req.params.tournamentId, status: 'approved' }),
      rejected: await Registration.countDocuments({ tournament: req.params.tournamentId, status: 'rejected' })
    };
    res.json({ registrations: regs, counts });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Organizer: Approve registration
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const reg = await Registration.findByIdAndUpdate(req.params.id,
      { status: 'approved', paymentStatus: 'verified', reviewedAt: new Date(), reviewNotes: req.body.notes },
      { new: true }
    );
    res.json(reg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Organizer: Reject registration
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const reg = await Registration.findByIdAndUpdate(req.params.id,
      { status: 'rejected', reviewedAt: new Date(), reviewNotes: req.body.notes },
      { new: true }
    );
    res.json(reg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Organizer: Manual add single team
router.post('/manual', auth, async (req, res) => {
  try {
    const reg = await Registration.create({ ...req.body, entryMode: 'manual', status: 'approved' });
    res.status(201).json(reg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Organizer: Bulk upload via Excel/CSV
router.post('/bulk', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const wb = xlsx.readFile(req.file.path);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(ws);
    const results = { success: 0, failed: 0, errors: [] };

    for (const row of rows) {
      try {
        await Registration.create({
          tournament: req.body.tournamentId,
          categoryName: req.body.categoryName || row['Category'] || 'General',
          teamName: row['Team Name'] || row['team_name'],
          player1: {
            name: row['Player1 Name'] || row['player1_name'],
            email: row['Player1 Email'] || row['player1_email'],
            mobile: row['Player1 Mobile'] || row['player1_mobile'],
            coach: row['Coach'] || row['coach'],
            arena: row['Arena'] || row['arena']
          },
          player2: row['Player2 Name'] ? {
            name: row['Player2 Name'],
            email: row['Player2 Email'],
            mobile: row['Player2 Mobile']
          } : undefined,
          paymentStatus: (row['Payment Status'] || '').toLowerCase() === 'paid' ? 'verified' : 'pending',
          status: 'approved',
          entryMode: 'bulk'
        });
        results.success++;
      } catch (e) {
        results.failed++;
        results.errors.push(`Row ${results.success + results.failed}: ${e.message}`);
      }
    }
    res.json({ message: `Imported ${results.success} teams`, ...results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Organizer: Delete registration
router.delete('/:id', auth, async (req, res) => {
  try {
    await Registration.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
