const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ','');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user || !user.isActive)
  return res.status(401).json({ error: 'Account inactive or not found' });
    user.lastLogin = new Date(); await user.save();
    req.user = user;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
};

// Permission checker middleware factory
auth.require = (perm, getTournamentId) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const tid = getTournamentId ? getTournamentId(req) : req.params.tournamentId || req.body?.tournamentId;
  if (!req.user.hasPermission(perm, tid)) return res.status(403).json({ error: `Permission denied: ${perm}` });
  next();
};
module.exports = auth;
