const express = require('express');
const Chat = require('../models/Chat');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// Get all chats for the authenticated user
router.get('/', requireUser, async (req, res) => {
  try {
    const { user } = req;
    console.log(`User ${user._id} fetching their chats`);

    const chats = await Chat.find({
      'participants.userId': user._id
    }).sort({ updatedAt: -1 });

    console.log(`Found ${chats.length} chats for user ${user._id}`);

    res.status(200).json({
      success: true,
      chats
    });
  } catch (err) {
    console.error('Error fetching chats:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Get a specific chat by ID
router.get('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    console.log(`User ${user._id} fetching chat ${id}`);

    const chat = await Chat.findOne({
      _id: id,
      'participants.userId': user._id
    });

    if (!chat) {
      console.log(`Chat ${id} not found or user ${user._id} not authorized`);
      return res.status(404).json({
        success: false,
        error: 'Chat not found or you are not authorized to view it'
      });
    }

    console.log(`Successfully retrieved chat ${id} for user ${user._id}`);
    res.status(200).json({
      success: true,
      chat
    });
  } catch (err) {
    console.error(`Error fetching chat ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Send a message in a chat
router.post('/:id/messages', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    console.log(`User ${user._id} sending message to chat ${id}`);

    const chat = await Chat.findOne({
      _id: id,
      'participants.userId': user._id
    });

    if (!chat) {
      console.log(`Chat ${id} not found or user ${user._id} not authorized`);
      return res.status(404).json({
        success: false,
        error: 'Chat not found or you are not authorized to access it'
      });
    }

    const newMessage = {
      senderId: user._id,
      content,
      createdAt: new Date()
    };

    chat.messages.push(newMessage);
    await chat.save();

    console.log(`Message sent successfully to chat ${id}`);

    res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (err) {
    console.error(`Error sending message to chat ${req.params.id}:`, err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Create a new chat
router.post('/', requireUser, async (req, res) => {
  try {
    const { user } = req;
    const { participantId, participantRole, participantName } = req.body;

    if (!participantId || !participantRole || !participantName) {
      return res.status(400).json({
        success: false,
        error: 'Participant details are required'
      });
    }

    console.log(`User ${user._id} creating a new chat with ${participantId}`);

    // Check if a chat already exists between these users
    const existingChat = await Chat.findOne({
      'participants.userId': { $all: [user._id, participantId] }
    });

    if (existingChat) {
      console.log(`Chat already exists between ${user._id} and ${participantId}`);
      return res.status(200).json({
        success: true,
        chat: existingChat,
        message: 'Chat already exists'
      });
    }

    // Determine current user's role (this would typically come from the user object)
    const userRole = user.userType || 'vendor';

    const newChat = new Chat({
      participants: [
        {
          userId: user._id,
          role: userRole,
          name: user.name || user.username
        },
        {
          userId: participantId,
          role: participantRole,
          name: participantName
        }
      ]
    });

    await newChat.save();
    console.log(`New chat created successfully between ${user._id} and ${participantId}`);

    res.status(201).json({
      success: true,
      chat: newChat
    });
  } catch (err) {
    console.error('Error creating new chat:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;