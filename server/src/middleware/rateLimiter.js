const rateLimit = require('express-rate-limit');

/**
 * Rate limiters control how many requests a client can make
 * in a given time window. This prevents:
 * - Brute force password attacks
 * - API abuse / spam
 * - Denial of service from a single source
 * 
 * We create separate limiters for different contexts because
 * login attempts should be more strictly limited than general API calls.
 */

// General API rate limiter
// Allows 100 requests per 15 minutes per IP address
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for authentication routes
// Allows only 10 login/register attempts per 15 minutes per IP
// This prevents brute force password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 'fail',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
