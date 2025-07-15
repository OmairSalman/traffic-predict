import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { findCityForLocation } from '../../services/regionService.js';
import { downloadGeojson } from '../../services/geojsonService.js';
import { loadCities } from '../../services/cityService.js';

export default function FinalOnboardingScreen({ navigation, route, finishOnboarding }) {
  const { location } = route.params;
  const [loading, setLoading] = useState(true);
  const [cityID, setCityID] = useState(null);

  useEffect(() => {
    const downloadMapData = async () => {
      const cities = await loadCities();
      const city = findCityForLocation(cities, location);
      setCityID(city.id);
      await downloadGeojson(city.id);
      setLoading(false);
    };

    downloadMapData();
  }, []);

  useEffect(() => {
    if (!loading && cityID && location) {
      finishOnboarding(cityID, location);
    }
  }, [loading, cityID]);

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/traffico-icon.png')} style={styles.icon} />
      <Text style={styles.title}>Getting Traffico ready for you</Text>
      <Text style={styles.subtitle}>We're downloading the latest map data...</Text>
      <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 30 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  icon:
  {
    width: 64,
    height: 64,
    marginBottom: 20,
  },
  title:
  {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1d1d1d',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle:
  {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
});