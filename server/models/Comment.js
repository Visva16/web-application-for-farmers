const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  discussionId: {
    type: Schema.Types.ObjectId,
    ref: 'Discussion',
    required: true
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  }
}, {
  timestamps: true
});

// Add pre-save hook to log comment data before saving
commentSchema.pre('save', function(next) {
  console.log('Saving comment with data:', {
    discussionId: this.discussionId,
    authorId: this.authorId,
    authorName: this.authorName
  });
  next();
});

// Add indexes for better query performance
commentSchema.index({ discussionId: 1 });
commentSchema.index({ authorId: 1 });
commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;