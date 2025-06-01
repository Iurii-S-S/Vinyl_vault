import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken, isAdmin);

// Get all records (for admin management)
router.get('/records', async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM records ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Add a new record
router.post('/records', async (req, res, next) => {
  try {
    const { title, artist, genre, year, price, stock, image_url, description } = req.body;
    
    const result = await query(
      `INSERT INTO records (title, artist, genre, year, price, stock, image_url, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, artist, genre, year, price, stock, image_url, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update a record
router.put('/records/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, genre, year, price, stock, image_url, description } = req.body;
    
    const result = await query(
      `UPDATE records 
       SET title = $1, artist = $2, genre = $3, year = $4, price = $5, 
           stock = $6, image_url = $7, description = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [title, artist, genre, year, price, stock, image_url, description, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete a record
router.delete('/records/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query('DELETE FROM records WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Get all orders (for admin)
router.get('/orders', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT o.*, u.username, u.email 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get order details
router.get('/orders/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get order
    const orderResult = await query(
      `SELECT o.*, u.username, u.email 
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Get order items
    const itemsResult = await query(
      `SELECT oi.*, r.title, r.artist, r.image_url 
       FROM order_items oi
       JOIN records r ON oi.record_id = r.id
       WHERE oi.order_id = $1`,
      [id]
    );
    
    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const result = await query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;