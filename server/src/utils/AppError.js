/**
 * Custom error class for application errors.
 * 
 * WHY THIS EXISTS:
 * Instead of throwing generic errors like `throw new Error("Not found")`,
 * we throw `throw new AppError("Capsule not found", 404)`.
 * This carries the HTTP status code WITH the error, so our error handler
 * middleware knows exactly what status to send back to the client.
 * 
 * This is a pattern used in every professional Node.js application.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    // "Operational" means it's an expected error (bad input, not found, etc.)
    // as opposed to a programming bug (undefined variable, etc.)
    this.isOperational = true;

    // Captures the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
