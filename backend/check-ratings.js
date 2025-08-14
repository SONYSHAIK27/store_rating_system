const { pool } = require('./config/database');

async function checkRatings() {
  try {
    console.log('🔍 Checking all ratings in database...\n');
    
    // Check all ratings
    const ratings = await pool.query('SELECT * FROM ratings');
    console.log(`📊 Total ratings found: ${ratings.rows.length}`);
    
    if (ratings.rows.length > 0) {
      console.log('\n📋 All ratings:');
      ratings.rows.forEach((rating, index) => {
        console.log(`${index + 1}. Rating: ${rating.rating}/5, Store ID: ${rating.store_id}, User ID: ${rating.user_id}, Comment: ${rating.comment || 'None'}`);
      });
    }
    
    // Check stores
    const stores = await pool.query('SELECT * FROM stores');
    console.log(`\n🏪 Total stores found: ${stores.rows.length}`);
    
    if (stores.rows.length > 0) {
      console.log('\n📋 All stores:');
      stores.rows.forEach((store, index) => {
        console.log(`${index + 1}. Store: ${store.name}, ID: ${store.id}, Owner ID: ${store.owner_id}`);
      });
    }
    
    // Check users
    const users = await pool.query('SELECT * FROM users');
    console.log(`\n👥 Total users found: ${users.rows.length}`);
    
    if (users.rows.length > 0) {
      console.log('\n📋 All users:');
      users.rows.forEach((user, index) => {
        console.log(`${index + 1}. User: ${user.name}, Email: ${user.email}, Role: ${user.role}, ID: ${user.id}`);
      });
    }
    
    // Check specific store ratings
    console.log('\n🔍 Checking ratings for specific stores...');
    const storeRatings = await pool.query(`
      SELECT s.name as store_name, s.id as store_id, 
             COALESCE(AVG(r.rating), 0) as avg_rating,
             COUNT(r.id) as rating_count
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name
    `);
    
    storeRatings.rows.forEach(store => {
      console.log(`🏪 ${store.store_name} (ID: ${store.store_id}): ${store.avg_rating}/5 (${store.rating_count} ratings)`);
    });
    
  } catch (error) {
    console.error('❌ Error checking ratings:', error);
  } finally {
    await pool.end();
  }
}

checkRatings();
