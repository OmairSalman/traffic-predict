import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator.js';
import WelcomeNavigator from './src/navigation/WelcomeNavigator.js';
import { loadCities } from './src/services/cityService.js';
import { downloadGeojson } from './src/services/geojsonService.js';
import { prefetchGeojsonCities } from './src/services/geojsonPrefetcher.js';

export default function App()
{
  const [onboarded, setOnboarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState([]);
  const [cityID, setCityID] = useState(null);

  useEffect(() =>
  {
    SplashScreen.preventAutoHideAsync();
    const checkOnboardedStatus = async () =>
    {
      const cities = await loadCities();
      if(cities)
      {
        setOnboarded(true);
      }
      setLoading(false);
    }

    checkOnboardedStatus();
  }, []);

  const finishOnboarding = (cityID, location) =>
  {
    setLocation(location);
    setCityID(cityID);
    setOnboarded(true);
    prefetchGeojsonCities(cityID, location);
  };

  if(loading)
    return null;

  if(!onboarded)
    return (<WelcomeNavigator screenProps={{ finishOnboarding }}/>);
  return (<AppNavigator screenProps={{ cityID, location }}/>);
}