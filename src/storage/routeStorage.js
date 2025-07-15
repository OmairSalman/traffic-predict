import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

const ROUTES_KEY = '@saved_routes';

export async function getSavedRoutes() {
  try {
    const json = await AsyncStorage.getItem(ROUTES_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to fetch saved routes', e);
    return [];
  }
}

export async function saveRoute(route) {
  try
  {
    const routes = await getSavedRoutes();
    const updated = [...routes, route];
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save route', e);
  }
}

export async function deleteRoute(routeId) {
  try {
    const routes = await getSavedRoutes();
    const updated = routes.filter(r => r.id !== routeId);
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete route', e);
  }
}

export async function clearAllRoutes() {
  try {
    await AsyncStorage.removeItem(ROUTES_KEY);
  } catch (e) {
    console.error('Failed to clear routes', e);
  }
}

export async function syncRoutesWithCloud()
{
  try
  {
    const localRoutes = await getSavedRoutes();
    const response = await api.get('/routes');
    const cloudRoutes = response.data || [];

    const cloudIds = new Set(cloudRoutes.map(route => route.id));
    const unsynced = localRoutes.filter(route => !cloudIds.has(route.id));

    for (const route of unsynced) 
    {
      await api.post('/route', route);
    }

    // Merge cloud + unsynced (in case some local-only routes failed upload, we retain them)
    const finalList = [...cloudRoutes, ...unsynced];
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(finalList));
  } catch (error) {
    console.error('Failed to sync routes:', error);
  }
}