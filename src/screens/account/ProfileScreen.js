import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useUser } from '../../components/UserContext';
import { getSavedRoutes } from '../../storage/routeStorage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useToast } from 'expo-toast';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useUser();
  const [routeCount, setRouteCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const loadRoutes = async () => {
      const saved = await getSavedRoutes();
      setRouteCount(saved?.length || 0);
    };
    loadRoutes();
  }, []);

  const handleLogout = async () =>
    {
      try
      {
        await logout();
        toast.show('Logged out successfully',
          {
            type: 'success',
            duration: 3000,
            placement: 'bottom',
          }
        );
      }
      catch(error)
      {
        console.error(error);
      }
      navigation.navigate('MapScreen');
    };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={30} color="black" />
      </TouchableOpacity>
      <View style={styles.card}>
        <Icon name="account-circle" size={80} color="blue" />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="map-marker-path" size={22} color="#333" style={styles.infoIcon} />
        <Text style={styles.infoLabel}>Saved Routes: </Text>
        <Text style={styles.infoValue}>{routeCount}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => {
          Alert.alert(
            'Confirm Logout',
            'Are you sure you want to log out?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Log Out',
                onPress: handleLogout,
                style: 'destructive'
              },
            ],
            { cancelable: true }
          );
        }}>
        <Icon name="logout" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton:
  {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  card: {
    alignItems: 'center',
    marginBottom: 30,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 14,
    borderRadius: 10,
    marginBottom: 40,
    width: '100%',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'crimson',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});