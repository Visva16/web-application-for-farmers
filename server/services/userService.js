const User = require('../models/User');

class UserService {
  /**
   * Find vendors by city
   * @param {string} city - The city to search for vendors
   * @returns {Promise<Array>} Array of vendors in the specified city
   */
  static async findVendorsByCity(city) {
    console.log(`UserService.findVendorsByCity called with city: ${city}`);
    try {
      console.log(`Searching for vendors in city: ${city}`);

      if (!city) {
        console.error('City parameter is empty or undefined');
        throw new Error('City parameter is required');
      }

      console.log(`Creating regex search for city: ${city}`);
      const cityRegex = new RegExp(city, 'i'); // Case-insensitive search
      console.log(`Executing User.find query with role: vendor and city regex`);

      // Find all vendors (role = 'vendor') in the specified city
      const vendors = await User.find({
        role: 'vendor',
        city: { $regex: cityRegex }
      }).select('-password'); // Exclude password from results

      console.log(`Query complete. Found ${vendors.length} vendors in ${city}`);
      console.log(`Vendor cities: ${vendors.map(v => v.city).join(', ')}`);
      return vendors;
    } catch (error) {
      console.error(`Error in findVendorsByCity service: ${error.message}`);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Get a user by ID
   * @param {string} userId - The user ID to retrieve
   * @returns {Promise<Object>} The user object
   */
  static async get(userId) {
    try {
      console.log(`Getting user with ID: ${userId}`);

      if (!userId) {
        console.error('User ID is empty or undefined');
        throw new Error('User ID is required');
      }

      const user = await User.findById(userId).select('-password');

      if (!user) {
        console.log(`No user found with ID: ${userId}`);
        return null;
      }

      console.log(`Found user: ${user.email}, role: ${user.role}`);
      return user;
    } catch (error) {
      console.error(`Error in UserService.get: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all vendors
   * @returns {Promise<Array>} Array of all vendors
   */
  static async findAllVendors() {
    console.log('UserService.findAllVendors called');
    try {
      console.log('Fetching all vendors');

      console.log('Executing User.find query with role: vendor');
      // Find all users with role = 'vendor'
      const vendors = await User.find({
        role: 'vendor'
      }).select('-password'); // Exclude password from results

      console.log(`Query complete. Found ${vendors.length} total vendors`);
      console.log(`Vendor cities: ${vendors.map(v => v.city || 'undefined').join(', ')}`);
      return vendors;
    } catch (error) {
      console.error(`Error in findAllVendors service: ${error.message}`);
      console.error(error.stack);
      throw error;
    }
  }

  /**
   * Get a user by email
   * @param {string} email - The email to search for
   * @returns {Promise<Object>} The user object
   */
  static async getByEmail(email) {
    try {
      console.log(`Getting user with email: ${email}`);

      if (!email) {
        console.error('Email is empty or undefined');
        throw new Error('Email is required');
      }

      const user = await User.findOne({ email });

      if (!user) {
        console.log(`No user found with email: ${email}`);
        return null;
      }

      console.log(`Found user: ${user.email}, role: ${user.role}`);
      return user;
    } catch (error) {
      console.error(`Error in UserService.getByEmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Authenticate a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} User object if authentication is successful
   */
  static async authenticateWithPassword(email, password) {
    try {
      console.log(`Authenticating user with email: ${email}`);

      if (!email || !password) {
        console.error('Email or password is missing');
        throw new Error('Email and password are required');
      }

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        console.log(`No user found with email: ${email}`);
        throw new Error('Invalid email or password');
      }

      // Verify password - assuming you have a comparePassword method on the User model
      // or a utility function elsewhere
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        console.log(`Invalid password for user: ${email}`);
        throw new Error('Invalid email or password');
      }

      console.log(`User authenticated successfully: ${email}`);
      return user;
    } catch (error) {
      console.error(`Error in authenticateWithPassword: ${error.message}`);
      throw error;
    }
  }
}

module.exports = UserService;