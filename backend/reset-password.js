const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    console.log('Resetting store owner password...\n');
    
    // Set new password for sonyshaik027@gmail.com
    const newPassword = 'store123';
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING *',
      [passwordHash, 'sonyshaik027@gmail.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Password reset successfully!');
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`New Password: ${newPassword}`);
    } else {
      console.log('❌ User not found or update failed');
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await pool.end();
  }
}

resetPassword();
