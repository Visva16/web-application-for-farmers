const UserService = require('../../services/userService.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Read access token secret from file
const getAccessTokenSecret = () => {
  try {
    return fs.readFileSync(path.join(__dirname, '../../access_token_secret.txt'), 'utf8').trim();
  } catch (error) {
    console.error('Error reading access token secret:', error);
    return process.env.JWT_SECRET; // Fallback to environment variable
  }
};

const ACCESS_TOKEN_SECRET = getAccessTokenSecret();

const requireUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await UserService.get(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;

    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  requireUser,
};