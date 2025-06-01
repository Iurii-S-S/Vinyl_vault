import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// Get user's orders
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get order details by ID
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    // Get order
    const orderResult = await query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = orderResult.rows[0];
    
    // Get order items
    const itemsResult = await query(
      `SELECT oi.*, r.title, r.artist, r.image_url 
       FROM order_items oi
       JOIN records r ON oi.record_id = r.id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    
    res.json({
      ...order,
      items: itemsResult.rows
    });
  } catch (err) {
    next(err);
  }
});

// Create a new order
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress } = req.body;
    
    // Start transaction
    await query('BEGIN');
    
    // Get cart items
    const cartResult = await query(
      `SELECT c.*, r.price, r.stock, r.title 
       FROM cart_items c
       JOIN records r ON c.record_id = r.id
       WHERE c.user_id = $1`,
      [userId]
    );
    
    if (cartResult.rows.length === 0) {
      await query('ROLLBACK');
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Check stock availability
    for (const item of cartResult.rows) {
      if (item.stock < item.quantity) {
        await query('ROLLBACK');
        return res.status(400).json({ 
          message: `Not enough stock for "${item.title}". Available: ${item.stock}`
        });
      }
    }
    
    // Calculate total
    const totalAmount = cartResult.rows.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    
    // Create order
    const orderResult = await query(
      `INSERT INTO orders (user_id, total_amount, shipping_address) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, totalAmount, shippingAddress]
    );
    
    const order = orderResult.rows[0];
    
    // Create order items and update stock
    for (const item of cartResult.rows) {
      // Add to order items
      await query(
        `INSERT INTO order_items (order_id, record_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.record_id, item.quantity, item.price]
      );
      
      // Update stock
      await query(
        `UPDATE records SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.record_id]
      );
    }
    
    // Clear cart
    await query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    
    // Commit transaction
    await query('COMMIT');
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    await query('ROLLBACK');
    next(err);
  }
});

export default router;