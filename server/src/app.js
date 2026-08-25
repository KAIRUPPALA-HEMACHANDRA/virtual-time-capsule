const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const { CLIENT_URL } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import route files
const authRoutes = require('./routes/authRoutes');
const capsuleRoutes = require('./routes/capsuleRoutes');

const app = express();

// ============================================
// GLOBAL MIDDLEWARE
// ============================================

app.use(helmet());

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', apiLimiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🕰️ Virtual Time Capsule API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Auth routes: /api/auth/register, /api/auth/login, etc.
app.use('/api/auth', authRoutes);

// Capsule routes: /api/capsules (CRUD operations)
app.use('/api/capsules', capsuleRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

module.exports = app;
