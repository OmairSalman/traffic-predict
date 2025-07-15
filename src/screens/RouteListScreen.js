import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteRoute, getSavedRoutes } from '../storage/routeStorage';
import { useUser } from '../components/UserContext';
import { deleteCloudRoute } from '../services/cloudRoutes';

export default function RoutesListScreen({ navigation })
{
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const savedRoutes = await getSavedRoutes();
      setRoutes(savedRoutes || []);
      setLoading(false);
    };

    const unsubscribe = navigation.addListener('focus', loadRoutes);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (routeId) => {
    Alert.alert('Delete Route', 'Are you sure you want to delete this route?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteRoute(routeId);

          if (user)
          {
            try
            {
              await deleteCloudRoute(routeId);
            }
            catch (error)
            {
              console.error('Failed to delete route', error);
            }
          }

          const updatedRoutes = await getSavedRoutes();
          setRoutes(updatedRoutes || []);
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeInfo}>
        <Text style={styles.routeName}>{item.name}</Text>
        <Text style={styles.routeTime}>{`Start Time`}: {item.time}</Text>
        <Text style={styles.routeDistance}>{`Distance: `} {item.distance.toFixed(1)} {'km'}</Text>
        {item.active_days && item.active_days.length > 0 && (
        <Text style={styles.routeDays}>
          Days: {item.active_days.join(', ')}
        </Text>
      )}
      </View>
      <View style={styles.routeActions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MapScreen', { openRoute: item })}
        >
          <Text style={styles.buttonText}>Open Route</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#dc3545' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if(loading)
    return (
      <View style={{flex: 1, justifyContent: 'center'}}>
        <ActivityIndicator size="large"/>
      </View>
  );

  return (
    <View style={styles.container}>
      {routes.length === 0 ? (
        <Text style={styles.emptyText}>No saved routes yet.</Text>
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  routeCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  routeInfo: {
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeTime: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  routeDistance: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  routeDays: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
  },  
});