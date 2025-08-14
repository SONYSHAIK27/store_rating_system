const jwt = require('jsonwebtoken');
const { getOne } = require('../config/database');

// Check if user is logged in
const requireAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getOne('SELECT id, name, email, role FROM users WHERE id = $1', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'system_administrator') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is store owner
const requireStoreOwner = (req, res, next) => {
  if (req.user.role !== 'store_owner') {
    return res.status(403).json({ error: 'Store owner access required' });
  }
  next();
};

// Check if user is normal user or admin
const requireUserOrAdmin = (req, res, next) => {
  if (req.user.role !== 'normal_user' && req.user.role !== 'system_administrator') {
    return res.status(403).json({ error: 'User access required' });
  }
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireStoreOwner,
  requireUserOrAdmin
};
