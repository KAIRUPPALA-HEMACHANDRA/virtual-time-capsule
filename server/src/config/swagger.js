const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Swagger API Documentation Configuration
 * 
 * This auto-generates interactive API docs from JSDoc comments
 * in your route files. Accessible at /api/docs in the browser.
 * 
 * Interviewers LOVE seeing live API documentation — it shows
 * you think about developer experience, not just code.
 */

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Virtual Time Capsule API',
      version: '1.0.0',
      description: 'A full-stack API for creating, managing, and delivering time capsules with scheduled delivery, end-to-end encryption, geo-locking, capsule chains, sentiment analysis, and digital legacy mode.',
      contact: {
        name: 'Hemachandra',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Hemachandra' },
            email: { type: 'string', format: 'email', example: 'hema@test.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Capsule: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Message to Future Me' },
            content: { type: 'string', example: 'Hey future self!' },
            status: { type: 'string', enum: ['LOCKED', 'UNLOCKED', 'OPENED'] },
            unlockAt: { type: 'string', format: 'date-time' },
            openedAt: { type: 'string', format: 'date-time', nullable: true },
            isEncrypted: { type: 'boolean', default: false },
            isPublic: { type: 'boolean', default: false },
            isGeoLocked: { type: 'boolean', default: false },
            latitude: { type: 'number', nullable: true },
            longitude: { type: 'number', nullable: true },
            geoRadius: { type: 'integer', default: 100 },
            isLegacy: { type: 'boolean', default: false },
            legacyDays: { type: 'integer', nullable: true },
            prerequisiteId: { type: 'string', format: 'uuid', nullable: true },
            contentHash: { type: 'string', nullable: true },
            sentimentScore: { type: 'number', nullable: true },
            sentimentLabel: { type: 'string', nullable: true },
            creatorId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'fail' },
            message: { type: 'string', example: 'Error message here' },
          },
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Auth', description: 'Authentication — register, login, logout, refresh tokens' },
      { name: 'Capsules', description: 'Time capsule CRUD operations' },
      { name: 'Geo', description: 'Geo-locked capsule operations' },
      { name: 'Verify', description: 'Proof-of-creation certificate verification' },
      { name: 'Public', description: 'Public capsule wall' },
    ],
  },
  apis: ['./src/routes/*.js', './src/app.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
