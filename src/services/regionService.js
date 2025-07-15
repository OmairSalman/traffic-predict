import * as Location from 'expo-location';

export async function getCurrentLocation()
{
    const { status } = await Location.requestForegroundPermissionsAsync();
    const permissionGranted = status === 'granted';

    if (!permissionGranted)
    {
      return {location: [31.778236604927155, 35.2354491908048], permissionGranted: false};
    }

    const location = await Location.getCurrentPositionAsync({});
    return {location: location.coords, permissionGranted: true};
}

export function findCityForLocation(cities, location)
{
  city = cities.find((city) =>
  {
    const [minLat, minLng, maxLat, maxLng] = JSON.parse(city.bbox);
    return (
      (location[0] >= minLat) &&
      (location[0] <= maxLat) &&
      (location[1] >= minLng) &&
      (location[1] <= maxLng)
    );
  });
  return city;
}