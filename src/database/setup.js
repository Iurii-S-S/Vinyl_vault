require('dotenv').config();
const db = require('./connection');

const createTables = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create records table
    await db.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255) NOT NULL,
        release_year INTEGER,
        genre VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        stock_quantity INTEGER NOT NULL,
        image_url VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create carts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create cart_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
        record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT NOT NULL,
        shipping_city VARCHAR(100) NOT NULL,
        shipping_postal_code VARCHAR(20) NOT NULL,
        shipping_country VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created successfully');

    // Insert some sample data
    await insertSampleData();
    
    console.log('Database setup completed successfully');
  } catch (err) {
    console.error('Error setting up database:', err);
    process.exit(1);
  }
};

const insertSampleData = async () => {
  // Insert sample admin user
  await db.query(`
    INSERT INTO users (email, password, first_name, last_name, is_admin)
    VALUES ('admin@vinylvault.com', '$2a$10$HKYn1JvZ6vG5eCbHPJYPReoKGOWWr7QZL25cWfXEzfnZ5LW15yNoa', 'Admin', 'User', TRUE)
    ON CONFLICT (email) DO NOTHING
  `);

  // Insert sample records
  const records = [
    ['Thriller', 'Michael Jackson', 1982, 'Pop', 29.99, 15, 'https://images.pexels.com/photos/6173888/pexels-photo-6173888.jpeg', 'The best-selling album of all time featuring hit singles like "Billie Jean" and "Beat It".'],
    ['Back in Black', 'AC/DC', 1980, 'Rock', 24.99, 10, 'https://images.pexels.com/photos/12430393/pexels-photo-12430393.jpeg', 'One of the best-selling albums worldwide, and a definitive hard rock album.'],
    ['Dark Side of the Moon', 'Pink Floyd', 1973, 'Progressive Rock', 34.99, 8, 'https://images.pexels.com/photos/4134167/pexels-photo-4134167.jpeg', 'A concept album exploring themes of conflict, greed, time, and mental illness.'],
    ['Abbey Road', 'The Beatles', 1969, 'Rock', 39.99, 5, 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg', 'The eleventh studio album by English rock band The Beatles.'],
    ['Blue Train', 'John Coltrane', 1958, 'Jazz', 45.99, 3, 'https://images.pexels.com/photos/6417923/pexels-photo-6417923.jpeg', 'Considered one of the greatest jazz albums of all time.']
  ];

  for (const record of records) {
    await db.query(`
      INSERT INTO records (title, artist, release_year, genre, price, stock_quantity, image_url, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, record);
  }

  console.log('Sample data inserted successfully');
};

createTables();