const express = require('express');
const { query, getOne } = require('../config/database');
const { requireAuth, requireAdmin, requireStoreOwner } = require('../middleware/auth');
const { validateStore } = require('../middleware/validation');
const dbUtils = require('../database/utils');

const router = express.Router();

// Get all stores (for normal users)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { name, address } = req.query;
    const search = {};
    
    if (name) search.name = name;
    if (address) search.address = address;

    const stores = await dbUtils.getStoresForUsers(search);
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

// Get stores with ratings (for admin)
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, address } = req.query;
    const filters = {};
    
    if (name) filters.name = name;
    if (email) filters.email = email;
    if (address) filters.address = address;

    const stores = await dbUtils.getStores(filters);
    res.json(stores);
  } catch (error) {
    console.error('Get admin stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

// Add new store (admin only)
router.post('/', requireAuth, requireAdmin, validateStore, async (req, res) => {
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

// Get store details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const store = await getOne(`
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM stores s
      JOIN users u ON s.owner_id = u.id
      WHERE s.id = $1
    `, [id]);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Get rating info
    const ratingInfo = await dbUtils.getStoreRating(id);
    store.rating = ratingInfo.average;
    store.total_ratings = ratingInfo.total;

    res.json(store);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to get store' });
  }
});

module.exports = router;
