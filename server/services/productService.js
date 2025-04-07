const Product = require('../models/Product');
const mongoose = require('mongoose');

class ProductService {
  static async listAll(filters = {}) {
    try {
      const query = { ...filters };
      console.log('Fetching all products with filters:', query);
      return await Product.find(query).sort({ createdAt: -1 });
    } catch (err) {
      console.error('Error listing products:', err);
      throw new Error(`Database error while listing products: ${err.message}`);
    }
  }

  static async getAll(filters = {}) {
    try {
      console.log('Finding products with filters:', filters);
      const products = await Product.find(filters).sort({ createdAt: -1 });
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(`Database error while fetching products: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      console.log(`Fetching product with ID: ${id}`);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Invalid product ID format: ${id}`);
        throw new Error('Invalid product ID format');
      }

      const product = await Product.findById(id);
      if (!product) {
        console.error(`Product not found with ID: ${id}`);
        throw new Error('Product not found');
      }
      console.log(`Successfully retrieved product: ${product.name}`);
      return product;
    } catch (err) {
      console.error(`Error getting product ${id}:`, err);
      throw new Error(`Error retrieving product: ${err.message}`);
    }
  }

  static async create(productData) {
    try {
      console.log('Creating new product:', productData.name);
      console.log('Product data received:', {
        sellerId: productData.sellerId,
        sellerName: productData.sellerName,
        // Log other fields as needed
      });

      // Get the seller's city
      const User = require('../models/User.js');
      const seller = await User.findById(productData.sellerId);
      const city = seller?.city || null;

      // Ensure the field names match exactly what the model expects
      const product = new Product({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        category: productData.category,
        sellerId: productData.sellerId, // Ensure correct case
        sellerName: productData.sellerName, // Ensure correct case
        sellerType: productData.sellerType,
        city, // Add city from seller
        // Other fields as needed
      });

      const savedProduct = await product.save();
      console.log(`Product created successfully with ID: ${savedProduct._id}`);
      return savedProduct;
    } catch (error) {
      console.warn('Error creating product:', error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  static async update(id, data) {
    try {
      console.log(`Updating product with ID: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Invalid product ID format: ${id}`);
        throw new Error('Invalid product ID format');
      }

      const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true
      });

      if (!product) {
        console.error(`Product not found with ID: ${id}`);
        throw new Error('Product not found');
      }

      console.log(`Successfully updated product: ${product.name}`);
      return product;
    } catch (err) {
      console.error(`Error updating product ${id}:`, err);
      throw new Error(`Error updating product: ${err.message}`);
    }
  }

  static async delete(id) {
    try {
      console.log(`Deleting product with ID: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Invalid product ID format: ${id}`);
        throw new Error('Invalid product ID format');
      }

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        console.error(`Product not found with ID: ${id}`);
        throw new Error('Product not found');
      }

      console.log(`Successfully deleted product: ${product.name}`);
      return { success: true, message: 'Product deleted successfully' };
    } catch (err) {
      console.error(`Error deleting product ${id}:`, err);
      throw new Error(`Error deleting product: ${err.message}`);
    }
  }

  static async incrementViewCount(id) {
    try {
      console.log(`Incrementing view count for product ID: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`Invalid product ID format: ${id}`);
        throw new Error('Invalid product ID format');
      }

      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );

      if (!product) {
        console.error(`Product not found with ID: ${id}`);
        throw new Error('Product not found');
      }

      console.log(`Updated view count for product: ${product.name} to ${product.viewCount}`);
      return product;
    } catch (err) {
      console.error(`Error updating view count for product ${id}:`, err);
      throw new Error(`Error updating view count: ${err.message}`);
    }
  }
}

module.exports = ProductService;