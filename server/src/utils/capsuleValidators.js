const { z } = require('zod');

/**
 * Capsule Validation Schemas
 * 
 * These ensure every capsule has a valid title, content, and a future unlock date.
 * You can't create a capsule that unlocks in the past — that defeats the purpose!
 */

const createCapsuleSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters'),

  content: z
    .string()
    .max(10000, 'Content must be less than 10,000 characters')
    .optional(),

  unlockAt: z
    .string({ required_error: 'Unlock date is required' })
    .datetime({ message: 'Please provide a valid date in ISO format' })
    .refine(
      (date) => new Date(date) > new Date(),
      { message: 'Unlock date must be in the future' }
    ),

  isPublic: z
    .boolean()
    .optional()
    .default(false),
});

const updateCapsuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .optional(),

  content: z
    .string()
    .max(10000, 'Content must be less than 10,000 characters')
    .optional(),

  unlockAt: z
    .string()
    .datetime({ message: 'Please provide a valid date in ISO format' })
    .refine(
      (date) => new Date(date) > new Date(),
      { message: 'Unlock date must be in the future' }
    )
    .optional(),

  isPublic: z
    .boolean()
    .optional(),
});

module.exports = {
  createCapsuleSchema,
  updateCapsuleSchema,
};
