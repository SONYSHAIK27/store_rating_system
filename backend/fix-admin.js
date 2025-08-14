const { pool } = require('./config/database');
const bcrypt = require('bcryptjs');

async function fixAdminUser() {
  try {
    console.log('Fixing admin user...');
    
    // First, delete existing admin user if exists
    await pool.query("DELETE FROM users WHERE email = 'admin@roxiler.com'");
    console.log('Old admin user removed');
    
    // Create new admin user with correct password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await pool.query(`
      INSERT INTO users (id, name, email, password_hash, address, role) 
      VALUES (
        gen_random_uuid(), 
        'System Administrator', 
        'admin@roxiler.com', 
        $1, 
        '123 Admin Street, Admin City, AC 12345, USA', 
        'system_administrator'
      )
    `, [passwordHash]);
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@roxiler.com');
    console.log('Password: admin123');
    
    // Verify the user was created
    const result = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@roxiler.com']);
    console.log('User in database:', result.rows[0]);
    
  } catch (error) {
    console.error('Error fixing admin user:', error);
  } finally {
    await pool.end();
  }
}

fixAdminUser();
