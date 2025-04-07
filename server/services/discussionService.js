const Discussion = require('../models/Discussion');
const mongoose = require('mongoose');

class DiscussionService {
  /**
   * Create a new discussion
   * @param {Object} discussionData - Discussion data including title, content, authorId, authorName, etc.
   * @returns {Promise<Object>} Created discussion object
   */
  static async create(discussionData) {
    try {
      console.log('DiscussionService: Creating new discussion with data:', discussionData);
      const discussion = new Discussion(discussionData);
      await discussion.save();
      console.log('DiscussionService: Discussion created successfully with ID:', discussion._id);
      return discussion;
    } catch (error) {
      console.error('DiscussionService: Error creating discussion:', error);
      throw error;
    }
  }

  /**
   * Get all discussions with optional filtering
   * @param {Object} filter - Optional filter criteria
   * @returns {Promise<Array>} List of discussions
   */
  static async getAll(filter = {}) {
    try {
      console.log('DiscussionService: Fetching all discussions with filter:', filter);
      const discussions = await Discussion.find(filter)
        .sort({ createdAt: -1 })
        .lean();
      console.log(`DiscussionService: Found ${discussions.length} discussions`);
      return discussions;
    } catch (error) {
      console.error('DiscussionService: Error fetching discussions:', error);
      throw error;
    }
  }

  /**
   * Get a specific discussion by ID
   * @param {string} id - Discussion ID
   * @returns {Promise<Object>} Discussion object
   */
  static async getById(id) {
    try {
      console.log(`DiscussionService: Fetching discussion with ID: ${id}`);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid discussion ID format');
      }
      
      const discussion = await Discussion.findById(id).lean();
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${id} not found`);
        throw new Error('Discussion not found');
      }
      
      console.log(`DiscussionService: Successfully retrieved discussion: ${discussion.title}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error fetching discussion by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a discussion
   * @param {string} id - Discussion ID
   * @param {Object} updateData - Updated discussion data
   * @returns {Promise<Object>} Updated discussion object
   */
  static async update(id, updateData) {
    try {
      console.log(`DiscussionService: Updating discussion ${id} with data:`, updateData);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid discussion ID format');
      }
      
      const discussion = await Discussion.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${id} not found for update`);
        throw new Error('Discussion not found');
      }
      
      console.log(`DiscussionService: Successfully updated discussion: ${discussion.title}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error updating discussion ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a discussion
   * @param {string} id - Discussion ID
   * @returns {Promise<Object>} Deleted discussion object
   */
  static async delete(id) {
    try {
      console.log(`DiscussionService: Deleting discussion with ID: ${id}`);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid discussion ID format');
      }
      
      const discussion = await Discussion.findByIdAndDelete(id);
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${id} not found for deletion`);
        throw new Error('Discussion not found');
      }
      
      console.log(`DiscussionService: Successfully deleted discussion: ${discussion.title}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error deleting discussion ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a reply to a discussion
   * @param {string} discussionId - Discussion ID
   * @param {Object} replyData - Reply data including content, authorId, authorName, etc.
   * @returns {Promise<Object>} Updated discussion with new reply
   */
  static async addReply(discussionId, replyData) {
    try {
      console.log(`DiscussionService: Adding reply to discussion ${discussionId}:`, replyData);
      
      if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Error('Invalid discussion ID format');
      }
      
      const discussion = await Discussion.findById(discussionId);
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${discussionId} not found for adding reply`);
        throw new Error('Discussion not found');
      }
      
      // Add reply with a generated ID
      const reply = {
        _id: new mongoose.Types.ObjectId(),
        ...replyData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      discussion.replies.push(reply);
      await discussion.save();
      
      console.log(`DiscussionService: Reply added successfully to discussion: ${discussion.title}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error adding reply to discussion ${discussionId}:`, error);
      throw error;
    }
  }

  /**
   * Update a reply in a discussion
   * @param {string} discussionId - Discussion ID
   * @param {string} replyId - Reply ID
   * @param {Object} updateData - Updated reply data
   * @returns {Promise<Object>} Updated discussion with modified reply
   */
  static async updateReply(discussionId, replyId, updateData) {
    try {
      console.log(`DiscussionService: Updating reply ${replyId} in discussion ${discussionId}:`, updateData);
      
      if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(replyId)) {
        throw new Error('Invalid ID format');
      }
      
      const discussion = await Discussion.findById(discussionId);
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${discussionId} not found for updating reply`);
        throw new Error('Discussion not found');
      }
      
      const replyIndex = discussion.replies.findIndex(reply => reply._id.toString() === replyId);
      
      if (replyIndex === -1) {
        console.log(`DiscussionService: Reply with ID ${replyId} not found in discussion ${discussionId}`);
        throw new Error('Reply not found');
      }
      
      // Update reply fields while preserving other fields
      discussion.replies[replyIndex] = {
        ...discussion.replies[replyIndex].toObject(),
        ...updateData,
        updatedAt: new Date()
      };
      
      await discussion.save();
      
      console.log(`DiscussionService: Reply updated successfully in discussion: ${discussion.title}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error updating reply ${replyId} in discussion ${discussionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a reply from a discussion
   * @param {string} discussionId - Discussion ID
   * @param {string} replyId - Reply ID
   * @returns {Promise<Object>} Updated discussion without the deleted reply
   */
  static async deleteReply(discussionId, replyId) {
    try {
      console.log(`DiscussionService: Deleting reply ${replyId} from discussion ${discussionId}`);
      
      if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(replyId)) {
        throw new Error('Invalid ID format');
      }
      
      const discussion = await Discussion.findById(discussionId);
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${discussionId} not found for deleting reply`);
        throw new Error('Discussion not found');
      }
      
      const replyIndex = discussion.replies.findIndex(reply => reply._id.toString() === replyId);
      
      if (replyIndex === -1) {
        console.log(`DiscussionService: Reply with ID ${replyId} not found in discussion ${discussionId}`);
        throw new Error('Reply not found');
      }
      
      // Remove the reply
      discussion.replies.splice(replyIndex, 1);
      await discussion.save();
      
      console.log(`DiscussionService: Reply deleted successfully from discussion: ${discussion.title}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error deleting reply ${replyId} from discussion ${discussionId}:`, error);
      throw error;
    }
  }

  /**
   * Increment the view count for a discussion
   * @param {string} id - Discussion ID
   * @returns {Promise<Object>} Updated discussion with incremented view count
   */
  static async incrementViews(id) {
    try {
      console.log(`DiscussionService: Incrementing views for discussion ${id}`);
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid discussion ID format');
      }
      
      const discussion = await Discussion.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
      
      if (!discussion) {
        console.log(`DiscussionService: Discussion with ID ${id} not found for incrementing views`);
        throw new Error('Discussion not found');
      }
      
      console.log(`DiscussionService: Views incremented for discussion: ${discussion.title}, new count: ${discussion.views}`);
      return discussion;
    } catch (error) {
      console.error(`DiscussionService: Error incrementing views for discussion ${id}:`, error);
      throw error;
    }
  }
}

module.exports = DiscussionService;