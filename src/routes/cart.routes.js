const express = require('express');
const db = require('../database/connection');

const router = express.Router();

// Get user's cart
router.get('/', async (req, res) => {
  try {
    // Get or create user's cart
    let cartResult = await db.query('SELECT * FROM carts WHERE user_id = $1', [req.user.id]);
    
    if (cartResult.rows.length === 0) {
      // Create new cart if it doesn't exist
      cartResult = await db.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *', 
        [req.user.id]
      );
    }
    
    const cartId = cartResult.rows[0].id;
    
    // Get cart items with record details
    const cartItemsResult = await db.query(
      `SELECT ci.id, ci.quantity, ci.record_id, 
       r.title, r.artist, r.price, r.image_url
       FROM cart_items ci
       JOIN records r ON ci.record_id = r.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    
    // Calculate total
    const total = cartItemsResult.rows.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity), 
      0
    );
    
    return res.status(200).json({
      success: true,
      data: {
        cartId: cartId,
        items: cartItemsResult.rows,
        itemCount: cartItemsResult.rows.length,
        total: total.toFixed(2)
      }
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching cart'
    });
  }
});

// Add item to cart
router.post('/items', async (req, res) => {
  const { recordId, quantity = 1 } = req.body;
  
  try {
    // Validate record exists and has enough stock
    const recordResult = await db.query(
      'SELECT * FROM records WHERE id = $1', 
      [recordId]
    );
    
    if (recordResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    const record = recordResult.rows[0];
    
    if (record.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Not enough stock available'
      });
    }
    
    // Get or create user's cart
    let cartResult = await db.query('SELECT * FROM carts WHERE user_id = $1', [req.user.id]);
    
    if (cartResult.rows.length === 0) {
      // Create new cart if it doesn't exist
      cartResult = await db.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *', 
        [req.user.id]
      );
    }
    
    const cartId = cartResult.rows[0].id;
    
    // Check if item already in cart
    const existingItem = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = $1 AND record_id = $2',
      [cartId, recordId]
    );
    
    if (existingItem.rows.length > 0) {
      // Update quantity if item already exists
      await db.query(
        'UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item to cart
      await db.query(
        'INSERT INTO cart_items (cart_id, record_id, quantity) VALUES ($1, $2, $3)',
        [cartId, recordId, quantity]
      );
    }
    
    return res.status(200).json({
      success: true,
      message: 'Item added to cart'
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error adding item to cart'
    });
  }
});

// Update cart item quantity
router.put('/items/:itemId', async (req, res) => {
  const { quantity } = req.body;
  
  try {
    // Get cart item
    const itemResult = await db.query(
      `SELECT ci.*, c.user_id 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1`,
      [req.params.itemId]
    );
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    // Verify item belongs to user
    if (itemResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      await db.query('DELETE FROM cart_items WHERE id = $1', [req.params.itemId]);
      
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart'
      });
    } else {
      // Check stock availability
      const recordId = itemResult.rows[0].record_id;
      const recordResult = await db.query('SELECT stock_quantity FROM records WHERE id = $1', [recordId]);
      
      if (recordResult.rows[0].stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Not enough stock available'
        });
      }
      
      // Update quantity
      await db.query(
        'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [quantity, req.params.itemId]
      );
      
      return res.status(200).json({
        success: true,
        message: 'Cart updated successfully'
      });
    }
  } catch (err) {
    console.error('Error updating cart:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart'
    });
  }
});

// Remove item from cart
router.delete('/items/:itemId', async (req, res) => {
  try {
    // Get cart item
    const itemResult = await db.query(
      `SELECT ci.*, c.user_id 
       FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.id
       WHERE ci.id = $1`,
      [req.params.itemId]
    );
    
    if (itemResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }
    
    // Verify item belongs to user
    if (itemResult.rows[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // Remove item
    await db.query('DELETE FROM cart_items WHERE id = $1', [req.params.itemId]);
    
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error removing item from cart'
    });
  }
});

// Clear cart
router.delete('/', async (req, res) => {
  try {
    // Get user's cart
    const cartResult = await db.query('SELECT * FROM carts WHERE user_id = $1', [req.user.id]);
    
    if (cartResult.rows.length > 0) {
      // Remove all items
      await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
});

module.exports = router;