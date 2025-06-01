const express = require('express');
const db = require('../database/connection');
const { isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const router = express.Router();

// Apply admin middleware to all routes
router.use(isAdmin);

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (ext && mimetype) {
      return cb(null, true);
    }
    
    cb(new Error('Only image files are allowed'));
  }
});

// Get all records (with more detailed info for admin)
router.get('/records', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM records ORDER BY title ASC');
    
    return res.status(200).json({
      success: true,
      data: {
        records: result.rows
      }
    });
  } catch (err) {
    console.error('Error fetching records for admin:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching records'
    });
  }
});

// Add a new record
router.post('/records', upload.single('image'), async (req, res) => {
  const { title, artist, releaseYear, genre, price, stockQuantity, description } = req.body;
  
  try {
    let imageUrl = null;
    
    // If image was uploaded
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const result = await db.query(
      `INSERT INTO records 
       (title, artist, release_year, genre, price, stock_quantity, image_url, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, artist, releaseYear, genre, price, stockQuantity, imageUrl, description]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Record added successfully',
      data: {
        record: result.rows[0]
      }
    });
  } catch (err) {
    console.error('Error adding record:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error adding record'
    });
  }
});

// Update a record
router.put('/records/:id', upload.single('image'), async (req, res) => {
  const { title, artist, releaseYear, genre, price, stockQuantity, description } = req.body;
  
  try {
    // Check if record exists
    const recordExists = await db.query('SELECT * FROM records WHERE id = $1', [req.params.id]);
    
    if (recordExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    let imageUrl = recordExists.rows[0].image_url;
    
    // If new image was uploaded
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      
      // Delete old image if exists and is local
      if (recordExists.rows[0].image_url && !recordExists.rows[0].image_url.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '../../public', recordExists.rows[0].image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }
    
    const result = await db.query(
      `UPDATE records 
       SET title = $1, artist = $2, release_year = $3, genre = $4, 
       price = $5, stock_quantity = $6, image_url = $7, description = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [title, artist, releaseYear, genre, price, stockQuantity, imageUrl, description, req.params.id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: {
        record: result.rows[0]
      }
    });
  } catch (err) {
    console.error('Error updating record:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error updating record'
    });
  }
});

// Delete a record
router.delete('/records/:id', async (req, res) => {
  try {
    // Check if record exists
    const recordExists = await db.query('SELECT * FROM records WHERE id = $1', [req.params.id]);
    
    if (recordExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    // Delete image if it's a local file
    if (recordExists.rows[0].image_url && !recordExists.rows[0].image_url.startsWith('http')) {
      const imagePath = path.join(__dirname, '../../public', recordExists.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete record
    await db.query('DELETE FROM records WHERE id = $1', [req.params.id]);
    
    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting record:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting record'
    });
  }
});

// Get all orders (admin view)
router.get('/orders', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at,
       o.shipping_address, o.shipping_city, o.shipping_postal_code, o.shipping_country,
       u.email, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    
    return res.status(200).json({
      success: true,
      data: {
        orders: result.rows
      }
    });
  } catch (err) {
    console.error('Error fetching orders for admin:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Update order status
router.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }
  
  try {
    // Check if order exists
    const orderExists = await db.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    
    if (orderExists.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update status
    const result = await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        order: result.rows[0]
      }
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
});

// Get site statistics
router.get('/stats', async (req, res) => {
  try {
    // Get record count
    const recordsResult = await db.query('SELECT COUNT(*) FROM records');
    
    // Get user count
    const usersResult = await db.query('SELECT COUNT(*) FROM users');
    
    // Get order count and total sales
    const ordersResult = await db.query('SELECT COUNT(*), SUM(total_amount) FROM orders');
    
    // Get low stock records
    const lowStockResult = await db.query(
      'SELECT COUNT(*) FROM records WHERE stock_quantity < 5'
    );
    
    // Get recent orders
    const recentOrdersResult = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
       u.email, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );
    
    return res.status(200).json({
      success: true,
      data: {
        recordCount: parseInt(recordsResult.rows[0].count),
        userCount: parseInt(usersResult.rows[0].count),
        orderCount: parseInt(ordersResult.rows[0].count),
        totalSales: parseFloat(ordersResult.rows[0].sum || 0),
        lowStockCount: parseInt(lowStockResult.rows[0].count),
        recentOrders: recentOrdersResult.rows
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

module.exports = router;