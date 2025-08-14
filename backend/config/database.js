const { Pool } = require('pg');
require('dotenv').config();

// Database connection settings
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'roxiler_store_rating',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create database pool
const pool = new Pool(dbConfig);

// Log when connected
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(-1);
});

// Simple helper functions
const db = {
  // Run a query
  async query(text, params) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Query:', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  },

  // Get one row
  async getOne(text, params) {
    const res = await pool.query(text, params);
    return res.rows[0];
  },

  // Get many rows
  async getMany(text, params) {
    const res = await pool.query(text, params);
    return res.rows;
  }
};

module.exports = {
  pool,
  ...db
};
