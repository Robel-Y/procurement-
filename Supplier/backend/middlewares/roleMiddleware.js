// Role-based access control middleware

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied',
        error: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'User not authenticated'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied',
      error: 'Admin access only'
    });
  }

  next();
};

const userOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'User not authenticated'
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({ 
      message: 'Access denied',
      error: 'User access only'
    });
  }

  next();
};

const adminOrSelf = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      error: 'User not authenticated'
    });
  }

  const targetUserId = req.params.id || req.params.userId;
  
  if (req.user.role === 'admin' || req.user._id.toString() === targetUserId) {
    next();
  } else {
    return res.status(403).json({ 
      message: 'Access denied',
      error: 'You can only access your own resources or be an admin'
    });
  }
};

module.exports = {
  requireRole,
  adminOnly,
  userOnly,
  adminOrSelf
};
