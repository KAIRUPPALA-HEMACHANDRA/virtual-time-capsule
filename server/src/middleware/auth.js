const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/tokenUtils');

/**
 * Protect Middleware
 * 
 * This middleware sits in front of any route that requires authentication.
 * It checks if the request has a valid JWT access token.
 * 
 * HOW IT WORKS:
 * 1. Check if the Authorization header exists and has the format "Bearer <token>"
 * 2. Verify the token is valid (not expired, not tampered with)
 * 3. Attach the decoded user info to req.user
 * 4. Call next() to proceed to the actual route handler
 * 
 * If any step fails → 401 Unauthorized error
 * 
 * USAGE IN ROUTES:
 *   router.get('/me', protect, authController.getMe);
 *   // The getMe controller can now access req.user.userId
 */
const protect = (req, res, next) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError('You are not logged in. Please log in to access this resource.', 401)
    );
  }

  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('No token provided', 401));
  }

  // 2. Verify the token
  try {
    const decoded = verifyAccessToken(token);
    
    // 3. Attach user info to the request object
    // Now every controller/middleware after this can access req.user
    req.user = {
      userId: decoded.userId,
    };

    // 4. Proceed to the next middleware/controller
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }
};

module.exports = { protect };
