const { pool } = require('./config/database');

async function checkUsers() {
  try {
    console.log('Checking all users in database...\n');
    
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      console.log(`✅ Found ${result.rows.length} users:\n`);
      
      result.rows.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();
