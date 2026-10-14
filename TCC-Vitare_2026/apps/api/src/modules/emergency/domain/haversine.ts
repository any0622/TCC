export const EARTH_RADIUS_METERS = 6371000;

export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  if (
    lat1 < -90 ||
    lat1 > 90 ||
    lat2 < -90 ||
    lat2 > 90 ||
    lon1 < -180 ||
    lon1 > 180 ||
    lon2 < -180 ||
    lon2 > 180
  ) {
    throw new Error('Invalid coordinates');
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates,
): number {
  return haversineDistance(
    coord1.latitude,
    coord1.longitude,
    coord2.latitude,
    coord2.longitude,
  );
}
