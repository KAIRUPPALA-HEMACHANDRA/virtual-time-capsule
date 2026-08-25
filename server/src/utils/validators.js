const { z } = require('zod');

/**
 * Zod Validation Schemas
 * 
 * These schemas define EXACTLY what shape the incoming data must have.
 * If someone sends { email: "not-an-email", password: "12" }, Zod catches it
 * and gives a clear error message BEFORE our code even runs.
 * 
 * WHY THIS MATTERS:
 * Without validation, bad data gets into your database and causes bugs.
 * With Zod, every input is guaranteed to be the right type, format, and length.
 */

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(), // Normalize email to lowercase

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
