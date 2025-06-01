import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Create a new Pool instance using environment variables from .env
const pool = new Pool({
  // These values come from .env automatically via process.env
  // No need to hardcode connection details
});

// Helper function to run SQL queries
export const query = (text, params) => {
  return pool.query(text, params);
};

// Export the pool for direct use if needed
export default pool;