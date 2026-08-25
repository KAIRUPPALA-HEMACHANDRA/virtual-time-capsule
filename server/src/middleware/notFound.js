const AppError = require('../utils/AppError');

/**
 * Catches any request to a URL that doesn't match any defined route.
 * This middleware should be registered AFTER all your actual routes.
 * 
 * Example: If someone hits GET /api/banana and you have no such route,
 * this sends back a clear 404 instead of a confusing empty response.
 */
function notFound(req, res, next) {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
}

module.exports = notFound;
