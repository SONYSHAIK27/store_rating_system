const { pool } = require('../config/database');

// Simple database helper functions
const dbUtils = {
  
  // Get basic counts for admin dashboard
  async getCounts() {
    try {
      const users = await pool.query('SELECT COUNT(*) FROM users');
      const stores = await pool.query('SELECT COUNT(*) FROM stores');
      const ratings = await pool.query('SELECT COUNT(*) FROM ratings');
      
      return {
        users: parseInt(users.rows[0].count),
        stores: parseInt(stores.rows[0].count),
        ratings: parseInt(ratings.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting counts:', error);
      throw error;
    }
  },

  // Get stores with basic rating info
  async getStores(filters = {}) {
    try {
                   let sql = `
               SELECT s.*, 
                      COALESCE(AVG(r.rating), 0)::numeric as avg_rating,
                      COUNT(r.id) as rating_count
               FROM stores s
               LEFT JOIN ratings r ON s.id = r.store_id
             `;
      
      const params = [];
      let paramCount = 0;

      // Simple filter logic
      if (filters.name) {
        paramCount++;
        sql += ` WHERE s.name ILIKE $${paramCount}`;
        params.push(`%${filters.name}%`);
      }

      if (filters.email) {
        paramCount++;
        const whereClause = paramCount === 1 ? ' WHERE' : ' AND';
        sql += `${whereClause} s.email ILIKE $${paramCount}`;
        params.push(`%${filters.email}%`);
      }

      sql += ` GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at`;
      sql += ` ORDER BY s.created_at DESC`;

      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting stores:', error);
      throw error;
    }
  },

  // Get users list with store ratings for store owners
  async getUsers(filters = {}) {
    try {
      let sql = `
        SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
               CASE 
                 WHEN u.role = 'store_owner' THEN COALESCE(AVG(sr.rating), 0)::numeric
                 ELSE NULL
               END as store_rating,
               CASE 
                 WHEN u.role = 'store_owner' THEN COUNT(sr.id)
                 ELSE 0
               END as rating_count
        FROM users u
        LEFT JOIN stores s ON u.id = s.owner_id
        LEFT JOIN ratings sr ON s.id = sr.store_id
      `;
      const params = [];
      let paramCount = 0;

      if (filters.name) {
        paramCount++;
        sql += ` WHERE u.name ILIKE $${paramCount}`;
        params.push(`%${filters.name}%`);
      }

      if (filters.role) {
        paramCount++;
        const whereClause = paramCount === 1 ? ' WHERE' : ' AND';
        sql += `${whereClause} u.role = $${paramCount}`;
        params.push(filters.role);
      }

      sql += ' GROUP BY u.id, u.name, u.email, u.address, u.role, u.created_at';
      sql += ' ORDER BY u.created_at DESC';
      
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get ratings for a store owner
  async getStoreRatings(ownerId) {
    try {
      const sql = `
        SELECT r.rating, r.comment, r.created_at,
               u.name as user_name, u.email as user_email,
               s.name as store_name
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        WHERE s.owner_id = $1
        ORDER BY r.created_at DESC
      `;
      
      const result = await pool.query(sql, [ownerId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting store ratings:', error);
      throw error;
    }
  },

  // Get average rating for a store
  async getStoreRating(storeId) {
    try {
      const sql = `
        SELECT AVG(rating) as avg_rating, COUNT(*) as total
        FROM ratings 
        WHERE store_id = $1
      `;
      
      const result = await pool.query(sql, [storeId]);
      return {
        average: parseFloat(result.rows[0].avg_rating) || 0,
        total: parseInt(result.rows[0].total) || 0
      };
    } catch (error) {
      console.error('Error getting store rating:', error);
      throw error;
    }
  },

  // Check if user rated a store
  async getUserRating(userId, storeId) {
    try {
      const sql = 'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2';
      const result = await pool.query(sql, [userId, storeId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error checking user rating:', error);
      throw error;
    }
  },

  // Get stores for users to browse
  async getStoresForUsers(search = {}) {
    try {
      let sql = `
        SELECT s.*, 
               COALESCE(AVG(r.rating), 0)::numeric as rating,
               COUNT(r.id) as rating_count
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
      `;
      
      const params = [];
      let paramCount = 0;

      if (search.name) {
        paramCount++;
        sql += ` WHERE s.name ILIKE $${paramCount}`;
        params.push(`%${search.name}%`);
      }

      if (search.address) {
        paramCount++;
        const whereClause = paramCount === 1 ? ' WHERE' : ' AND';
        sql += `${whereClause} s.address ILIKE $${paramCount}`;
        params.push(`%${search.address}%`);
      }

      sql += ` GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at`;
      sql += ` ORDER BY s.name`;

      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting stores for users:', error);
      throw error;
    }
  }
};

module.exports = dbUtils;
