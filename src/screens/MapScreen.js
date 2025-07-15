import { useNavigation } from '@react-navigation/native';
import MapboxGL from '@rnmapbox/maps';
import * as Location from 'expo-location';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import ForecastBar from '../componenets/ForecastBar.js';
import { api } from '../services/api.js';
import { loadCities } from '../services/cityService.js';
import * as GeojsonService from '../services/geojsonService.js';
import { findCityForLocation } from '../services/regionService.js';
import DailyForecastScreen from './DailyForecastScreen.js';

MapboxGL.setAccessToken("pk.eyJ1Ijoib21haXJzYWxtYW4iLCJhIjoiY2xoMXg3aTgyMDhsczNwcGxvdm5jZXFiaCJ9.Jv6A1r5uZknos27ABhCPYA");

export default function MapScreen({cityID, tempLocation})
{
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(false);
  const [dailyForecastData, setDailyForecastData] = useState(null);

  const [activeRegions, setActiveRegions] = useState([]); // Currently rendered
  const [loadedGeojsons, setLoadedGeojsons] = useState({}); // { cityId: geojsonData }


  useEffect(() => {
    MapboxGL.setTelemetryEnabled(true);

    const getLocation = async () =>
    {
      if(tempLocation.length > 1)
      {
        setLocation([tempLocation[0], tempLocation[1]]);
        const cityGeojson = await GeojsonService.readGeojson(cityID);
        setActiveRegions([cityID]);
        setLoadedGeojsons(prev => ({ ...prev, [cityID]: cityGeojson }));
      }
      else
      {
        const { status } = await Location.requestForegroundPermissionsAsync();
        //const granted = await MapboxGL.requestAndroidLocationPermissions();
        if (status)
        {
          const userLocation = await MapboxGL.locationManager.getLastKnownLocation();
          if (userLocation)
          {
            setLocation([userLocation.coords.latitude, userLocation.coords.longitude]);
            const cities = await loadCities();
            const city = findCityForLocation(cities, [userLocation.coords.latitude, userLocation.coords.longitude]);
            const cityGeojson = await GeojsonService.readGeojson(city.id);
            setActiveRegions([city.id]);
            setLoadedGeojsons(prev => ({ ...prev, [city.id]: cityGeojson }));
          }
        }
        else
        {
          setLocation([31.778236604927155, 35.2354491908048]);
          const cities = await loadCities();
          const city = findCityForLocation(cities, [31.778236604927155, 35.2354491908048]);
          const cityGeojson = await GeojsonService.readGeojson(city.id);
          setActiveRegions([city.id]);
          setLoadedGeojsons(prev => ({ ...prev, [city.id]: cityGeojson }));
        }
      }
      setLoading(false);
    };

    getLocation();
  }, []);

  useEffect(() =>
  {
    if(!loading)
      SplashScreen.hideAsync();
  }, [loading]);

  useEffect(() => {
    if (!selectedStreet) return;
  
    const fetchPrediction = async () => {
      setPredictionLoading(true);
      setPredictionError(false);
  
      try
      {
        const res = await api.get(`/streets/47295019/forecast`);
        const data = res.data;
        setPredictionData(data);
      } catch (err) {
        console.error("Prediction fetch error:", err);
        setPredictionError(true);
      } finally {
        setPredictionLoading(false);
      }
    };
  
    fetchPrediction();
  }, [selectedStreet]);

  const LegendItem = ({ color, label }) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );

  function getDistanceKm(lat1, lon1, lat2, lon2)
  {
    const toRad = deg => deg * (Math.PI / 180);
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const handleRegionChange = async (region) => 
  {
    try
    {
      const center = region.properties.center;
      const cities = await loadCities();
      const citiesWithDistance = cities
      .map(city => {
        const [minLat, minLng, maxLat, maxLng] = JSON.parse(city.bbox);
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const distance = getDistanceKm(center[1], center[0], centerLat, centerLng);
        return { ...city, distance };
      })
      .sort((a, b) => a.distance - b.distance);

      const bufferDistanceKM = 15;
      const keepCities = citiesWithDistance.slice(0, 2).filter(city => city.distance < bufferDistanceKM);
      const keepIds = keepCities.map(c => c.id);

      for (const city of keepCities) {
        if (!loadedGeojsons[city.id]) {
          const geojson = await GeojsonService.readGeojson(city.id);
          setLoadedGeojsons(prev => ({ ...prev, [city.id]: geojson }));
        }
      }
      setActiveRegions(keepIds);
    }
    catch(error)
    {
      console.error(error);
    }
  }

  if(loading)
    return null;

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        onMapIdle={(region) => handleRegionChange(region)}
      >
        <MapboxGL.Camera
          zoomLevel={16}
          centerCoordinate={
            location ? [location[1], location[0]] : [35.2354491908048, 31.778236604927155]
          }
        />

        {!loading && activeRegions.map(cityId => (
            <MapboxGL.ShapeSource
              key={`source-${cityId}`}
              id={`source-${cityId}`}
              shape={loadedGeojsons[cityId]}
              onPress={(e) => setSelectedStreet(e.features[0].properties.id)}
            >
              <MapboxGL.LineLayer
                id={`layer-${cityId}`}
                style={{ lineColor: 'blue', lineWidth: 4 }}
                belowLayerID="road-label"
              />
            </MapboxGL.ShapeSource>
          ))
        }
      </MapboxGL.MapView>

      {/* Modal */}
      <Modal
        visible={!!selectedStreet}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStreet(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Traffic Forecast</Text>
            <Text>Street: {selectedStreet}</Text>

            {predictionLoading ? (
              <ActivityIndicator size="large" />
            ) : predictionError ? (
              <Text style={styles.errorText}>Failed to load prediction</Text>
            ) : (
              <View>
                <View style={styles.forecastRow}>
                  {predictionData?.days?.map((day, index) => (
                    <ForecastBar
                    key={index}
                    day={day}
                    onPress={() =>setDailyForecastData(day)}
                  />
                  ))}
                </View>
                <Text>Traffic situation:</Text>
                <View style={styles.legendContainer}>
                  <LegendItem color="#4CAF50" label="Low" />
                  <LegendItem color="#FFC107" label="Normal" />
                  <LegendItem color="#FF9800" label="High" />
                  <LegendItem color="#F44336" label="Heavy" />
                </View>
              </View>
            )}

            {/*<TouchableOpacity onPress={() => setSelectedStreet(null)} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>*/}
          </View>
        </View>
      </Modal>

      {dailyForecastData && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={() => setDailyForecastData(null)}
        >
          <View style={{ flex: 1 }}>
            <DailyForecastScreen day={dailyForecastData} />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#000000aa',
    //padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopStartRadius: 20,
    borderTopEndRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  dayBlock: {
    //flex: 1,
    marginTop: 10,
  },
  dayTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  predictionRow: {
    paddingLeft: 10,
  },
  predictionItem: {
    fontSize: 12,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontStyle: 'italic',
  },
  forecastRow: {
    paddingVertical: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 4,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: '#333',
  },  
});