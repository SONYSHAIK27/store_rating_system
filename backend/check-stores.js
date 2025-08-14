const { pool } = require('./config/database');

async function checkStores() {
  try {
    console.log('Checking all stores in database...\n');
    
    const result = await pool.query('SELECT id, name, email, address, owner_id, created_at FROM stores ORDER BY created_at');
    
    if (result.rows.length === 0) {
      console.log('❌ No stores found in database!');
    } else {
      console.log(`✅ Found ${result.rows.length} stores:\n`);
      
      result.rows.forEach((store, index) => {
        console.log(`${index + 1}. ${store.name}`);
        console.log(`   Email: ${store.email}`);
        console.log(`   Address: ${store.address}`);
        console.log(`   Owner ID: ${store.owner_id}`);
        console.log(`   Created: ${store.created_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking stores:', error);
  } finally {
    await pool.end();
  }
}

checkStores();
