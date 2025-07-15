import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { downloadAndStoreCities } from '../../services/cityService';

export default function WelcomeScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const downloadCities = async () => {
    setLoading(true);
    await downloadAndStoreCities();
    navigation.navigate('LocPerm');
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/traffico-icon.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Traffico</Text>
      <Text style={styles.subtitle}>Plan smarter. Travel smoother.</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <TouchableOpacity style={styles.nextButton} onPress={downloadCities}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    //color: 'blue',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  nextButton: {
    backgroundColor: 'blue',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});