import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Get all records with optional filtering
router.get('/', async (req, res, next) => {
  try {
    const { genre, artist, minPrice, maxPrice, search } = req.query;
    
    let queryText = 'SELECT * FROM records WHERE 1=1';
    const queryParams = [];
    
    // Add filters if provided
    if (genre) {
      queryParams.push(genre);
      queryText += ` AND genre = $${queryParams.length}`;
    }
    
    if (artist) {
      queryParams.push(artist);
      queryText += ` AND artist = $${queryParams.length}`;
    }
    
    if (minPrice) {
      queryParams.push(parseFloat(minPrice));
      queryText += ` AND price >= $${queryParams.length}`;
    }
    
    if (maxPrice) {
      queryParams.push(parseFloat(maxPrice));
      queryText += ` AND price <= $${queryParams.length}`;
    }
    
    if (search) {
      queryParams.push(`%${search}%`);
      queryText += ` AND (title ILIKE $${queryParams.length} OR artist ILIKE $${queryParams.length})`;
    }
    
    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, queryParams);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get a single record by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM records WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Get unique genres for filtering
router.get('/filters/genres', async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT genre FROM records ORDER BY genre');
    res.json(result.rows.map(row => row.genre));
  } catch (err) {
    next(err);
  }
});

// Get unique artists for filtering
router.get('/filters/artists', async (req, res, next) => {
  try {
    const result = await query('SELECT DISTINCT artist FROM records ORDER BY artist');
    res.json(result.rows.map(row => row.artist));
  } catch (err) {
    next(err);
  }
});

export default router;