const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { CLIENT_URL } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { trackActivity } = require('./middleware/activityTracker');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');


// Import route files
const authRoutes = require('./routes/authRoutes');
const capsuleRoutes = require('./routes/capsuleRoutes');
const verifyRoutes = require('./routes/verifyRoutes');
const publicRoutes = require('./routes/publicRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const collaborateRoutes = require('./routes/collaborateRoutes');
const shareRoutes = require('./routes/shareRoutes');


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
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/collaborate', collaborateRoutes);
app.use('/api/shared', shareRoutes);

// ============================================
// API DOCUMENTATION
// ============================================

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Virtual Time Capsule API Docs',
}));

// Serve raw swagger JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// ROUTES
// ============================================

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Check if the API server is running
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 🕰️ Virtual Time Capsule API is running!
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🕰️ Virtual Time Capsule API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Activity tracker
app.use('/api', trackActivity);

app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/public', publicRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use(notFound);
app.use(errorHandler);

module.exports = app;
