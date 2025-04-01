import api from './api';
import { Notification } from './types';

// Description: Get user notifications
// Endpoint: GET /api/notifications
// Response: { notifications: Notification[] }
export const getNotifications = async () => {
  // Mock data
  return new Promise<{ notifications: Notification[] }>((resolve) => {
    setTimeout(() => {
      resolve({
        notifications: [
          {
            _id: '1',
            userId: '1',
            type: 'order',
            title: 'New Order',
            message: 'You have received a new order #12345',
            read: false,
            createdAt: new Date().toISOString(),
            referenceId: '12345',
            referenceType: 'order'
          },
          {
            _id: '2',
            userId: '1',
            type: 'chat',
            title: 'New Message',
            message: 'You have a new message from John Doe',
            read: true,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            referenceId: '67890',
            referenceType: 'chat'
          }
        ]
      });
    }, 500);
  });
};

// Description: Mark notification as read
// Endpoint: PATCH /api/notifications/:id
// Request: { read: boolean }
// Response: { success: boolean }
export const markNotificationAsRead = async (id: string) => {
  // Mock data
  return new Promise<{ success: boolean }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};

// Description: Delete notification
// Endpoint: DELETE /api/notifications/:id
// Response: { success: boolean }
export const deleteNotification = async (id: string) => {
  // Mock data
  return new Promise<{ success: boolean }>((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 500);
  });
};