const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const vendorRoutes = require('./vendorRoutes');
const farmerRoutes = require('./farmerRoutes');
const priceAnalysisRoutes = require('./priceAnalysisRoutes');
const troubleshootingRoutes = require('./troubleshootingRoutes');
const discussionRoutes = require('./discussionRoutes');

// Root path response
router.get("/", (req, res) => {
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

console.log('Registering routes:');
console.log('- /auth routes registered');
console.log('- /products routes registered');
console.log('- /orders routes registered');
console.log('- /vendors routes registered');
console.log('- /farmers routes registered');
console.log('- /price-analysis routes registered');
console.log('- /troubleshooting routes registered');
console.log('- /discussions routes registered');

// Register routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/vendors', vendorRoutes);
router.use('/farmers', farmerRoutes);
router.use('/price-analysis', priceAnalysisRoutes);
router.use('/troubleshooting', troubleshootingRoutes);
router.use('/discussions', discussionRoutes);

module.exports = router;