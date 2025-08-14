const { Client } = require('pg');
require('dotenv').config();

// Database connection settings for initial setup
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Connect to default postgres database first
  user: 'postgres',
  password: '20EC62R19mS@',
};

async function setupDatabase() {
  const client = new Client(dbConfig);
  
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Create database if it doesn't exist
    console.log('Creating database...');
    await client.query(`
      SELECT 'CREATE DATABASE roxiler_store_rating'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'roxiler_store_rating')
    `);
    
    // Create database
    await client.query('CREATE DATABASE roxiler_store_rating');
    console.log('Database created successfully!');
    
    // Close connection to postgres database
    await client.end();
    
    // Connect to our new database
    const newDbConfig = {
      ...dbConfig,
      database: 'roxiler_store_rating'
    };
    
    const newClient = new Client(newDbConfig);
    await newClient.connect();
    console.log('Connected to roxiler_store_rating database');
    
    // Run schema
    console.log('Running database schema...');
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await newClient.query(schema);
    console.log('Schema created successfully!');
    
    // Insert initial admin user
    console.log('Creating initial admin user...');
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    await newClient.query(`
      INSERT INTO users (id, name, email, password_hash, address, role) 
      VALUES (
        gen_random_uuid(), 
        'System Administrator', 
        'admin@roxiler.com', 
        $1, 
        '123 Admin Street, Admin City, AC 12345, USA', 
        'system_administrator'
      ) ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);
    
    console.log('Admin user created!');
    console.log('Email: admin@roxiler.com');
    console.log('Password: admin123');
    
    await newClient.end();
    console.log('Database setup completed successfully! 🎉');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    if (error.code === '42P04') {
      console.log('Database already exists, continuing with schema...');
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
