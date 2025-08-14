// Simple validation functions
const validate = {
  // Check if email looks valid
  email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check password requirements
  password(password) {
    if (password.length < 8 || password.length > 16) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
    return true;
  },

  // Check name length
  name(name) {
    return name.length >= 20 && name.length <= 60;
  },

  // Check address length
  address(address) {
    return address.length <= 400;
  },

  // Check rating range
  rating(rating) {
    return rating >= 1 && rating <= 5;
  }
};

// Middleware to validate user registration
const validateUser = (req, res, next) => {
  const { name, email, password, address, role } = req.body;

  if (!name || !validate.name(name)) {
    return res.status(400).json({ error: 'Name must be 20-60 characters' });
  }

  if (!email || !validate.email(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!password || !validate.password(password)) {
    return res.status(400).json({ 
      error: 'Password must be 8-16 characters with uppercase and special character' 
    });
  }

  if (!address || !validate.address(address)) {
    return res.status(400).json({ error: 'Address too long' });
  }

  // Validate role
  const validRoles = ['normal_user', 'store_owner', 'system_administrator'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be normal_user, store_owner, or system_administrator' });
  }

  next();
};

// Middleware to validate rating
const validateRating = (req, res, next) => {
  const { rating } = req.body;

  if (!rating || !validate.rating(rating)) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }

  next();
};

// Middleware to validate store
const validateStore = (req, res, next) => {
  const { name, email, address } = req.body;

  if (!name || name.length < 3) {
    return res.status(400).json({ error: 'Store name too short' });
  }

  if (!email || !validate.email(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!address || !validate.address(address)) {
    return res.status(400).json({ error: 'Address too long' });
  }

  next();
};

module.exports = {
  validate,
  validateUser,
  validateRating,
  validateStore
};
