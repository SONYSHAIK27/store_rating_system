const dbUtils = require('./database/utils');

async function testCounts() {
  try {
    console.log('Testing getCounts function...\n');
    
    const counts = await dbUtils.getCounts();
    console.log('Counts returned:', counts);
    
    // Also test individual queries
    const { pool } = require('./config/database');
    
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const stores = await pool.query('SELECT COUNT(*) FROM stores');
    const ratings = await pool.query('SELECT COUNT(*) FROM ratings');
    
    console.log('\nRaw query results:');
    console.log('Users count:', users.rows[0].count);
    console.log('Stores count:', stores.rows[0].count);
    console.log('Ratings count:', ratings.rows[0].count);
    
  } catch (error) {
    console.error('Error testing counts:', error);
  } finally {
    const { pool } = require('./config/database');
    await pool.end();
  }
}

testCounts();
