const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderProductSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const orderSchema = new Schema({
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  products: {
    type: [orderProductSchema],
    required: true,
    validate: [
      {
        validator: function(products) {
          return products.length > 0;
        },
        message: 'At least one product is required'
      }
    ]
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  versionKey: false
});

// Add pre-save hook to log order data before saving
orderSchema.pre('save', function(next) {
  console.log('Saving order with data:', {
    buyerId: this.buyerId,
    sellerId: this.sellerId,
    products: this.products.length,
    totalAmount: this.totalAmount,
    status: this.status
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;