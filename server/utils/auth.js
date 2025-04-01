const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Initialize variables for secrets
let accessTokenSecret;
let refreshTokenSecret;

// First try to read from files (more reliable source)
try {
  const accessTokenPath = path.join(__dirname, '..', 'access_token_secret.txt');
  accessTokenSecret = fs.readFileSync(accessTokenPath, 'utf8').trim();
  console.log('Successfully read access token secret from file');
} catch (err) {
  console.error('Could not read access token secret from file:', err.message);
  // Fall back to environment variable
  accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  // Check if it's a placeholder
  if (accessTokenSecret && accessTokenSecret.includes('your_access_token_secret_here')) {
    console.error('ACCESS_TOKEN_SECRET environment variable contains a placeholder value');
    accessTokenSecret = null;
  }
}

try {
  const refreshTokenPath = path.join(__dirname, '..', 'refresh_token_secret.txt');
  refreshTokenSecret = fs.readFileSync(refreshTokenPath, 'utf8').trim();
  console.log('Successfully read refresh token secret from file');
} catch (err) {
  console.error('Could not read refresh token secret from file:', err.message);
  // Fall back to environment variable
  refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  // Check if it's a placeholder
  if (refreshTokenSecret && refreshTokenSecret.includes('your_refresh_token_secret_here')) {
    console.error('REFRESH_TOKEN_SECRET environment variable contains a placeholder value');
    refreshTokenSecret = null;
  }
}

// Final check to ensure we have valid secrets
if (!accessTokenSecret) {
  console.error('ERROR: No valid ACCESS_TOKEN_SECRET found in file or environment variables');
  process.exit(1); // Exit with error
}

if (!refreshTokenSecret) {
  console.error('ERROR: No valid REFRESH_TOKEN_SECRET found in file or environment variables');
  process.exit(1); // Exit with error
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      role: user.role
    },
    accessTokenSecret,
    { expiresIn: '1h' }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email
    },
    refreshTokenSecret,
    { expiresIn: '7d' }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken
};