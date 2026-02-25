// Permission check middleware
const checkPermission = (category, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Super admin bypasses all checks
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    // Check if user has the specific permission
    const hasPermission = req.user.permissions?.[category]?.[action];
    
    if (!hasPermission) {
      return res.status(403).json({ 
        error: 'Permission denied', 
        required: `${category}.${action}`,
        yourRole: req.user.role 
      });
    }
    
    next();
  };
};

// Organization check - ensure user belongs to the organization
const checkOrganization = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Super admin can access any org
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  // Get org from request (tournament, registration, etc.)
  const Tournament = require('../models/Tournament');
  const Organization = require('../models/Organization');
  
  let orgId = null;
  
  // Check different sources
  if (req.body.organizationId) {
    orgId = req.body.organizationId;
  } else if (req.params.tournamentId) {
    const tournament = await Tournament.findById(req.params.tournamentId);
    orgId = tournament?.organization;
  } else if (req.query.organizationId) {
    orgId = req.query.organizationId;
  }
  
  // If no org specified, use user's org
  if (!orgId) {
    orgId = req.user.organizationId;
  }
  
  // Check if user belongs to this org
  if (req.user.organizationId?.toString() !== orgId?.toString()) {
    return res.status(403).json({ error: 'Access denied to this organization' });
  }
  
  next();
};

// Role check - ensure user has minimum role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient role', 
        required: allowedRoles,
        yourRole: req.user.role 
      });
    }
    
    next();
  };
};

module.exports = { checkPermission, checkOrganization, requireRole };
