const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('Database schema created successfully!');
    
    // Insert some sample data for testing
    await insertSampleData();
    
    console.log('Sample data inserted successfully!');
    console.log('Database initialization completed!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function insertSampleData() {
  try {
    // Insert sample stores
    const sampleStores = [
      {
        name: 'Tech Gadgets Store',
        email: 'tech@example.com',
        address: '123 Technology Street, Innovation City, IC 12345, United States of America',
        owner_id: null // Will be updated after creating store owner
      },
      {
        name: 'Fashion Boutique',
        email: 'fashion@example.com',
        address: '456 Style Avenue, Fashion District, FD 67890, United States of America',
        owner_id: null
      },
      {
        name: 'Book Haven',
        email: 'books@example.com',
        address: '789 Knowledge Road, Learning Town, LT 11111, United States of America',
        owner_id: null
      }
    ];

    // Insert sample normal users
    const sampleUsers = [
      {
        name: 'John Smith Johnson Williams Brown',
        email: 'john.smith@example.com',
        address: '321 Customer Lane, User City, UC 22222, United States of America',
        role: 'normal_user'
      },
      {
        name: 'Sarah Davis Miller Wilson Taylor',
        email: 'sarah.davis@example.com',
        address: '654 Shopper Street, Buyer Town, BT 33333, United States of America',
        role: 'normal_user'
      }
    ];

    // Insert sample store owners
    const sampleStoreOwners = [
      {
        name: 'Michael Chen Rodriguez Martinez',
        email: 'michael.chen@example.com',
        address: '987 Business Boulevard, Commerce City, CC 44444, United States of America',
        role: 'store_owner'
      },
      {
        name: 'Emily Thompson Anderson Jackson',
        email: 'emily.thompson@example.com',
        address: '147 Entrepreneur Way, Startup Street, SS 55555, United States of America',
        role: 'store_owner'
      }
    ];

    // Insert users first
    for (const user of [...sampleUsers, ...sampleStoreOwners]) {
      const passwordHash = '$2a$10$sample.hash.placeholder.change.in.production';
      await pool.query(
        'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user.name, user.email, passwordHash, user.address, user.role]
      );
    }

    // Get store owner IDs
    const storeOwnerResult = await pool.query(
      'SELECT id FROM users WHERE role = $1 ORDER BY created_at',
      ['store_owner']
    );
    const storeOwnerIds = storeOwnerResult.rows.map(row => row.id);

    // Insert stores with owner IDs
    for (let i = 0; i < sampleStores.length; i++) {
      await pool.query(
        'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)',
        [sampleStores[i].name, sampleStores[i].email, sampleStores[i].address, storeOwnerIds[i]]
      );
    }

    // Get user and store IDs for ratings
    const usersResult = await pool.query('SELECT id FROM users WHERE role = $1', ['normal_user']);
    const storesResult = await pool.query('SELECT id FROM stores');
    
    const userIds = usersResult.rows.map(row => row.id);
    const storeIds = storesResult.rows.map(row => row.id);

    // Insert sample ratings
    const sampleRatings = [
      { user_id: userIds[0], store_id: storeIds[0], rating: 5, comment: 'Excellent service and products!' },
      { user_id: userIds[0], store_id: storeIds[1], rating: 4, comment: 'Great selection, friendly staff.' },
      { user_id: userIds[1], store_id: storeIds[0], rating: 4, comment: 'Good quality items.' },
      { user_id: userIds[1], store_id: storeIds[2], rating: 5, comment: 'Amazing book collection!' }
    ];

    for (const rating of sampleRatings) {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES ($1, $2, $3, $4)',
        [rating.user_id, rating.store_id, rating.rating, rating.comment]
      );
    }

    console.log('Sample data inserted successfully!');
    
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
