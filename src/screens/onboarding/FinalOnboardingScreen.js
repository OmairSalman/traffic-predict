import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { findCityForLocation } from '../../services/regionService.js';
import { downloadGeojson } from '../../services/geojsonService.js';
import { loadCities } from '../../services/cityService.js';
import { useEffect } from 'react';

export default function FinalOnboardingScreen({ navigation, route, finishOnboarding })
{
    const { location } = route.params;
    const [loading, setLoading] = useState(true);
    const [cityID, setCityID] = useState(0);

    useEffect(() =>
    {
        const downloadMapData = async () =>
        {
            const cities = await loadCities();
            const city = findCityForLocation(cities, location)
            setCityID(city.id);
            await downloadGeojson(city.id);
            setLoading(false);
        }

        downloadMapData();
    }, []);

    useEffect(() => {
        if (!loading && cityID && location) {
          finishOnboarding(cityID, location);
        }
      }, [loading, cityID]);
      

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Downloading map data</Text>
        <Text style={styles.subtitle}>the app will be ready shortly!</Text>
        <ActivityIndicator size="large"/>
        </View>
    );
}

const styles = StyleSheet.create({
container:
{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
},
title:
{
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
},
subtitle:
{
    fontSize: 18,
    marginBottom: 20
},
});