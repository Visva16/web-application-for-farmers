const Comment = require('../models/Comment');
const mongoose = require('mongoose');

class CommentService {
  /**
   * Create a new comment
   * @param {Object} commentData - Comment data including content, discussionId, authorId, etc.
   * @returns {Promise<Object>} Created comment object
   */
  static async create(commentData) {
    try {
      console.log('CommentService: Creating new comment with data:', commentData);
      const comment = new Comment(commentData);
      await comment.save();
      console.log('CommentService: Comment created successfully with ID:', comment._id);
      return comment;
    } catch (error) {
      console.error('CommentService: Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Get all comments for a discussion
   * @param {string} discussionId - Discussion ID
   * @returns {Promise<Array>} List of comments
   */
  static async getByDiscussionId(discussionId) {
    try {
      console.log(`CommentService: Fetching comments for discussion: ${discussionId}`);

      if (!mongoose.Types.ObjectId.isValid(discussionId)) {
        throw new Error('Invalid discussion ID format');
      }

      const comments = await Comment.find({ discussionId })
        .sort({ createdAt: 1 })
        .lean();

      console.log(`CommentService: Found ${comments.length} comments for discussion ${discussionId}`);
      return comments;
    } catch (error) {
      console.error(`CommentService: Error fetching comments for discussion ${discussionId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific comment by ID
   * @param {string} id - Comment ID
   * @returns {Promise<Object>} Comment object
   */
  static async getById(id) {
    try {
      console.log(`CommentService: Fetching comment with ID: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid comment ID format');
      }

      const comment = await Comment.findById(id).lean();

      if (!comment) {
        console.log(`CommentService: Comment with ID ${id} not found`);
        throw new Error('Comment not found');
      }

      console.log(`CommentService: Successfully retrieved comment`);
      return comment;
    } catch (error) {
      console.error(`CommentService: Error fetching comment by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a comment
   * @param {string} id - Comment ID
   * @param {Object} updateData - Updated comment data
   * @returns {Promise<Object>} Updated comment object
   */
  static async update(id, updateData) {
    try {
      console.log(`CommentService: Updating comment ${id} with data:`, updateData);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid comment ID format');
      }

      const comment = await Comment.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!comment) {
        console.log(`CommentService: Comment with ID ${id} not found for update`);
        throw new Error('Comment not found');
      }

      console.log(`CommentService: Successfully updated comment`);
      return comment;
    } catch (error) {
      console.error(`CommentService: Error updating comment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a comment
   * @param {string} id - Comment ID
   * @returns {Promise<Object>} Deleted comment object
   */
  static async delete(id) {
    try {
      console.log(`CommentService: Deleting comment with ID: ${id}`);

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid comment ID format');
      }

      const comment = await Comment.findByIdAndDelete(id);

      if (!comment) {
        console.log(`CommentService: Comment with ID ${id} not found for deletion`);
        throw new Error('Comment not found');
      }

      console.log(`CommentService: Successfully deleted comment`);
      return comment;
    } catch (error) {
      console.error(`CommentService: Error deleting comment ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get all replies to a comment
   * @param {string} parentId - Parent comment ID
   * @returns {Promise<Array>} List of reply comments
   */
  static async getReplies(parentId) {
    try {
      console.log(`CommentService: Fetching replies for comment: ${parentId}`);

      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        throw new Error('Invalid comment ID format');
      }

      const replies = await Comment.find({ parentId })
        .sort({ createdAt: 1 })
        .lean();

      console.log(`CommentService: Found ${replies.length} replies for comment ${parentId}`);
      return replies;
    } catch (error) {
      console.error(`CommentService: Error fetching replies for comment ${parentId}:`, error);
      throw error;
    }
  }
}

module.exports = CommentService;