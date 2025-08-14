const express = require('express');
const { query, getOne } = require('../config/database');
const { requireAuth, requireUserOrAdmin } = require('../middleware/auth');
const { validateRating } = require('../middleware/validation');
const dbUtils = require('../database/utils');

const router = express.Router();

// Submit a rating
router.post('/', requireAuth, requireUserOrAdmin, validateRating, async (req, res) => {
  try {
    const { storeId, rating, comment } = req.body;
    const userId = req.user.id;

    // Check if store exists
    const store = await getOne('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if user already rated this store
    const existingRating = await dbUtils.getUserRating(userId, storeId);
    if (existingRating) {
      return res.status(400).json({ error: 'You already rated this store' });
    }

    // Create rating
    const result = await query(
      'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, storeId, rating, comment]
    );

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: result.rows[0]
    });

  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Update a rating
router.put('/:id', requireAuth, requireUserOrAdmin, validateRating, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if rating exists and belongs to user
    const existingRating = await getOne('SELECT * FROM ratings WHERE id = $1', [id]);
    if (!existingRating) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    if (existingRating.user_id !== userId && req.user.role !== 'system_administrator') {
      return res.status(403).json({ error: 'Not authorized to update this rating' });
    }

    // Update rating
    const result = await query(
      'UPDATE ratings SET rating = $1, comment = $2 WHERE id = $3 RETURNING *',
      [rating, comment, id]
    );

    res.json({
      message: 'Rating updated successfully',
      rating: result.rows[0]
    });

  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

// Get user's ratings
router.get('/user', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const ratings = await query(`
      SELECT r.*, s.name as store_name, s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(ratings.rows);
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});

// Get store ratings (for store owners)
router.get('/store/:storeId', requireAuth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user.id;

    // Check if user owns this store
    const store = await getOne('SELECT owner_id FROM stores WHERE id = $1', [storeId]);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    if (store.owner_id !== userId && req.user.role !== 'system_administrator') {
      return res.status(403).json({ error: 'Not authorized to view these ratings' });
    }

    const ratings = await query(`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
    `, [storeId]);

    res.json(ratings.rows);
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: 'Failed to get ratings' });
  }
});

module.exports = router;
