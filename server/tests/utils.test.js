const { generateContentHash, verifyContentHash } = require('../src/utils/hashUtils');
const { haversineDistance, checkGeoUnlock } = require('../src/utils/geoUtils');
const { analyzeSentiment } = require('../src/utils/sentimentUtils');

describe('Utility Functions', () => {

  // ============================================
  // HASH UTILS
  // ============================================
  describe('Hash Utils', () => {
    it('should generate a consistent hash for same input', () => {
      const date = new Date('2026-01-01');
      const hash1 = generateContentHash('Title', 'Content', date);
      const hash2 = generateContentHash('Title', 'Content', date);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different content', () => {
      const date = new Date('2026-01-01');
      const hash1 = generateContentHash('Title', 'Content A', date);
      const hash2 = generateContentHash('Title', 'Content B', date);
      expect(hash1).not.toBe(hash2);
    });

    it('should generate a 64-character hex string', () => {
      const hash = generateContentHash('Test', 'Test', new Date());
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should verify matching content', () => {
      const date = new Date('2026-01-01');
      const hash = generateContentHash('Title', 'Content', date);
      expect(verifyContentHash('Title', 'Content', date, hash)).toBe(true);
    });

    it('should reject non-matching content', () => {
      const date = new Date('2026-01-01');
      const hash = generateContentHash('Title', 'Content', date);
      expect(verifyContentHash('Title', 'Tampered', date, hash)).toBe(false);
    });
  });

  // ============================================
  // GEO UTILS
  // ============================================
  describe('Geo Utils', () => {
    it('should calculate distance between two points', () => {
      // Hyderabad to Mumbai: ~620 km
      const distance = haversineDistance(17.385, 78.4867, 19.076, 72.8777);
      expect(distance).toBeGreaterThan(600000);
      expect(distance).toBeLessThan(650000);
    });

    it('should return 0 for same location', () => {
      const distance = haversineDistance(17.385, 78.4867, 17.385, 78.4867);
      expect(distance).toBe(0);
    });

    it('should approve unlock within radius', () => {
      const result = checkGeoUnlock(17.385, 78.4867, 17.385, 78.4867, 100);
      expect(result.withinRange).toBe(true);
      expect(result.distance).toBe(0);
    });

    it('should reject unlock outside radius', () => {
      // Points ~1km apart
      const result = checkGeoUnlock(17.385, 78.4867, 17.395, 78.4867, 100);
      expect(result.withinRange).toBe(false);
      expect(result.distance).toBeGreaterThan(100);
    });
  });

  // ============================================
  // SENTIMENT UTILS
  // ============================================
  describe('Sentiment Utils', () => {
    it('should detect happy sentiment', () => {
      const result = analyzeSentiment('I am so happy and excited! This is amazing!');
      expect(result.label).toBe('happy');
      expect(result.score).toBeGreaterThan(0.5);
    });

    it('should detect sad sentiment', () => {
      const result = analyzeSentiment('I feel terrible and awful. Everything is bad.');
      expect(result.label).toBe('sad');
      expect(result.score).toBeLessThan(-0.5);
    });

    it('should detect neutral sentiment', () => {
      const result = analyzeSentiment('I went to the store today.');
      expect(['neutral', 'hopeful']).toContain(result.label);
    });

    it('should handle empty text', () => {
      const result = analyzeSentiment('');
      expect(result.label).toBe('neutral');
      expect(result.score).toBe(0);
    });

    it('should return emoji with result', () => {
      const result = analyzeSentiment('Great wonderful fantastic!');
      expect(result.emoji).toBeDefined();
    });
  });
});
