const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');

/**
 * Upload Middleware
 * 
 * Multer handles multipart/form-data — the format used when
 * forms include file uploads. It saves files to disk and makes
 * file info available via req.file (single) or req.files (multiple).
 * 
 * SECURITY:
 * - Only specific file types are allowed (images, audio, video, PDF)
 * - File size is limited to 10MB per file
 * - Maximum 5 files per capsule
 * - Original filenames are replaced with unique names to prevent conflicts
 */

// Where to save files and how to name them
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-randomstring.extension
    // Example: 1693000000000-a8b3c2d1.jpg
    const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  },
});

// Which file types are allowed
const allowedMimeTypes = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  // Audio
  'audio/mpeg',       // .mp3
  'audio/wav',
  'audio/webm',
  'audio/ogg',
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime',  // .mov
  // Documents
  'application/pdf',
];

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new AppError(
      `File type "${file.mimetype}" is not allowed. Accepted: images, audio, video, PDF.`,
      400
    ), false);
  }
}

// Create the multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,  // 10MB per file
    files: 5,                      // Maximum 5 files per request
  },
});

module.exports = upload;
