import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api.js';

export async function downloadCities()
{
    try
    {
        const response = await api.get('/cities');
        if(response)
        {
            const cities = response.data;
            return cities;
        }
    }
    catch(error)
    {
        console.error('Error downloading cities:', error);
        throw error;
    }
}

export async function downloadAndStoreCities()
{
    const cities = await downloadCities();
    await AsyncStorage.setItem('cities', JSON.stringify(cities));
}

export async function loadCities()
{
    return JSON.parse(await AsyncStorage.getItem('cities'));
}