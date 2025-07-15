import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { getCurrentLocation } from '../../services/regionService';
import Entypo from '@expo/vector-icons/Entypo';

export default function LocationPermissionScreen({ navigation }) {
  const [requesting, setRequesting] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [location, setLocation] = useState(null);

  const handlePermission = async () => {
    setRequesting(true);
    const { location, permissionGranted } = await getCurrentLocation();
    setStatusText(permissionGranted
      ? 'Location permission granted!'
      : 'Permission denied. Default location will be used.');
    setLocation([location.latitude, location.longitude]);
    setRequesting(false);
  };

  const handleNext = () => {
    if (location) {
      navigation.navigate('IntroSlider', { location: location });
    } else {
      setStatusText('Please grant permission first.');
    }
  };

  return (
    <View style={styles.container}>
        <Entypo name="location" size={96} color="black" marginBottom={15} />
      <Text style={styles.title}>Location Access</Text>
      <Text style={styles.subtitle}>
        We use your location to detect your city and load the correct map.
      </Text>

      {statusText ? <Text style={styles.status}>{statusText}</Text> : null}

      {requesting ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handlePermission}>
            <Text style={styles.buttonText}>Grant Location Permission</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, { backgroundColor: '#666' }]} onPress={handleNext}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  status: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginVertical: 10,
    minWidth: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});