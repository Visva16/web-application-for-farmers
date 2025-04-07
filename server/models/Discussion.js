const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const discussionSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
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
  authorRole: {
    type: String,
    enum: ['vendor', 'farmer'],
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting comment count
discussionSchema.virtual('commentCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'discussionId',
  count: true
});

// Add pre-save hook to log discussion data before saving
discussionSchema.pre('save', function(next) {
  console.log('Saving discussion with data:', {
    title: this.title,
    authorId: this.authorId,
    authorName: this.authorName,
    authorRole: this.authorRole
  });
  next();
});

// Add indexes for better query performance
discussionSchema.index({ authorId: 1 });
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ title: 'text', content: 'text' });

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;