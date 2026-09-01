const { prisma } = require('../config/db');
const { emitToUser } = require('../config/socket');

/**
 * Notification Service
 * 
 * Creates persistent notifications stored in the database
 * AND pushes them in real-time via Socket.io.
 */

async function createNotification({ userId, type, title, message, capsuleId }) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      capsuleId: capsuleId || null,
    },
  });

  // Push to user in real-time
  emitToUser(userId, 'notification', notification);

  return notification;
}

async function getUserNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function getUnreadCount(userId) {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

async function markAsRead(notificationId, userId) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
