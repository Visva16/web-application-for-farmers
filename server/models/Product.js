const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  sellerType: {
    type: String,
    enum: ['vendor', 'farmer'],
    required: true
  },
  certificationType: {
    type: String,
    default: ''
  },
  minimumOrder: {
    type: Number,
    default: 1,
    min: 1
  },
  bulkDiscounts: {
    type: [{
      quantity: Number,
      price: Number
    }],
    default: []
  }
}, {
  timestamps: true
});

// Add indexing for better query performance
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;