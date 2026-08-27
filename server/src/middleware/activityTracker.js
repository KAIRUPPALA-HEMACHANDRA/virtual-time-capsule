const { prisma } = require('../config/db');

/**
 * Activity Tracker Middleware
 * 
 * Runs on every authenticated request and updates the user's
 * lastActiveAt timestamp. This is how we know if someone has
 * gone inactive — for Digital Legacy Mode.
 * 
 * We throttle updates to once every 5 minutes to avoid
 * hitting the database on literally every single request.
 */

const lastUpdateCache = new Map();
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

const trackActivity = async (req, res, next) => {
  if (!req.user?.userId) return next();

  const userId = req.user.userId;
  const now = Date.now();
  const lastUpdate = lastUpdateCache.get(userId) || 0;

  // Only update if 5+ minutes since last update
  if (now - lastUpdate > THROTTLE_MS) {
    lastUpdateCache.set(userId, now);

    // Fire and forget — don't slow down the request
    prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    }).catch(() => {}); // Ignore errors silently
  }

  next();
};

module.exports = { trackActivity };
