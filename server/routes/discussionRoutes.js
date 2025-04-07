const express = require('express');
const DiscussionService = require('../services/discussionService');
const CommentService = require('../services/commentService');
const Discussion = require('../models/Discussion');
const auth = require('../middleware/auth');
const router = express.Router();
const mongoose = require('mongoose');

// Get all discussions with pagination, filtering, and sorting
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      authorId,
      tags
    } = req.query;

    // Convert parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build filters
    const filters = {};
    if (search) filters.search = search;
    if (authorId) filters.authorId = authorId;
    if (tags) filters.tags = tags.split(',');

    console.log('Fetching discussions with params:', {
      page: pageNum,
      limit: limitNum,
      sort,
      order: sortOrder,
      filters
    });

    // Build the query
    const query = {};

    // Apply text search if search parameter is provided
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Apply author filter if provided
    if (filters.authorId) {
      query.authorId = filters.authorId;
    }

    // Apply tags filter if provided
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    console.log('Final query:', query);

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Discussion.countDocuments(query);

    // Execute the query with pagination and sorting
    const discussions = await Discussion.find(query)
      .sort({ [sort]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate total pages
    const pages = Math.ceil(total / limitNum);

    console.log(`Found ${discussions.length} discussions out of ${total} total`);

    // Return properly structured response
    res.status(200).json({
      success: true,
      discussions: discussions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages
      }
    });
  } catch (err) {
    console.error('Error fetching discussions:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get discussion by ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`Fetching discussion with ID: ${req.params.id}`);
    const discussionId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      console.log(`Invalid discussion ID format: ${discussionId}`);
      return res.status(404).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }

    // Get the discussion
    const discussion = await Discussion.findById(discussionId).lean();

    if (!discussion) {
      console.log(`Discussion with ID ${discussionId} not found`);
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Increment view count
    await Discussion.findByIdAndUpdate(discussionId, { $inc: { views: 1 } });

    // Get comments for this discussion using CommentService
    const comments = await CommentService.getByDiscussionId(discussionId);

    console.log(`Found discussion: ${discussion.title} with ${comments.length} comments`);

    // Add comments to the discussion object
    const discussionWithComments = {
      ...discussion,
      comments: comments || []
    };

    res.status(200).json({
      success: true,
      discussion: discussionWithComments
    });
  } catch (err) {
    console.error(`Error fetching discussion with ID ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Create a new discussion (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    // Get user details from auth middleware
    const userId = req.user.userId || req.user.sub || req.user._id;
    const { title, content, tags } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    // Create discussion with user data
    const discussionData = {
      title,
      content,
      authorId: userId,
      authorName: req.user.businessName || req.user.name || req.user.email || 'User',
      authorRole: req.user.role,
      tags: tags || []
    };

    console.log('Creating new discussion:', discussionData);

    const discussion = await DiscussionService.create(discussionData);

    res.status(201).json({
      success: true,
      discussion,
      message: 'Discussion created successfully'
    });
  } catch (err) {
    console.error('Error creating discussion:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Update a discussion (requires authentication + authorization)
router.put('/:id', auth, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.userId || req.user.sub || req.user._id;

    // First, fetch the discussion to check ownership
    const discussion = await DiscussionService.getById(discussionId);

    // Check if user is the author
    if (discussion.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this discussion'
      });
    }

    // Update the discussion
    const updatedDiscussion = await DiscussionService.update(discussionId, req.body);

    res.status(200).json({
      success: true,
      discussion: updatedDiscussion,
      message: 'Discussion updated successfully'
    });
  } catch (err) {
    console.error(`Error updating discussion with ID ${req.params.id}:`, err);

    if (err.message === 'Discussion not found' || err.message === 'Invalid discussion ID format') {
      return res.status(404).json({
        success: false,
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Delete a discussion (requires authentication + authorization)
router.delete('/:id', auth, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.userId || req.user.sub || req.user._id;

    // First, fetch the discussion to check ownership
    const discussion = await DiscussionService.getById(discussionId);

    // Check if user is the author
    if (discussion.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this discussion'
      });
    }

    // Delete the discussion
    await DiscussionService.delete(discussionId);

    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (err) {
    console.error(`Error deleting discussion with ID ${req.params.id}:`, err);

    if (err.message === 'Discussion not found' || err.message === 'Invalid discussion ID format') {
      return res.status(404).json({
        success: false,
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Add a comment to a discussion
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const discussionId = req.params.id;
    const userId = req.user.userId || req.user.sub || req.user._id;
    const { content, parentId } = req.body;

    console.log(`Adding comment to discussion ${discussionId} by user ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return res.status(404).json({
        success: false,
        error: 'Invalid discussion ID format'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    // Verify discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found'
      });
    }

    // Create the comment using CommentService
    const commentData = {
      discussionId,
      content,
      authorId: userId,
      authorName: req.user.businessName || req.user.name || req.user.email || 'User',
    };

    // If this is a reply to another comment, add the parentId
    if (parentId && mongoose.Types.ObjectId.isValid(parentId)) {
      commentData.parentId = parentId;
    }

    const comment = await CommentService.create(commentData);
    console.log(`Comment added successfully to discussion: ${discussionId}`);

    res.status(201).json({
      success: true,
      comment,
      message: 'Comment added successfully'
    });
  } catch (err) {
    console.error(`Error adding comment to discussion ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Delete a comment
router.delete('/:discussionId/comments/:commentId', auth, async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const userId = req.user.userId || req.user.sub || req.user._id;

    console.log(`Deleting comment ${commentId} from discussion ${discussionId}`);

    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    // Verify comment exists and check authorization
    const comment = await CommentService.getById(commentId);

    // Check if user is the author of the comment
    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to delete this comment'
      });
    }

    // Delete the comment using CommentService
    await CommentService.delete(commentId);
    console.log(`Comment ${commentId} deleted successfully`);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    console.error(`Error deleting comment ${req.params.commentId}:`, err);

    if (err.message === 'Comment not found' || err.message === 'Invalid comment ID format') {
      return res.status(404).json({
        success: false,
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Update a comment
router.put('/:discussionId/comments/:commentId', auth, async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const userId = req.user.userId || req.user.sub || req.user._id;
    const { content } = req.body;

    console.log(`Updating comment ${commentId} in discussion ${discussionId}`);

    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    // Verify comment exists
    const comment = await CommentService.getById(commentId);

    // Check if user is the author of the comment
    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to update this comment'
      });
    }

    // Update comment using CommentService
    const updatedComment = await CommentService.update(commentId, { content });
    console.log(`Comment ${commentId} updated successfully`);

    res.status(200).json({
      success: true,
      comment: updatedComment,
      message: 'Comment updated successfully'
    });
  } catch (err) {
    console.error(`Error updating comment ${req.params.commentId}:`, err);

    if (err.message === 'Comment not found' || err.message === 'Invalid comment ID format') {
      return res.status(404).json({
        success: false,
        error: err.message
      });
    }

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get all replies to a comment
router.get('/:discussionId/comments/:commentId/replies', async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;

    console.log(`Fetching replies for comment ${commentId} in discussion ${discussionId}`);

    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    // Get replies using CommentService
    const replies = await CommentService.getReplies(commentId);

    console.log(`Found ${replies.length} replies for comment ${commentId}`);

    res.status(200).json({
      success: true,
      replies
    });
  } catch (err) {
    console.error(`Error fetching replies for comment ${req.params.commentId}:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Add a reply to a comment
router.post('/:discussionId/comments/:commentId/replies', auth, async (req, res) => {
  try {
    const { discussionId, commentId } = req.params;
    const userId = req.user.userId || req.user.sub || req.user._id;
    const { content } = req.body;

    console.log(`Adding reply to comment ${commentId} in discussion ${discussionId}`);

    if (!mongoose.Types.ObjectId.isValid(discussionId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({
        success: false,
        error: 'Invalid ID format'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Reply content is required'
      });
    }

    // Verify comment exists
    const parentComment = await CommentService.getById(commentId);
    if (!parentComment) {
      return res.status(404).json({
        success: false,
        error: 'Parent comment not found'
      });
    }

    // Create reply comment
    const replyData = {
      discussionId,
      content,
      authorId: userId,
      authorName: req.user.businessName || req.user.name || req.user.email || 'User',
      parentId: commentId
    };

    const reply = await CommentService.create(replyData);
    console.log(`Reply added successfully to comment ${commentId}`);

    res.status(201).json({
      success: true,
      comment: reply,
      message: 'Reply added successfully'
    });
  } catch (err) {
    console.error(`Error adding reply to comment ${req.params.commentId}:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;