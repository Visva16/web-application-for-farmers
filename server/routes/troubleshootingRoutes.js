const express = require('express');
const router = express.Router();
const troubleshootingService = require('../services/troubleshootingService');

/**
 * @route GET /api/troubleshooting/client
 * @desc Get client-side troubleshooting guide
 * @access Public
 */
router.get('/client', async (req, res) => {
  try {
    console.log('Fetching client-side troubleshooting guide');
    const guide = await troubleshootingService.getClientSideTroubleshootingGuide();
    console.log('Successfully retrieved troubleshooting guide');
    res.json(guide);
  } catch (error) {
    console.error('Error fetching troubleshooting guide:', error);
    res.status(500).json({ error: error.message || 'Error fetching troubleshooting guide' });
  }
});

module.exports = router;