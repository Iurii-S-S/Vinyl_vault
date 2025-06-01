-- Drop tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS records;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create records table
CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  artist VARCHAR(100) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  year INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, record_id)
);

-- Create orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO users (username, email, password_hash, is_admin) 
VALUES 
  ('admin', 'admin@vinylvault.com', '$2b$10$rIC/FU7VcJca2GHN6VeJkOZ5bRlEVgXSLqk9s5C0zt0qxcQFTvjnK', TRUE), -- password: admin123
  ('user1', 'user1@example.com', '$2b$10$W9Uj88DfgFcVvp.xJJnFmu.RhN0myM5CWbJl8H3mygz3BvjZOZSrO', FALSE); -- password: password123

INSERT INTO records (title, artist, genre, year, price, stock, image_url, description) 
VALUES 
  ('Kind of Blue', 'Miles Davis', 'Jazz', 1959, 29.99, 15, 'https://images.pexels.com/photos/1021876/pexels-photo-1021876.jpeg', 'One of the most influential jazz albums of all time.'),
  ('Thriller', 'Michael Jackson', 'Pop', 1982, 24.99, 20, 'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg', 'The best-selling album of all time, featuring iconic hits.'),
  ('Back in Black', 'AC/DC', 'Rock', 1980, 19.99, 10, 'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg', 'One of the best-selling hard rock albums ever made.'),
  ('The Dark Side of the Moon', 'Pink Floyd', 'Rock', 1973, 27.99, 12, 'https://images.pexels.com/photos/1694900/pexels-photo-1694900.jpeg', 'A progressive rock masterpiece exploring themes of conflict, greed, and mental illness.'),
  ('Blue Train', 'John Coltrane', 'Jazz', 1958, 22.99, 8, 'https://images.pexels.com/photos/164693/pexels-photo-164693.jpeg', 'A hard bop jazz album considered one of Coltrane's finest works.');