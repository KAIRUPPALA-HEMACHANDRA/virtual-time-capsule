const AppError = require('../utils/AppError');

/**
 * Global error handling middleware.
 * 
 * HOW IT WORKS:
 * Express recognizes middleware with 4 parameters (err, req, res, next)
 * as error-handling middleware. When ANY route throws an error or calls
 * next(error), Express skips all normal middleware and jumps straight here.
 * 
 * This is the SINGLE place in our entire app where errors become HTTP responses.
 * No controller ever sends an error response directly - they all flow through here.
 */

// Handle Prisma-specific errors and convert them to AppErrors
function handlePrismaError(err) {
  // Unique constraint violation (e.g., duplicate email)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return new AppError(`A record with this ${field} already exists.`, 409);
  }
  // Record not found
  if (err.code === 'P2025') {
    return new AppError('Record not found.', 404);
  }
  return err;
}

// Handle JWT errors
function handleJWTError() {
  return new AppError('Invalid token. Please log in again.', 401);
}

function handleJWTExpiredError() {
  return new AppError('Your session has expired. Please log in again.', 401);
}

// The actual error handling middleware
function errorHandler(err, req, res, _next) {
  // Default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // In development: send full error details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 ERROR:', err);
    
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // In production: send clean error messages, hide internal details
  let error = { ...err, message: err.message };

  // Convert known error types to user-friendly messages
  if (err.code?.startsWith('P')) error = handlePrismaError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  // Operational errors: errors we anticipated (bad input, not found, etc.)
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Programming errors: bugs we didn't anticipate - don't leak details
  console.error('🔴 UNEXPECTED ERROR:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
}

module.exports = errorHandler;
