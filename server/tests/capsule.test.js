const request = require('supertest');
const { getApp, createTestUser, cleanup, disconnectDB } = require('./setup');

const app = getApp();

describe('Capsule Endpoints', () => {
  let testUser;
  let capsuleId;

  beforeAll(async () => {
    testUser = await createTestUser(request);
  });

  afterAll(async () => {
    await cleanup();
    await disconnectDB();
  });

  // ============================================
  // CREATE CAPSULE
  // ============================================
  describe('POST /api/capsules', () => {
    it('should create a capsule successfully', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const res = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .field('title', 'Test Capsule')
        .field('content', 'This is a test message')
        .field('unlockAt', futureDate.toISOString());

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.capsule.title).toBe('Test Capsule');
      expect(res.body.data.capsule.status).toBe('LOCKED');
      expect(res.body.data.capsule.contentHash).toBeDefined();

      capsuleId = res.body.data.capsule.id;
    });

    it('should reject capsule without title', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const res = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .field('content', 'No title capsule')
        .field('unlockAt', futureDate.toISOString());

      expect(res.status).not.toBe(201);
    });

    it('should reject capsule without auth', async () => {
      const res = await request(app)
        .post('/api/capsules')
        .field('title', 'No Auth')
        .field('unlockAt', new Date(Date.now() + 86400000).toISOString());

      expect(res.status).toBe(401);
    });

    it('should create capsule with geo-lock', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const res = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .field('title', 'Geo Capsule')
        .field('content', 'Geo-locked content')
        .field('unlockAt', futureDate.toISOString())
        .field('isGeoLocked', 'true')
        .field('latitude', '17.385')
        .field('longitude', '78.4867')
        .field('geoRadius', '200');

      expect(res.status).toBe(201);
      expect(res.body.data.capsule.isGeoLocked).toBe(true);
      expect(res.body.data.capsule.latitude).toBe(17.385);
    });

    it('should create legacy capsule', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 365);

      const res = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .field('title', 'Legacy Capsule')
        .field('content', 'Legacy message')
        .field('unlockAt', futureDate.toISOString())
        .field('isLegacy', 'true')
        .field('legacyDays', '180');

      expect(res.status).toBe(201);
      expect(res.body.data.capsule.isLegacy).toBe(true);
      expect(res.body.data.capsule.legacyDays).toBe(180);
    });
  });

  // ============================================
  // GET CAPSULES
  // ============================================
  describe('GET /api/capsules', () => {
    it('should return all user capsules', async () => {
      const res = await request(app)
        .get('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.capsules).toBeInstanceOf(Array);
      expect(res.body.data.capsules.length).toBeGreaterThan(0);
    });

    it('should hide content for locked capsules', async () => {
      const res = await request(app)
        .get('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      const lockedCapsule = res.body.data.capsules.find(
        (c) => c.status === 'LOCKED' && !c.content
      );
      // In list view, locked capsule content should be null
      expect(lockedCapsule).toBeDefined();
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/capsules');
      expect(res.status).toBe(401);
    });
  });

  // ============================================
  // GET SINGLE CAPSULE
  // ============================================
  describe('GET /api/capsules/:id', () => {
    it('should return a single capsule', async () => {
      const res = await request(app)
        .get(`/api/capsules/${capsuleId}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.capsule.id).toBe(capsuleId);
    });

    it('should return 404 for non-existent capsule', async () => {
      const res = await request(app)
        .get('/api/capsules/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ============================================
  // UPDATE CAPSULE
  // ============================================
  describe('PATCH /api/capsules/:id', () => {
    it('should update a locked capsule', async () => {
      const res = await request(app)
        .patch(`/api/capsules/${capsuleId}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.data.capsule.title).toBe('Updated Title');
    });

    it('should reject update from another user', async () => {
      const otherUser = await createTestUser(request, {
        email: 'other@example.com',
      });

      const res = await request(app)
        .patch(`/api/capsules/${capsuleId}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
    });
  });

  // ============================================
  // DELETE CAPSULE
  // ============================================
  describe('DELETE /api/capsules/:id', () => {
    it('should delete own capsule', async () => {
      // Create a capsule to delete
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const createRes = await request(app)
        .post('/api/capsules')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .field('title', 'To Delete')
        .field('unlockAt', futureDate.toISOString());

      const deleteId = createRes.body.data.capsule.id;

      const res = await request(app)
        .delete(`/api/capsules/${deleteId}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted/i);
    });

    it('should reject delete without auth', async () => {
      const res = await request(app).delete(`/api/capsules/${capsuleId}`);
      expect(res.status).toBe(401);
    });
  });

  // ============================================
  // HEALTH CHECK
  // ============================================
  describe('GET /api/health', () => {
    it('should return server status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.message).toContain('running');
    });
  });

  // ============================================
  // 404 HANDLER
  // ============================================
  describe('Unknown routes', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.status).toBe(404);
    });
  });
});
