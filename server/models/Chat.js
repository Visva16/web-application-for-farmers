const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const participantSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['vendor', 'farmer'],
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, { _id: false });

const chatSchema = new Schema({
  participants: {
    type: [participantSchema],
    required: true,
    validate: [
      {
        validator: function(participants) {
          return participants.length === 2;
        },
        message: 'Chat must have exactly two participants'
      }
    ]
  },
  messages: {
    type: [messageSchema],
    default: []
  }
}, {
  timestamps: true,
  versionKey: false
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;