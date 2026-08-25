const AppError = require('../utils/AppError');

/**
 * Validation Middleware Factory
 * 
 * Takes a Zod schema and returns middleware that validates req.body against it.
 * 
 * USAGE IN ROUTES:
 *   router.post('/register', validate(registerSchema), authController.register);
 * 
 * HOW IT WORKS:
 * 1. Request comes in with JSON body
 * 2. This middleware runs the body through the Zod schema
 * 3. If validation passes → data is cleaned/transformed and attached to req.body
 * 4. If validation fails → sends a 400 error with clear messages about what's wrong
 * 
 * The "safeParse" method doesn't throw - it returns { success, data, error }
 * so we can handle failures gracefully and send readable error messages.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    // Extract readable error messages from Zod's error format
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),   // Which field failed (e.g., "email", "password")
      message: err.message,        // What went wrong (e.g., "Must be at least 8 characters")
    }));

    // Send the first error message as the main message
    return next(new AppError(errors[0].message, 400));
  }

  // Replace req.body with the validated + cleaned data
  // This is important because Zod may have transformed the data
  // (e.g., trimmed whitespace, lowercased email)
  req.body = result.data;
  next();
};

module.exports = validate;
