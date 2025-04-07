const express = require('express');
const UserService = require('../services/userService');
const router = express.Router();

console.log('Loading vendorRoutes.js');

// Get vendors by city
router.get('/by-city/:city', async (req, res) => {
  console.log(`Received request for vendors in city: ${req.params.city}`);
  try {
    console.log(`Fetching vendors from city: ${req.params.city}`);

    if (!req.params.city) {
      console.log('City parameter is missing');
      return res.status(400).json({
        success: false,
        error: 'City parameter is required'
      });
    }

    console.log(`Calling UserService.findVendorsByCity with city: ${req.params.city}`);
    const vendors = await UserService.findVendorsByCity(req.params.city);
    console.log(`Found ${vendors ? vendors.length : 0} vendors in ${req.params.city}`);

    return res.status(200).json({
      success: true,
      vendors
    });
  } catch (error) {
    console.error(`Error in /by-city/:city endpoint: ${error.message}`);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all vendors
router.get('/', async (req, res) => {
  console.log('Received request for all vendors');
  try {
    console.log('Fetching all vendors');

    console.log('Calling UserService.findAllVendors');
    const vendors = await UserService.findAllVendors();
    console.log(`Found ${vendors ? vendors.length : 0} total vendors`);

    return res.status(200).json({
      success: true,
      vendors
    });
  } catch (error) {
    console.error(`Error in / endpoint: ${error.message}`);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;