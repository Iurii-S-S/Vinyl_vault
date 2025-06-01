const express = require('express');
const db = require('../database/connection');

const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  const { 
    shippingAddress, 
    shippingCity, 
    shippingPostalCode, 
    shippingCountry 
  } = req.body;
  
  // Start a transaction
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    // Get user's cart
    const cartResult = await client.query('SELECT * FROM carts WHERE user_id = $1', [req.user.id]);
    
    if (cartResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    const cartId = cartResult.rows[0].id;
    
    // Get cart items with record details
    const cartItemsResult = await client.query(
      `SELECT ci.id, ci.quantity, ci.record_id, 
       r.title, r.artist, r.price, r.stock_quantity
       FROM cart_items ci
       JOIN records r ON ci.record_id = r.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );
    
    if (cartItemsResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Validate stock for all items
    for (const item of cartItemsResult.rows) {
      if (item.stock_quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${item.title}" by ${item.artist}`
        });
      }
    }
    
    // Calculate total
    const totalAmount = cartItemsResult.rows.reduce(
      (sum, item) => sum + (parseFloat(item.price) * item.quantity), 
      0
    );
    
    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders 
       (user_id, total_amount, shipping_address, shipping_city, shipping_postal_code, shipping_country) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.id, totalAmount, shippingAddress, shippingCity, shippingPostalCode, shippingCountry]
    );
    
    const orderId = orderResult.rows[0].id;
    
    // Add order items
    for (const item of cartItemsResult.rows) {
      await client.query(
        `INSERT INTO order_items 
         (order_id, record_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.record_id, item.quantity, item.price]
      );
      
      // Update stock
      await client.query(
        'UPDATE records SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.record_id]
      );
    }
    
    // Clear cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    
    await client.query('COMMIT');
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: orderId,
        totalAmount: totalAmount.toFixed(2)
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  } finally {
    client.release();
  }
});

// Get user's orders
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
       o.shipping_address, o.shipping_city, o.shipping_postal_code, o.shipping_country
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    
    return res.status(200).json({
      success: true,
      data: {
        orders: result.rows
      }
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// Get a single order with items
router.get('/:id', async (req, res) => {
  try {
    // Get order
    const orderResult = await db.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at,
       o.shipping_address, o.shipping_city, o.shipping_postal_code, o.shipping_country
       FROM orders o
       WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.id, req.user.id]
    );
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Get order items
    const itemsResult = await db.query(
      `SELECT oi.quantity, oi.price, 
       r.id as record_id, r.title, r.artist, r.image_url
       FROM order_items oi
       JOIN records r ON oi.record_id = r.id
       WHERE oi.order_id = $1`,
      [req.params.id]
    );
    
    return res.status(200).json({
      success: true,
      data: {
        order: orderResult.rows[0],
        items: itemsResult.rows
      }
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

module.exports = router;