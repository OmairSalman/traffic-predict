import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function CallToActionScreen({ navigation, route }) {
  const { location } = route.params;

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/images/traffico-icon.png')} style={styles.icon} />
      <Text style={styles.title}>Get the most out of Traffico</Text>
      <Text style={styles.subtitle}>
        Create an account to sync your routes, unlock cloud storage, and access exclusive features.
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => navigation.navigate('RegisterScreen', { location: location })}
      >
        <Text style={styles.buttonText}>Create an Account</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('Final', { location: location })}
      >
        <Text style={[styles.buttonText, { color: 'blue' }]}>Continue Without Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff'
  },
  icon:
  {
    width: 96,
    height: 96,
    marginBottom: 20,
  },
  title:
  {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1d',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle:
  {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  button:
  {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryButton:
  {
    backgroundColor: 'blue',
  },
  secondaryButton:
  {
    borderColor: 'blue',
    borderWidth: 1,
  },
  buttonText:
  {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});