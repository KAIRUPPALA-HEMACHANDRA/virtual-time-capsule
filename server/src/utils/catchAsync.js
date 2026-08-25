/**
 * Wraps an async function so that any errors are automatically
 * passed to Express's error handling middleware.
 * 
 * WHY THIS EXISTS:
 * Without this, every controller would need a try-catch block:
 * 
 *   const createCapsule = async (req, res) => {
 *     try {
 *       // ... your logic
 *     } catch (error) {
 *       next(error);  // pass error to error handler
 *     }
 *   };
 * 
 * That's repetitive. With catchAsync, we write:
 * 
 *   const createCapsule = catchAsync(async (req, res) => {
 *     // ... your logic (no try-catch needed!)
 *   });
 * 
 * If anything throws inside, catchAsync automatically calls next(error).
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = catchAsync;
