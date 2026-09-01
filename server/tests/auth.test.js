const request = require('supertest');
const { getApp, cleanup, disconnectDB } = require('./setup');

const app = getApp();

describe('Auth Endpoints', () => {
  let accessToken;

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
    await disconnectDB();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'auth-test@example.com', password: 'TestPass123' });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.name).toBe('Test User');
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.data.user.password).toBeUndefined();

      accessToken = res.body.accessToken;
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Duplicate', email: 'auth-test@example.com', password: 'TestPass123' });
      expect(res.status).toBe(409);
    });

    it('should reject weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Weak', email: 'weak@example.com', password: '123' });
      expect(res.status).toBe(400);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Bad', email: 'not-an-email', password: 'TestPass123' });
      expect(res.status).toBe(400);
    });

    it('should reject missing name', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'noname@example.com', password: 'TestPass123' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test@example.com', password: 'TestPass123' });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      accessToken = res.body.accessToken;
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'auth-test@example.com', password: 'WrongPass123' });
      expect(res.status).toBe(401);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'TestPass123' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('auth-test@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.status).toBe(401);
    });
  });
});

// const request = require('supertest');
// const { getApp, createTestUser, cleanup, disconnectDB } = require('./setup');

// const app = getApp();

// describe('Auth Endpoints', () => {
//   beforeAll(async () => {
//     await cleanup();
//   });

//   afterAll(async () => {
//     await cleanup();
//     await disconnectDB();
//   });

//   // ============================================
//   // REGISTER
//   // ============================================
//   describe('POST /api/auth/register', () => {
//     it('should register a new user successfully', async () => {
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send({
//           name: 'Test User',
//           email: 'auth-test@example.com',
//           password: 'TestPass123',
//         });

//       expect(res.status).toBe(201);
//       expect(res.body.status).toBe('success');
//       expect(res.body.data.user).toHaveProperty('id');
//       expect(res.body.data.user.name).toBe('Test User');
//       expect(res.body.data.user.email).toBe('auth-test@example.com');
//       expect(res.body.accessToken).toBeDefined();
//       // Password should NOT be in the response
//       expect(res.body.data.user.password).toBeUndefined();
//     });

//     it('should reject duplicate email', async () => {
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send({
//           name: 'Duplicate',
//           email: 'auth-test@example.com',
//           password: 'TestPass123',
//         });

//       expect(res.status).toBe(409);
//       expect(res.body.message).toMatch(/already exists/i);
//     });

//     it('should reject weak password', async () => {
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send({
//           name: 'Weak',
//           email: 'weak@example.com',
//           password: '123',
//         });

//       expect(res.status).toBe(400);
//     });

//     it('should reject invalid email', async () => {
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send({
//           name: 'Bad Email',
//           email: 'not-an-email',
//           password: 'TestPass123',
//         });

//       expect(res.status).toBe(400);
//     });

//     it('should reject missing name', async () => {
//       const res = await request(app)
//         .post('/api/auth/register')
//         .send({
//           email: 'noname@example.com',
//           password: 'TestPass123',
//         });

//       expect(res.status).toBe(400);
//     });
//   });

//   // ============================================
//   // LOGIN
//   // ============================================
//   describe('POST /api/auth/login', () => {
//     it('should login with correct credentials', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'auth-test@example.com',
//           password: 'TestPass123',
//         });

//       expect(res.status).toBe(200);
//       expect(res.body.status).toBe('success');
//       expect(res.body.accessToken).toBeDefined();
//       expect(res.body.data.user.email).toBe('auth-test@example.com');
//     });

//     it('should reject wrong password', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'auth-test@example.com',
//           password: 'WrongPass123',
//         });

//       expect(res.status).toBe(401);
//       expect(res.body.message).toMatch(/invalid/i);
//     });

//     it('should reject non-existent email', async () => {
//       const res = await request(app)
//         .post('/api/auth/login')
//         .send({
//           email: 'nonexistent@example.com',
//           password: 'TestPass123',
//         });

//       expect(res.status).toBe(401);
//     });
//   });

//   // ============================================
//   // PROTECTED ROUTE
//   // ============================================
//   describe('GET /api/auth/me', () => {
//     it('should return user profile with valid token', async () => {
//       // Login first to get token
//       const loginRes = await request(app)
//         .post('/api/auth/login')
//         .send({ email: 'auth-test@example.com', password: 'TestPass123' });

//       const token = loginRes.body.accessToken;

//       const res = await request(app)
//         .get('/api/auth/me')
//         .set('Authorization', `Bearer ${token}`);

//       expect(res.status).toBe(200);
//       expect(res.body.data.user.email).toBe('auth-test@example.com');
//     });

//     it('should reject request without token', async () => {
//       const res = await request(app).get('/api/auth/me');

//       expect(res.status).toBe(401);
//     });

//     it('should reject invalid token', async () => {
//       const res = await request(app)
//         .get('/api/auth/me')
//         .set('Authorization', 'Bearer invalidtoken123');

//       expect(res.status).toBe(401);
//     });
//   });
// });
