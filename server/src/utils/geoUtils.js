/**
 * Geo Utilities
 * 
 * Calculates the distance between two GPS coordinates using
 * the Haversine formula — the standard method for computing
 * distances on a sphere (Earth).
 * 
 * HAVERSINE FORMULA:
 * Given two points on Earth (lat1, lon1) and (lat2, lon2),
 * it calculates the shortest distance between them along
 * the surface of the sphere.
 * 
 * This is the same math used by Google Maps, Uber, and every
 * location-based app. Having it in your project demonstrates
 * geospatial computation knowledge.
 */

/**
 * Calculate distance between two coordinates in meters
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

/**
 * Check if a user's position is within the unlock radius
 * @returns {{ withinRange: boolean, distance: number, required: number }}
 */
function checkGeoUnlock(userLat, userLon, capsuleLat, capsuleLon, radiusMeters) {
  const distance = haversineDistance(userLat, userLon, capsuleLat, capsuleLon);

  return {
    withinRange: distance <= radiusMeters,
    distance,
    required: radiusMeters,
    message: distance <= radiusMeters
      ? '✅ You are within range! Capsule can be unlocked.'
      : `❌ You are ${distance}m away. Get within ${radiusMeters}m to unlock.`,
  };
}

module.exports = { haversineDistance, checkGeoUnlock };
