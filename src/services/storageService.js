import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export async function getToken()
{
  try
  {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token)
    {
      return token;
    }
    return null;
  }
  catch (error)
  {
    const errorDate = new Date();
    const errorDateString = errorDate.toLocaleDateString();
    const errorTimeString = errorDate.toLocaleTimeString();
    console.error(`[${errorDateString} @ ${errorTimeString}] Error getting the authentication token from secure storage: `, error);
    return null;
  }
}

export async function storeToken(token)
{
  try
  {
    await SecureStore.setItemAsync('auth_token', token);
  }
  catch (error)
  {
    const errorDate = new Date();
    const errorDateString = errorDate.toLocaleDateString();
    const errorTimeString = errorDate.toLocaleTimeString();
    console.error(`[${errorDateString} @ ${errorTimeString}] Error storing authentication token in secure storage: `, error);
  }
}

export async function removeToken()
{
  await SecureStore.deleteItemAsync('auth_token');
}

export async function getUserData()
{
  return JSON.parse(await AsyncStorage.getItem('userData'));
}

export async function storeUserData(userData)
{
  await AsyncStorage.setItem('userData', JSON.stringify(userData));
}

export async function removeUserData()
{
  await AsyncStorage.removeItem('userData');
}