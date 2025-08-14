const { pool } = require('./config/database');

async function changeUserRole() {
  try {
    console.log('Changing user role to store_owner...\n');
    
    // Change sonyshaik027@gmail.com from normal_user to store_owner
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING *',
      ['store_owner', 'sonyshaik027@gmail.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ User role updated successfully!');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`New Role: ${user.role}`);
      console.log(`Updated: ${user.updated_at}`);
    } else {
      console.log('❌ User not found or update failed');
    }
    
  } catch (error) {
    console.error('Error updating user role:', error);
  } finally {
    await pool.end();
  }
}

changeUserRole();
