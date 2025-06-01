const jwt = require('jsonwebtoken');
const db = require('../database/connection');

const authenticateToken = (req, res, next) => {
  // Get token from cookies or authorization header
  const token = req.cookies.token || 
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const result = await db.query('SELECT is_admin FROM users WHERE id = $1', [req.user.id]);
    
    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Server error while checking admin status.'
    });
  }
};

module.exports = {
  authenticateToken,
  isAdmin
};