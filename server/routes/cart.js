import express from 'express';
import { query } from '../db/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Get user's cart
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await query(
      `SELECT c.id, c.quantity, r.id as record_id, r.title, r.artist, r.price, r.image_url 
       FROM cart_items c
       JOIN records r ON c.record_id = r.id
       WHERE c.user_id = $1`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Add item to cart
router.post('/add', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { recordId, quantity = 1 } = req.body;
    
    // Check if record exists and has enough stock
    const recordResult = await query(
      'SELECT * FROM records WHERE id = $1',
      [recordId]
    );
    
    if (recordResult.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }
    
    const record = recordResult.rows[0];
    
    if (record.stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Check if item is already in cart
    const cartCheck = await query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND record_id = $2',
      [userId, recordId]
    );
    
    if (cartCheck.rows.length > 0) {
      // Update quantity if already in cart
      const newQuantity = cartCheck.rows[0].quantity + quantity;
      
      if (record.stock < newQuantity) {
        return res.status(400).json({ message: 'Not enough stock available' });
      }
      
      await query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND record_id = $3',
        [newQuantity, userId, recordId]
      );
    } else {
      // Add new item to cart
      await query(
        'INSERT INTO cart_items (user_id, record_id, quantity) VALUES ($1, $2, $3)',
        [userId, recordId, quantity]
      );
    }
    
    // Get updated cart
    const result = await query(
      `SELECT c.id, c.quantity, r.id as record_id, r.title, r.artist, r.price, r.image_url 
       FROM cart_items c
       JOIN records r ON c.record_id = r.id
       WHERE c.user_id = $1`,
      [userId]
    );
    
    res.status(201).json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Update cart item quantity
router.put('/update/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    
    // Check if cart item exists
    const cartItem = await query(
      'SELECT c.*, r.stock FROM cart_items c JOIN records r ON c.record_id = r.id WHERE c.id = $1 AND c.user_id = $2',
      [cartItemId, userId]
    );
    
    if (cartItem.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }
    
    // Check stock
    if (cartItem.rows[0].stock < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }
    
    // Update quantity
    await query(
      'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      [quantity, cartItemId, userId]
    );
    
    // Get updated cart
    const result = await query(
      `SELECT c.id, c.quantity, r.id as record_id, r.title, r.artist, r.price, r.image_url 
       FROM cart_items c
       JOIN records r ON c.record_id = r.id
       WHERE c.user_id = $1`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Remove item from cart
router.delete('/remove/:id', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    
    await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
      [cartItemId, userId]
    );
    
    // Get updated cart
    const result = await query(
      `SELECT c.id, c.quantity, r.id as record_id, r.title, r.artist, r.price, r.image_url 
       FROM cart_items c
       JOIN records r ON c.record_id = r.id
       WHERE c.user_id = $1`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Clear cart
router.delete('/clear', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;