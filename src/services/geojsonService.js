import * as FileSystem from 'expo-file-system';
import { api } from './api.js';

const geojsonDir = FileSystem.documentDirectory + 'geojson/';

export async function fetchCitiesList()
{
    const response = await api.get('/cities');
    return response.data;
}

export async function downloadGeojson(cityId)
{
    const localPath = `${geojsonDir}${cityId}.geojson`;

    await ensureGeojsonDirExists();

    try
    {
        const response = await api.get(`/cities/${cityId}/geojson`);
        await FileSystem.writeAsStringAsync(localPath, JSON.stringify(response.data));
        return localPath;
    }
    catch (error)
    {
        console.error('Failed to fetch or save geojson (download func):', error);
        throw error;
    }
}

export async function readGeojson(cityId)
{
    const localPath = `${geojsonDir}${cityId}.geojson`;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
  
    if (!fileInfo.exists)
        await downloadGeojson(cityId);
    const content = await FileSystem.readAsStringAsync(localPath);
    return JSON.parse(content);
}
  
export async function geojsonExists(cityId)
{
    const localPath = `${geojsonDir}${cityId}.geojson`;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    return fileInfo.exists;
}
  
async function ensureGeojsonDirExists()
{
    const dirInfo = await FileSystem.getInfoAsync(geojsonDir);
    if (!dirInfo.exists)
    {
      await FileSystem.makeDirectoryAsync(geojsonDir, { intermediates: true });
    }
}