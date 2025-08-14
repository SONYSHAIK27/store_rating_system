const express = require('express');
const bcrypt = require('bcryptjs');
const { query, getOne } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await getOne('SELECT id, name, email, address, role, created_at FROM users WHERE id = $1', [userId]);
    
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', validateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address } = req.body;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await getOne('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Update user
    const result = await query(
      'UPDATE users SET name = $1, email = $2, address = $3 WHERE id = $4 RETURNING id, name, email, address, role',
      [name, email, address, userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    // Get current password hash
    const user = await getOne('SELECT password_hash FROM users WHERE id = $1', [userId]);
    
    // Check current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user's stores (for store owners)
router.get('/stores', async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (req.user.role !== 'store_owner') {
      return res.status(403).json({ error: 'Store owner access required' });
    }

    // Get stores with ratings
    const stores = await query(`
      SELECT s.*, 
             COALESCE(AVG(r.rating), 0)::numeric as rating,
             COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at
      ORDER BY s.created_at DESC
    `, [userId]);
    
    res.json(stores.rows);

  } catch (error) {
    console.error('Get user stores error:', error);
    res.status(500).json({ error: 'Failed to get stores' });
  }
});

module.exports = router;
