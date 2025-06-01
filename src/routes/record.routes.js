const express = require('express');
const db = require('../database/connection');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Get all records with optional filtering and pagination
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM records';
    const params = [];
    const whereConditions = [];
    
    // Filter by genre if provided
    if (req.query.genre) {
      whereConditions.push(`genre = $${params.length + 1}`);
      params.push(req.query.genre);
    }
    
    // Filter by artist if provided
    if (req.query.artist) {
      whereConditions.push(`artist ILIKE $${params.length + 1}`);
      params.push(`%${req.query.artist}%`);
    }
    
    // Search by title if provided
    if (req.query.search) {
      whereConditions.push(`(title ILIKE $${params.length + 1} OR artist ILIKE $${params.length + 1})`);
      params.push(`%${req.query.search}%`);
    }
    
    // Add WHERE clause if filters are applied
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Add sorting
    const sortBy = req.query.sortBy || 'title';
    const sortDir = req.query.sortDir === 'desc' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${sortBy} ${sortDir}`;
    
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    // Execute query
    const result = await db.query(query, params);
    
    // Get total count for pagination
    const countResult = await db.query('SELECT COUNT(*) FROM records');
    const totalRecords = parseInt(countResult.rows[0].count);
    
    return res.status(200).json({
      success: true,
      data: {
        records: result.rows,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages: Math.ceil(totalRecords / limit)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching records:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching records'
    });
  }
});

// Get a single record by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM records WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Get reviews for the record
    const reviews = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, 
       u.first_name, u.last_name 
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.record_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    
    return res.status(200).json({
      success: true,
      data: {
        record: result.rows[0],
        reviews: reviews.rows
      }
    });
  } catch (err) {
    console.error('Error fetching record:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching record'
    });
  }
});

// Add a new review for a record
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  const { rating, comment } = req.body;
  
  try {
    // Check if record exists
    const recordResult = await db.query('SELECT * FROM records WHERE id = $1', [req.params.id]);
    
    if (recordResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Check if user already reviewed this record
    const existingReview = await db.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND record_id = $2',
      [req.user.id, req.params.id]
    );
    
    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this record'
      });
    }
    
    // Add the review
    await db.query(
      'INSERT INTO reviews (user_id, record_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [req.user.id, req.params.id, rating, comment]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (err) {
    console.error('Error adding review:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error adding review'
    });
  }
});

// Get featured records (e.g., newest releases, most popular)
router.get('/featured/list', async (req, res) => {
  try {
    // Get newest releases (last 5 added)
    const newest = await db.query(
      'SELECT * FROM records ORDER BY created_at DESC LIMIT 5'
    );
    
    // Get highest rated records
    const highestRated = await db.query(
      `SELECT r.*, COALESCE(AVG(rev.rating), 0) as avg_rating
       FROM records r
       LEFT JOIN reviews rev ON r.id = rev.record_id
       GROUP BY r.id
       ORDER BY avg_rating DESC
       LIMIT 5`
    );
    
    return res.status(200).json({
      success: true,
      data: {
        newest: newest.rows,
        highestRated: highestRated.rows
      }
    });
  } catch (err) {
    console.error('Error fetching featured records:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching featured records'
    });
  }
});

module.exports = router;