const mongoose = require('mongoose');

// Generate unique 6-char alphanumeric code
function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const tournamentSchema = new mongoose.Schema({
  // Basic info
  name: { type: String, required: true },
  description: String,
  venue: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  organizerName: String,
  contactEmail: String,
  contactPhone: String,
  
  // Multi-tenant
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Collaborators with roles
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'staff', 'umpire'], default: 'staff' },
    addedAt: { type: Date, default: Date.now },
  }],
  
  // Status
  status: { type: String, enum: ['draft', 'upcoming', 'live', 'completed', 'cancelled'], default: 'draft' },
  
  // Payment
  requirePayment: { type: Boolean, default: false },
  entryFee: { type: Number, default: 0 },
  paymentDetails: String,
  
  // Access codes
  umpireAccessCode: { type: String, default: generateCode, unique: true },
  publicAccessCode: String, // optional - for private tournaments
  
  // Categories with fully customizable rules
  categories: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['singles', 'doubles', 'mixed'], required: true },
    gender: { type: String, enum: ['men', 'women', 'mixed'], required: true },
    ageGroup: { type: String, enum: ['open', 'u15', 'u17', 'u19', 'senior'], default: 'open' },
    
    // FULLY CUSTOMIZABLE RULES PER CATEGORY
    rules: {
      // Format type
      format: { type: String, enum: ['knockout', 'round_robin', 'group_knockout'], default: 'knockout' },
      
      // Knockout settings
      knockout: {
        singleElimination: { type: Boolean, default: true },
        doubleElimination: { type: Boolean, default: false },
        thirdPlaceMatch: { type: Boolean, default: false },
      },
      
      // Round robin settings (if format is round_robin or group_knockout)
      roundRobin: {
        groupCount: { type: Number, default: 2 },
        teamsAdvancePerGroup: { type: Number, default: 2 },
        pointsForWin: { type: Number, default: 2 },
        pointsForLoss: { type: Number, default: 0 },
        pointsForDraw: { type: Number, default: 1 },
      },
      
      // Match scoring rules
      bestOf: { type: Number, default: 3, min: 1, max: 5 }, // best of 1, 3, or 5 sets
      pointsPerSet: { type: Number, default: 21, min: 11, max: 30 },
      
      // Deuce rules
      deuce: { type: Boolean, default: true },
      deuceType: { 
        type: String, 
        enum: ['standard', 'golden_point', 'cap'], 
        default: 'standard' 
      },
      // standard: 2-point advantage needed (20-20 → 22-20)
      // golden_point: next point wins at deuce (29-29 → 30-29)
      // cap: hard cap at X points, no advantage needed
      
      goldenPoint: { type: Boolean, default: false }, // enable golden point at 29-29
      maxCap: { type: Number, default: 30 }, // hard cap
      pointAdvantage: { type: Number, default: 2 }, // points needed to win after deuce
      
      // Service rules (advanced)
      rallyPoint: { type: Boolean, default: true }, // true = BWF standard
      serveSideSwitch: { type: Boolean, default: true }, // switch sides every set
      midSetSwitch: { type: Boolean, default: true }, // switch at 11 in 3rd set
      midSetSwitchPoint: { type: Number, default: 11 },
      
      // Timeouts
      timeoutsPerSet: { type: Number, default: 0 }, // 0 = no timeouts
      timeoutDurationSec: { type: Number, default: 60 },
      
      // Intervals
      setBreakDurationSec: { type: Number, default: 120 },
      matchBreakDurationSec: { type: Number, default: 0 },
      
      // Walkover & Forfeit
      allowWalkover: { type: Boolean, default: true },
      walkoverAdvancesWinner: { type: Boolean, default: true },
      
      // Tiebreaker (for round robin)
      tiebreaker: [{
        type: String,
        enum: ['head_to_head', 'set_difference', 'point_difference', 'playoff'],
      }],
    },
    
    // Entry limits
    maxTeams: Number,
    minTeams: { type: Number, default: 2 },
    registrationDeadline: Date,
    
    // Prize money (optional)
    prizes: {
      winner: Number,
      runnerUp: Number,
      semifinalist: Number,
    },
    
    // Bracket
    bracket: mongoose.Schema.Types.Mixed,
    bracketGenerated: { type: Boolean, default: false },
    bracketGeneratedAt: Date,
    
  }],
  
  // Settings
  settings: {
    allowPublicRegistration: { type: Boolean, default: true },
    autoApproveRegistrations: { type: Boolean, default: false },
    enableLiveScoring: { type: Boolean, default: true },
    enablePublicBrackets: { type: Boolean, default: true },
    requirePaymentProof: { type: Boolean, default: true },
    notifyOnRegistration: { type: Boolean, default: true },
    notifyOnMatchStart: { type: Boolean, default: false },
  },
  
}, { timestamps: true });

// Regenerate umpire code if needed
tournamentSchema.methods.regenerateUmpireCode = function() {
  this.umpireAccessCode = generateCode();
  return this.save();
};

module.exports = mongoose.model('Tournament', tournamentSchema);
