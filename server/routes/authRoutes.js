const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    console.log('Login endpoint hit with email:', req.body.email);
    const sendError = msg => res.status(400).json({ message: msg });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Login attempt failed: Email or password missing');
      return sendError('Email and password are required');
    }

    // First check if the user exists
    const userExists = await UserService.getByEmail(email);
    if (!userExists) {
      console.log(`Login attempt failed: User with email ${email} not found`);
      return sendError('Email or password is incorrect');
    }

    console.log(`User found with email ${email}, attempting password validation`);

    // Now attempt authentication with password
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      console.log(`User authenticated successfully: ${email} with role ${user.role}`);

      // Log all user fields to verify they're available
      console.log('User data to be returned:', {
        userId: user._id,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        location: user.location
      });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      // Return specific properties that the frontend expects
      return res.json({
        accessToken,
        refreshToken,
        role: user.role,
        userId: user._id,
        email: user.email,
        businessName: user.businessName,
        location: user.location
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

router.post('/register', async (req, res) => {
  try {
    console.log('Registration endpoint hit with data:', req.body);
    const { email, password, role, businessName, location } = req.body;

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

    // Add additional logging as per instructions
    console.log('All validation passed, proceeding to create user with:', {
      email,
      role,
      businessName,
      location,
      passwordProvided: !!password
    });

    // Create user
    const user = await UserService.create({
      email,
      password,
      role,
      businessName,
      location
    });

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update user with refresh token
    await UserService.update(user._id, { refreshToken });

    // Return response with user and tokens
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          businessName: user.businessName,
          location: user.location
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

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/logout', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(200).json({ message: 'User logged out successfully.' });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user
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

    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return new tokens
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

router.get('/me', requireUser, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;