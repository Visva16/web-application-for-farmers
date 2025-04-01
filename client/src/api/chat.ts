import api from './api';
import { Chat } from './types';

// Description: Get user chats
// Endpoint: GET /api/chats
// Response: { chats: Chat[] }
export const getChats = async () => {
  // Mock data
  return new Promise<{ chats: Chat[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        chats: [
          {
            _id: '1',
            participants: [
              {
                userId: '1',
                role: 'vendor',
                name: 'John\'s Store'
              },
              {
                userId: '2',
                role: 'farmer',
                name: 'Green Farms'
              }
            ],
            messages: [
              {
                _id: '1',
                senderId: '1',
                content: 'Hello, I\'m interested in your tomatoes',
                createdAt: new Date(Date.now() - 7200000).toISOString()
              },
              {
                _id: '2',
                senderId: '2',
                content: 'Hi! Yes, they\'re available. How many kg do you need?',
                createdAt: new Date(Date.now() - 3600000).toISOString()
              }
            ],
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      });
    }, 500);
  });
};

// Description: Send message
// Endpoint: POST /api/chats/:chatId/messages
// Request: { content: string }
// Response: { message: Chat['messages'][0] }
export const sendMessage = async (chatId: string, content: string) => {
  // Mock data
  return new Promise<{ message: Chat['messages'][0] }>((resolve) => {
    setTimeout(() => {
      resolve({
        message: {
          _id: Math.random().toString(),
          senderId: '1',
          content,
          createdAt: new Date().toISOString()
        }
      });
    }, 500);
  });
};

// Description: Create new chat
// Endpoint: POST /api/chats
// Request: { participantId: string }
// Response: { chat: Chat }
export const createChat = async (participantId: string) => {
  // Mock data
  return new Promise<{ chat: Chat }>((resolve) => {
    setTimeout(() => {
      resolve({
        chat: {
          _id: Math.random().toString(),
          participants: [
            {
              userId: '1',
              role: 'vendor',
              name: 'John\'s Store'
            },
            {
              userId: participantId,
              role: 'farmer',
              name: 'Green Farms'
            }
          ],
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }, 500);
  });
};