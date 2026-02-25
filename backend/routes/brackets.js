const express = require('express');
const Tournament = require('../models/Tournament');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');
const { generateBracket } = require('../utils/fixtureGenerator');
const router = express.Router();

// ─── Helper: find match across all rounds ─────────────────
function findMatch(bracket, matchId) {
  for (let ri = 0; ri < bracket.rounds.length; ri++) {
    for (let mi = 0; mi < bracket.rounds[ri].length; mi++) {
      if (bracket.rounds[ri][mi].id === matchId) {
        return { match: bracket.rounds[ri][mi], ri, mi };
      }
    }
  }
  return null;
}

// ─── Generate bracket ─────────────────────────────────────
router.post('/generate', auth, async (req, res) => {
  try {
    const { tournamentId, categoryId } = req.body;
    const tournament = await Tournament.findOne({ _id: tournamentId, organizer: req.user._id });
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    const category = tournament.categories.id(categoryId);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const regs = await Registration.find({ tournament: tournamentId, categoryName: category.name, status: 'approved' });
    if (regs.length < 2) return res.status(400).json({ error: 'Need at least 2 approved teams' });

    const teams = regs.map(r => ({
      id: r._id.toString(),
      name: r.teamName || r.player1.name,
      player1: r.player1,
      player2: r.player2
    }));

    const bracket = generateBracket(teams, category.rules);
    category.bracket = bracket;
    category.bracketGenerated = true;
    tournament.markModified('categories');
    await tournament.save();
    res.json({ message: 'Bracket generated!', bracket, totalTeams: teams.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Get bracket (public) ─────────────────────────────────
router.get('/:tournamentId/:categoryId', async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.tournamentId);
    if (!t) return res.status(404).json({ error: 'Not found' });
    const cat = t.categories.id(req.params.categoryId);
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: cat.name, bracket: cat.bracket, generated: cat.bracketGenerated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Schedule match (set court, time) ─────────────────────
router.put('/match/schedule', auth, async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, courtNumber, scheduledTime } = req.body;
    const tournament = await Tournament.findOne({ _id: tournamentId, organizer: req.user._id });
    if (!tournament) return res.status(403).json({ error: 'Forbidden' });
    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });
    found.match.courtNumber = courtNumber;
    found.match.scheduledTime = scheduledTime;
    found.match.status = 'scheduled';
    tournament.markModified('categories');
    await tournament.save();
    res.json({ message: 'Match scheduled', bracket: category.bracket });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Initiate toss (organizer/umpire starts pre-match flow) ─
router.put('/match/toss-init', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, umpireCode, courtNumber } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    const validCode = tournament.umpireAccessCode === umpireCode?.toUpperCase();
    if (!validCode) return res.status(403).json({ error: 'Invalid umpire code' });
    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    found.match.status = 'toss';
    found.match.courtNumber = courtNumber || found.match.courtNumber || '1';
    found.match.toss = {
      completed: false,
      winner: null,         // 'team1' | 'team2'
      winnerChoice: null,   // 'serve' | 'receive' | 'side'
      loserChoice: null,
      team1Side: null,      // 'left' | 'right'
      team2Side: null,
      firstServer: null,    // 'team1' | 'team2'
      firstReceiver: null
    };
    found.match.startTime = null;
    found.match.endTime = null;
    found.match.scores = [];
    found.match.currentSet = 0;
    found.match.currentScore = { team1: 0, team2: 0 };
    found.match.server = null;
    found.match.scoreHistory = [];

    tournament.markModified('categories');
    await tournament.save();
    res.json({ message: 'Toss initiated', match: found.match, bracket: category.bracket });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Record toss result ───────────────────────────────────
// Step 1: toss winner decided externally (coin flip), umpire records who won
router.put('/match/toss-result', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, umpireCode, tossWinner } = req.body;
    // tossWinner: 'team1' | 'team2'
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    if (tournament.umpireAccessCode !== umpireCode?.toUpperCase()) return res.status(403).json({ error: 'Invalid code' });
    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    found.match.toss.winner = tossWinner;
    found.match.toss.step = 'winner_choice'; // next step: winner picks serve/receive/side
    tournament.markModified('categories');
    await tournament.save();
    res.json({ match: found.match });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Toss winner makes choice ─────────────────────────────
// choice: 'serve' | 'receive' | 'side_left' | 'side_right'
router.put('/match/toss-choice', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, umpireCode, choice } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    if (tournament.umpireAccessCode !== umpireCode?.toUpperCase()) return res.status(403).json({ error: 'Invalid code' });
    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    const m = found.match;
    const loser = m.toss.winner === 'team1' ? 'team2' : 'team1';
    m.toss.winnerChoice = choice;

    if (choice === 'serve') {
      m.toss.firstServer = m.toss.winner;
      m.toss.firstReceiver = loser;
      m.toss.step = 'loser_side'; // loser picks side
    } else if (choice === 'receive') {
      m.toss.firstServer = loser;
      m.toss.firstReceiver = m.toss.winner;
      m.toss.step = 'loser_side';
    } else if (choice === 'side_left') {
      m.toss.team1Side = m.toss.winner === 'team1' ? 'left' : 'right';
      m.toss.team2Side = m.toss.winner === 'team1' ? 'right' : 'left';
      m.toss.step = 'loser_serve'; // loser picks serve/receive
    } else if (choice === 'side_right') {
      m.toss.team1Side = m.toss.winner === 'team1' ? 'right' : 'left';
      m.toss.team2Side = m.toss.winner === 'team1' ? 'left' : 'right';
      m.toss.step = 'loser_serve';
    }

    tournament.markModified('categories');
    await tournament.save();
    res.json({ match: found.match });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Loser makes their choice ─────────────────────────────
router.put('/match/toss-loser-choice', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, umpireCode, choice } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    if (tournament.umpireAccessCode !== umpireCode?.toUpperCase()) return res.status(403).json({ error: 'Invalid code' });
    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    const m = found.match;
    const loser = m.toss.winner === 'team1' ? 'team2' : 'team1';
    m.toss.loserChoice = choice;

    if (m.toss.step === 'loser_side') {
      // Loser picks side
      if (choice === 'left') {
        m.toss.team1Side = loser === 'team1' ? 'left' : 'right';
        m.toss.team2Side = loser === 'team1' ? 'right' : 'left';
      } else {
        m.toss.team1Side = loser === 'team1' ? 'right' : 'left';
        m.toss.team2Side = loser === 'team1' ? 'left' : 'right';
      }
    } else if (m.toss.step === 'loser_serve') {
      // Loser picks serve/receive
      if (choice === 'serve') {
        m.toss.firstServer = loser;
        m.toss.firstReceiver = m.toss.winner;
      } else {
        m.toss.firstServer = m.toss.winner;
        m.toss.firstReceiver = loser;
      }
    }

    m.toss.completed = true;
    m.toss.step = 'ready';
    tournament.markModified('categories');
    await tournament.save();
    res.json({ match: found.match });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Start Match (after toss) ─────────────────────────────
router.put('/match/start', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, umpireCode } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    const isOrganizer = req.headers.authorization && true; // simplified – toss handles auth via code
    const validCode = tournament.umpireAccessCode === umpireCode?.toUpperCase();
    // Allow if valid umpire code OR if it's the organizer (checked separately)
    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    const m = found.match;
    if (!m.toss?.completed && !m.toss?.firstServer) {
      // Auto-assign if toss skipped
      m.toss = m.toss || {};
      m.toss.firstServer = 'team1';
      m.toss.team1Side = 'left';
      m.toss.team2Side = 'right';
    }

    m.status = 'live';
    m.startTime = new Date();
    m.server = m.toss?.firstServer || 'team1';
    m.currentSet = 0;
    m.currentScore = { team1: 0, team2: 0 };
    m.scores = [];
    m.scoreHistory = [];

    // Set sides for set 1
    m.sides = {
      team1: m.toss?.team1Side || 'left',
      team2: m.toss?.team2Side || 'right'
    };

    tournament.markModified('categories');
    await tournament.save();
    res.json({ message: 'Match started!', match: m, bracket: category.bracket });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Score a point ────────────────────────────────────────
router.put('/match/score', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, scorer, umpireCode } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    if (tournament.umpireAccessCode !== umpireCode?.toUpperCase()) return res.status(403).json({ error: 'Invalid umpire code' });

    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    const m = found.match;
    if (m.status !== 'live') return res.status(400).json({ error: 'Match not live' });

    const rules = m.rules || { pointsPerSet: 21, deuce: true, maxCap: 30, bestOf: 3 };
    const pointsNeeded = rules.pointsPerSet || 21;
    const maxCap = rules.maxCap || 30;
    const bestOf = rules.bestOf || 3;

    // In badminton: server scores → server keeps serve. Non-server scores → become new server.
    const prevServer = m.server;

    // Track history for undo
    if (!m.scoreHistory) m.scoreHistory = [];
    m.scoreHistory.push({
      server: m.server,
      currentScore: { ...m.currentScore },
      currentSet: m.currentSet,
      scoresSnapshot: JSON.parse(JSON.stringify(m.scores || []))
    });
    if (m.scoreHistory.length > 100) m.scoreHistory.shift();

    // Add point — scorer always becomes server (BWF rally point rule)
    m.currentScore[scorer]++;
    m.server = scorer; // scorer becomes server

    const t1 = m.currentScore.team1;
    const t2 = m.currentScore.team2;

    // Check set end
    let setWon = false;
    const leading = t1 > t2 ? 'team1' : 'team2';
    const diff = Math.abs(t1 - t2);

    if (rules.goldenPoint && t1 >= pointsNeeded && t2 >= pointsNeeded) {
      setWon = true; // golden point - first to score at deuce wins set
    } else if (Math.max(t1, t2) >= maxCap) {
      setWon = true; // cap reached
    } else if (Math.max(t1, t2) >= pointsNeeded && diff >= 2) {
      setWon = true; // normal win or deuce cleared
    } else if (!rules.deuce && Math.max(t1, t2) >= pointsNeeded) {
      setWon = true; // no deuce rule
    }

    if (setWon) {
      if (!m.scores) m.scores = [];
      m.scores.push({ team1: t1, team2: t2, winner: leading });
      m.currentSet++;
      m.currentScore = { team1: 0, team2: 0 };

      const t1Sets = m.scores.filter(s => s.winner === 'team1').length;
      const t2Sets = m.scores.filter(s => s.winner === 'team2').length;
      const setsToWin = Math.ceil(bestOf / 2);

      // Check match winner
      if (t1Sets >= setsToWin || t2Sets >= setsToWin) {
        m.status = 'completed';
        m.endTime = new Date();
        m.winner = t1Sets > t2Sets ? m.team1 : m.team2;

        // Advance winner to next round
        if (m.nextMatchId) {
          for (const round of category.bracket.rounds) {
            const nextMatch = round.find(nm => nm.id === m.nextMatchId);
            if (nextMatch) {
              if (nextMatch.sourceMatch1 === matchId) nextMatch.team1 = m.winner;
              else nextMatch.team2 = m.winner;
              if (nextMatch.team1IsBye && nextMatch.team2) { nextMatch.winner = nextMatch.team2; nextMatch.status = 'completed'; }
              if (nextMatch.team2IsBye && nextMatch.team1) { nextMatch.winner = nextMatch.team1; nextMatch.status = 'completed'; }
              break;
            }
          }
        }
      } else {
        // New set: sides switch (BWF rule). In 3rd set, sides switch at 11 points
        const sides = m.sides || { team1: 'left', team2: 'right' };
        m.sides = { team1: sides.team1 === 'left' ? 'right' : 'left', team2: sides.team2 === 'left' ? 'right' : 'left' };

        // Server of new set = winner of last set (BWF rule)
        m.server = leading;
        m.thirdSetSwitchDone = false;
      }
    }

    // 3rd set side switch at 11 points (BWF regulation)
    if (m.currentSet === 2 && !m.thirdSetSwitchDone) {
      const maxScore = Math.max(m.currentScore.team1, m.currentScore.team2);
      if (maxScore >= 11) {
        m.thirdSetSwitchDone = true;
        const sides = m.sides || { team1: 'left', team2: 'right' };
        m.sides = { team1: sides.team1 === 'left' ? 'right' : 'left', team2: sides.team2 === 'left' ? 'right' : 'left' };
        m.midSetSwitch = true;
      }
    } else {
      m.midSetSwitch = false;
    }

    tournament.markModified('categories');
    await tournament.save();
    res.json({ match: m, bracket: category.bracket });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Undo last point ─────────────────────────────────────
router.put('/match/undo', async (req, res) => {
  try {
    const { tournamentId, categoryId, matchId, umpireCode } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Not found' });
    if (tournament.umpireAccessCode !== umpireCode?.toUpperCase()) return res.status(403).json({ error: 'Invalid code' });

    const category = tournament.categories.id(categoryId);
    const found = findMatch(category.bracket, matchId);
    if (!found) return res.status(404).json({ error: 'Match not found' });

    const m = found.match;
    if (!m.scoreHistory || m.scoreHistory.length === 0) return res.status(400).json({ error: 'Nothing to undo' });

    const prev = m.scoreHistory.pop();
    m.server = prev.server;
    m.currentScore = prev.currentScore;
    m.currentSet = prev.currentSet;
    m.scores = prev.scoresSnapshot;
    m.status = 'live';

    tournament.markModified('categories');
    await tournament.save();
    res.json({ match: m, bracket: category.bracket });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Umpire lookup by code ────────────────────────────────
router.post('/umpire/lookup', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    const tournament = await Tournament.findOne({ umpireAccessCode: code.trim().toUpperCase() });
    if (!tournament) return res.status(404).json({ error: 'No tournament found for this code. Check with your organizer.' });

    const matches = [];
    for (const cat of tournament.categories) {
      if (!cat.bracket?.rounds) continue;
      for (const round of cat.bracket.rounds) {
        for (const match of round) {
          if (!match.team1IsBye && !match.team2IsBye && match.team1 && match.team2) {
            matches.push({
              ...match,
              categoryId: cat._id,
              categoryName: cat.name,
              tournamentId: tournament._id,
              tournamentName: tournament.name
            });
          }
        }
      }
    }

    // Sort: live first, then scheduled, then pending, then completed
    const order = { live: 0, toss: 1, scheduled: 2, pending: 3, completed: 4 };
    matches.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3));

    res.json({
      tournament: { id: tournament._id, name: tournament.name, venue: tournament.venue, umpireAccessCode: tournament.umpireAccessCode },
      matches,
      categories: tournament.categories.map(c => ({ _id: c._id, name: c.name, bracketGenerated: c.bracketGenerated }))
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Get umpire code (organizer) ─────────────────────────
router.get('/:tournamentId/umpire-code', auth, async (req, res) => {
  try {
    const t = await Tournament.findOne({ _id: req.params.tournamentId, organizer: req.user._id });
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json({ umpireAccessCode: t.umpireAccessCode });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
