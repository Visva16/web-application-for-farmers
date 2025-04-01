const mongoose = require('mongoose');

const { validatePassword, isPasswordHash } = require('../utils/password.js');
const {randomUUID} = require("crypto");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  role: {
    type: String,
    enum: ['vendor', 'farmer'],
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshToken: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID(),
  },
}, {
  versionKey: false,
});

// Add pre-save hook to log user data before saving
schema.pre('save', function(next) {
  console.log('Saving user with data:', {
    email: this.email,
    role: this.role,
    businessName: this.businessName,
    location: this.location
  });
  next();
});

schema.set('toJSON', {
  /* eslint-disable */
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
  /* eslint-enable */
});

const User = mongoose.model('User', schema);

module.exports = User;