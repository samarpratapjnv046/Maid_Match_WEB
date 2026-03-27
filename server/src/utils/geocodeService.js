/**
 * Geocode Service
 * Converts Indian pincodes to lat/lng coordinates via OpenStreetMap Nominatim
 * and calculates the Haversine distance between two pincodes.
 *
 * Nominatim usage policy: max 1 req/sec, must include a valid User-Agent.
 * In-memory cache prevents duplicate requests across bookings.
 */

const pincodeCache = new Map();

/**
 * Fetches coordinates for an Indian pincode.
 * Returns { lat, lng } or throws on failure.
 */
export const getPincodeCoordinates = async (pincode) => {
  const key = String(pincode).trim();

  if (pincodeCache.has(key)) return pincodeCache.get(key);

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?postalcode=${encodeURIComponent(key)}&countrycodes=in&format=json&limit=1`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MaidSaathi/1.0 (contact@MaidSaathi.in)',
      'Accept-Language': 'en',
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding service returned HTTP ${response.status}.`);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No location found for pincode ${key}. Please check the pincode and try again.`);
  }

  const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  pincodeCache.set(key, coords);
  return coords;
};

/**
 * Haversine formula — returns straight-line distance in km between two points.
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Returns the distance (km, 1 decimal) between two pincodes.
 * Both geocode calls run in parallel.
 */
export const getDistanceBetweenPincodes = async (pincode1, pincode2) => {
  const [c1, c2] = await Promise.all([
    getPincodeCoordinates(pincode1),
    getPincodeCoordinates(pincode2),
  ]);
  const rawKm = haversineDistance(c1.lat, c1.lng, c2.lat, c2.lng);
  return Math.round(rawKm * 10) / 10; // one decimal place
};
