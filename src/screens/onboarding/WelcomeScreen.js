import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { downloadAndStoreCities } from '../../services/cityService';

export default function WelcomeScreen({ navigation })
{
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init()
    {
      await downloadAndStoreCities();
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() =>
  {
    if(!loading)
      SplashScreen.hideAsync();
  }, [loading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Traffico</Text>
      <Text style={styles.subtitle}>traffic forecasting app</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Next" onPress={() => navigation.navigate('LocPerm')} />
      )}
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