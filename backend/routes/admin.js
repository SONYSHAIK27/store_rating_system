const express = require('express');
const bcrypt = require('bcryptjs');
const { query, getOne } = require('../config/database');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateUser, validateStore } = require('../middleware/validation');
const dbUtils = require('../database/utils');

const router = express.Router();

// All routes require admin access
router.use(requireAuth, requireAdmin);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await dbUtils.getCounts();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard stats' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    const filters = {};
    
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;
    if (role) filters.role = role;

    const users = await dbUtils.getUsers(filters);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Add new user
router.post('/users', validateUser, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    // Check if email already exists
    const existingUser = await getOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, address',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user details
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await getOne('SELECT id, name, email, address, role, created_at FROM users WHERE id = $1', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is store owner, get their store info
    if (user.role === 'store_owner') {
      const store = await getOne('SELECT name, email, address FROM stores WHERE owner_id = $1', [id]);
      if (store) {
        user.store = store;
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get all stores
router.get('/stores', async (req, res) => {
  try {
    const { name, email, address } = req.query;
    const filters = {};
    
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;

    const stores = await dbUtils.getStores(filters);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

// Add new store
router.post('/stores', validateStore, async (req, res) => {
  try {
    const { name, email, address, ownerEmail } = req.body;

    // Find store owner
    const owner = await getOne('SELECT id FROM users WHERE email = $1 AND role = $2', [ownerEmail, 'store_owner']);
    if (!owner) {
      return res.status(400).json({ error: 'Store owner not found' });
    }

    // Create store
    const result = await query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, address, owner.id]
    );

    res.status(201).json({
      message: 'Store created successfully',
      store: result.rows[0]
    });

  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Failed to create store' });
  }
});

module.exports = router;
