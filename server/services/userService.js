const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list() {
    try {
      return User.find();
    } catch (err) {
      console.error('Error listing users:', err);
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      console.error(`Error getting user ${id}:`, err);
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      console.error(`Error getting user by email ${email}:`, err);
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      return User.findOneAndUpdate({ _id: id }, data, { new: true, upsert: false });
    } catch (err) {
      console.error(`Error updating user ${id}:`, err);
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      console.error(`Error deleting user ${id}:`, err);
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findOne({email}).exec();
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      console.error(`Error authenticating user ${email}:`, err);
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, role, businessName, location, name = '' }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');
    if (!role) throw new Error('Role is required');
    if (!businessName) throw new Error('Business name is required');
    if (!location) throw new Error('Location is required');

    try {
      console.log(`Creating new user with email: ${email} and role: ${role}`);
      
      console.log(`Validation complete for new user with email: ${email}`);

      const existingUser = await UserService.getByEmail(email);
      if (existingUser) {
        console.warn(`User with email ${email} already exists`);
        throw new Error('User with this email already exists');
      }
      
      console.log(`No existing user found with email: ${email}, proceeding with creation`);
      
      console.log(`Generating password hash for new user: ${email}`);
      const hash = await generatePasswordHash(password);
      console.log(`Password hash generated successfully, creating user document`);

      const user = new User({
        email,
        password: hash,
        role,
        businessName,
        location,
        name,
      });

      await user.save();
      console.log(`New user created successfully with ID: ${user._id}`);
      return user;
    } catch (err) {
      console.error(`Error creating new user:`, err);
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');

    try {
      console.log(`Setting password for user: ${user._id}`);
      user.password = await generatePasswordHash(password); // eslint-disable-line

      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      console.error(`Error setting password for user ${user._id}:`, err);
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
}

module.exports = UserService;