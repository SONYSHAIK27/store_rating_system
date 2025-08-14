const { pool } = require('./config/database');

async function checkIndividualRatings() {
  try {
    console.log('🔍 Checking individual rating details...\n');
    
    // Check all ratings with details
    const ratings = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as user_name, u.email as user_email,
             s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
    `);
    
    console.log(`📊 Total ratings found: ${ratings.rows.length}\n`);
    
    if (ratings.rows.length > 0) {
      console.log('📋 All ratings with details:');
      ratings.rows.forEach((rating, index) => {
        console.log(`${index + 1}. Rating: ${rating.rating}/5`);
        console.log(`   User: ${rating.user_name} (${rating.user_email})`);
        console.log(`   Store: ${rating.store_name}`);
        console.log(`   Comment: ${rating.comment || 'None'}`);
        console.log(`   Date: ${rating.created_at}`);
        console.log('   ---');
      });
    }
    
    // Check store1 specifically
    console.log('\n🏪 Checking store1 ratings specifically:');
    const store1Ratings = await pool.query(`
      SELECT r.rating, r.comment, r.created_at,
             u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.name = 'store1'
      ORDER BY r.created_at DESC
    `);
    
    store1Ratings.rows.forEach((rating, index) => {
      console.log(`   Rating ${index + 1}: ${rating.rating}/5 by ${rating.user_name} (${rating.user_email})`);
      console.log(`   Comment: ${rating.comment || 'None'}`);
      console.log(`   Date: ${rating.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking ratings:', error);
  } finally {
    await pool.end();
  }
}

checkIndividualRatings();
