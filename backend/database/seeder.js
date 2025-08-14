const { pool } = require('../config/database');

// Simple function to seed database with test data
async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Clear old data first
    await pool.query('DELETE FROM ratings');
    await pool.query('DELETE FROM stores');
    await pool.query('DELETE FROM users WHERE role != $1', ['system_administrator']);
    
    console.log('Old data cleared');
    
    // Add test data
    await addTestUsers();
    await addTestStores();
    await addTestRatings();
    
    console.log('Database seeding completed!');
    
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}

// Add some test users
async function addTestUsers() {
  const users = [
    {
      name: 'John Smith Johnson Williams Brown',
      email: 'john@example.com',
      address: '123 Main Street, City, State 12345, USA',
      role: 'normal_user'
    },
    {
      name: 'Sarah Davis Miller Wilson Taylor',
      email: 'sarah@example.com',
      address: '456 Oak Avenue, Town, State 67890, USA',
      role: 'normal_user'
    },
    {
      name: 'Mike Chen Rodriguez Martinez',
      email: 'mike@example.com',
      address: '789 Business Road, District, State 11111, USA',
      role: 'store_owner'
    },
    {
      name: 'Emily Thompson Anderson Jackson',
      email: 'emily@example.com',
      address: '321 Commerce Lane, Plaza, State 22222, USA',
      role: 'store_owner'
    }
  ];

  for (const user of users) {
    const passwordHash = '$2a$10$sample.hash.placeholder.change.in.production';
    await pool.query(
      'INSERT INTO users (name, email, password_hash, address, role) VALUES ($1, $2, $3, $4, $5)',
      [user.name, user.email, passwordHash, user.address, user.role]
    );
  }
  
  console.log('Test users added');
}

// Add some test stores
async function addTestStores() {
  // Get store owner IDs
  const owners = await pool.query('SELECT id FROM users WHERE role = $1', ['store_owner']);
  
  const stores = [
    {
      name: 'Tech Store',
      email: 'tech@example.com',
      address: '123 Tech Street, Innovation City, IC 12345, USA'
    },
    {
      name: 'Fashion Shop',
      email: 'fashion@example.com',
      address: '456 Style Avenue, Fashion District, FD 67890, USA'
    },
    {
      name: 'Book Store',
      email: 'books@example.com',
      address: '789 Book Road, Reading Town, RT 11111, USA'
    }
  ];

  for (let i = 0; i < stores.length; i++) {
    const ownerId = owners.rows[i % owners.rows.length].id;
    await pool.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)',
      [stores[i].name, stores[i].email, stores[i].address, ownerId]
    );
  }
  
  console.log('Test stores added');
}

// Add some test ratings
async function addTestRatings() {
  // Get user and store IDs
  const users = await pool.query('SELECT id FROM users WHERE role = $1', ['normal_user']);
  const stores = await pool.query('SELECT id FROM stores');
  
  const ratings = [
    { user: users.rows[0].id, store: stores.rows[0].id, rating: 5, comment: 'Great store!' },
    { user: users.rows[0].id, store: stores.rows[1].id, rating: 4, comment: 'Good selection' },
    { user: users.rows[1].id, store: stores.rows[0].id, rating: 4, comment: 'Nice service' },
    { user: users.rows[1].id, store: stores.rows[2].id, rating: 5, comment: 'Amazing books!' }
  ];

  for (const rating of ratings) {
    await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [rating.user, rating.store, rating.rating, rating.comment]
    );
  }
  
  console.log('Test ratings added');
}

// Run seeder if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
