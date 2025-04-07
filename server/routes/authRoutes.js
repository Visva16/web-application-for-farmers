const express = require('express');
const router = express.Router();
const UserService = require('../services/userService.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const { requireUser } = require('./middleware/auth.js');
const User = require('../models/User.js');
const jwt = require('jsonwebtoken');

// Login route
router.post('/login', async (req, res) => {
  try {
    console.log('Login endpoint hit with email:', req.body.email);
    const sendError = msg => res.status(400).json({ message: msg });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login attempt failed: Email or password missing');
      return sendError('Email and password are required');
    }

    // Check if the user exists
    const userExists = await UserService.getByEmail(email);
    if (!userExists) {
      console.log(`Login attempt failed: User with email ${email} not found`);
      return sendError('Email or password is incorrect');
    }

    console.log(`User found with email ${email}, attempting password validation`);

    // Authenticate with password
    const user = await UserService.authenticateWithPassword(email, password);
    if (user) {
      console.log(`User authenticated successfully: ${email} with role ${user.role}`);
      console.log('User data to be returned:', {
        userId: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        location: user.location,
        city: user.city
      });

      // Generate tokens using the full user object
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Save the refresh token to the user record
      user.refreshToken = refreshToken;
      await user.save();

      return res.json({
        accessToken,
        refreshToken,
        role: user.role,
        userId: user._id,
        email: user.email,
        businessName: user.businessName,
        location: user.location,
        city: user.city || ''
      });
    } else {
      console.log(`Authentication failed for email: ${email} - incorrect password`);
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error(`Login error: ${error.message}`, error);
    return res.status(500).json({ message: 'An error occurred during login' });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    console.log('Registration endpoint hit with data:', req.body);
    const { email, password, role, businessName, location, city } = req.body;
    console.log('Register request body:', {
      email,
      role,
      businessName,
      location,
      city,
      password: password ? '[REDACTED]' : undefined
    });

    // Validate required fields
    if (!email || !password || !role || !businessName || !location) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Validate role
    if (role !== 'vendor' && role !== 'farmer') {
      return res.status(400).json({
        success: false,
        error: 'Role must be either "vendor" or "farmer"'
      });
    }

    console.log('All validation passed, proceeding to create user with:', {
      email,
      role,
      businessName,
      location,
      city,
      passwordProvided: !!password
    });

    // Create user
    const user = await UserService.create({
      email,
      password,
      role,
      businessName,
      location,
      city
    });

    // Generate tokens using the full user object
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user with refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          businessName: user.businessName,
          location: user.location,
          city: user.city
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    console.error(`Error details: ${err.stack}`);

    // Handle duplicate email error
    if (err.message.includes('duplicate key error') && err.message.includes('email')) {
      return res.status(400).json({
        success: false,
        error: 'Email is already registered'
      });
    }

    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return res.status(200).json({ message: 'User logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'An error occurred during logout' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }
  try {
    // Verify the refresh token using the secret
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // Find the user using the decoded token's subject
    const user = await UserService.get(decoded.sub);
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }
    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    // Update user's refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error(`Token refresh error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// Get current user info route
router.get('/me', requireUser, async (req, res) => {
  try {
    const user = await UserService.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        location: user.location,
        city: user.city
      }
    });
  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Update user route
router.put('/update', requireUser, async (req, res) => {
  try {
    const { businessName, location, city } = req.body;
    const updates = {};
    if (businessName) updates.businessName = businessName;
    if (location) updates.location = location;
    if (city !== undefined) updates.city = city;
    const user = await UserService.update(req.user.id, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        location: user.location,
        city: user.city
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
