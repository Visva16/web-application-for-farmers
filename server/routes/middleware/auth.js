const UserService = require('../../services/userService.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Read the access token secret from file
let ACCESS_TOKEN_SECRET;
try {
  ACCESS_TOKEN_SECRET = fs.readFileSync(
    path.join(__dirname, '../../access_token_secret.txt'),
    'utf8'
  ).trim();
  console.log('Successfully read access token secret from file');
} catch (err) {
  console.error('Error reading access token secret from file:', err);
  // Fallback to environment variable
  ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
const requireUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

      // Extract user ID from token payload
      const userId = decoded.sub || decoded.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token format'
        });
      }

      // Fetch the user from database to validate they exist
      const user = await UserService.get(userId);

      if (!user) {
        console.error('User not found for token');
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      // Attach user info to request
      req.user = user;
      next();
    } catch (tokenErr) {
      if (tokenErr.name === 'TokenExpiredError') {
        console.log('Token expired, checking for refresh token');
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      } else {
        console.error('JWT verification error:', tokenErr);
        return res.status(403).json({
          success: false,
          error: 'Invalid token'
        });
      }
    }
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

module.exports = {
  requireUser,
};