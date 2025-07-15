import { loadCities } from './cityService';
import { downloadGeojson, geojsonExists } from './geojsonService';

// Haversine formula to calculate distance in km
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = deg => deg * (Math.PI / 180);
  const R = 6371; // Radius of Earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function prefetchGeojsonCities(currentCityId, userLocation) {
  const cities = await loadCities();

  const citiesWithDistance = cities
    .filter(city => city.id !== currentCityId)
    .map(city => {
      const [minLat, minLng, maxLat, maxLng] = JSON.parse(city.bbox);
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const distance = getDistanceKm(userLocation[0], userLocation[1], centerLat, centerLng);
      return { ...city, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  const priorityCities = citiesWithDistance.slice(0, 2); // 2 closest
  const remainingCities = citiesWithDistance.slice(2);

  // Download 2 closest cities first
  for (const city of priorityCities) {
    const exists = await geojsonExists(city.id);
    if (!exists) {
      try {
        console.log(`Downloading nearby city: ${city.name}`);
        await downloadGeojson(city.id);
      } catch (err) {
        console.warn(`Failed to download ${city.name}`, err.status, err);
      }
    }
  }

  // Download rest (background, silently)
  for (const city of remainingCities) {
    const exists = await geojsonExists(city.id);
    if (!exists) {
      try {
        console.log(`Downloading other city: ${city.name}`);
        await downloadGeojson(city.id);
      } catch (err) {
        console.warn(`Failed to download ${city.name}`, err);
      }
    }
  }
}