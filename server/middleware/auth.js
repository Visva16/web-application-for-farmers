const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Read token secrets from files - fixing the path to point to the server root
const accessTokenSecret = fs.readFileSync(
  path.join(__dirname, '../access_token_secret.txt'),
  'utf8'
).trim();

console.log('Successfully read access token secret from file');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, check for token in cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Using token from cookies');
    }

    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, accessTokenSecret);
    console.log(`Token verified successfully for user ${decoded.sub || decoded.userId || 'unknown'}`);

    // Add user data to request
    req.user = decoded;
    
    // To ensure consistency, standardize user ID field
    if (decoded.sub && !decoded.userId) {
      req.user.userId = decoded.sub;
    }
    
    // Log the extracted user information
    console.log('User data added to request:', {
      userId: req.user.userId || req.user.sub,
      email: req.user.email,
      role: req.user.role
    });
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Invalid token.'
    });
  }
};

// Role-based authorization middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Authorization failed: User not authenticated');
      return res.status(401).json({
        success: false,
        error: 'Authorization failed. Not authenticated.'
      });
    }

    const userRole = req.user.role;
    console.log(`Checking authorization for user role: ${userRole}, required roles: ${roles.join(', ')}`);

    if (!roles.includes(userRole)) {
      console.log(`Authorization failed: User role ${userRole} not in allowed roles [${roles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        error: 'Authorization failed. Insufficient permissions.'
      });
    }

    console.log(`User authorized with role: ${userRole}`);
    next();
  };
};

module.exports = auth;
module.exports.authorize = authorize;