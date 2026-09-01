const express = require('express');
const catchAsync = require('../utils/catchAsync');
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('../services/notificationService');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get all notifications for the current user
 *     security:
 *       - bearerAuth: []
 */
router.get('/', catchAsync(async (req, res) => {
  const notifications = await getUserNotifications(req.user.userId);
  const unreadCount = await getUnreadCount(req.user.userId);

  res.json({
    status: 'success',
    data: { notifications, unreadCount },
  });
}));

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a single notification as read
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id/read', catchAsync(async (req, res) => {
  await markAsRead(req.params.id, req.user.userId);
  res.json({ status: 'success', message: 'Marked as read' });
}));

/**
 * @swagger
 * /api/notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read
 *     security:
 *       - bearerAuth: []
 */
router.patch('/read-all', catchAsync(async (req, res) => {
  await markAllAsRead(req.user.userId);
  res.json({ status: 'success', message: 'All marked as read' });
}));

module.exports = router;
