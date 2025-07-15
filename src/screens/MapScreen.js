import * as IconGroups from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import * as turf from '@turf/turf';
import * as Location from 'expo-location';
import * as SplashScreen from 'expo-splash-screen';
import { useToast } from 'expo-toast';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import uuid from 'react-native-uuid';
import DailyForecastScreen from '../components/DailyForecastScreen.js';
import ForecastBar from '../components/ForecastBar.js';
import SkeletonForecastLoader from '../components/SkeletonForecastLoader.js';
import { useNetworkStatus } from '../components/useNetworkStatus.js';
import { useUser } from '../components/UserContext.js';
import { api } from '../services/api.js';
import { loadCities } from '../services/cityService.js';
import { uploadRoute } from '../services/cloudRoutes.js';
import * as GeojsonService from '../services/geojsonService.js';
import { findCityForLocation } from '../services/regionService.js';
import { saveRoute } from '../storage/routeStorage';

MapboxGL.setAccessToken("pk.eyJ1Ijoib21haXJzYWxtYW4iLCJhIjoiY2xoMXg3aTgyMDhsczNwcGxvdm5jZXFiaCJ9.Jv6A1r5uZknos27ABhCPYA");

export default function MapScreen({ route, navigation })
{
  const { cityID, tempLocation } = route.params;
  const { user } = useUser();

  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState(null);
  const [showLocation, setShowLocation] = useState(false);
  const [mapLineWidth, setMapLineWidth] = useState(6);
  
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(false);
  const [dailyForecastData, setDailyForecastData] = useState(null);

  const [activeRegions, setActiveRegions] = useState([]);
  const [loadedGeojsons, setLoadedGeojsons] = useState({});

  const [isPlanningRoute, setIsPlanningRoute] = useState(false);
  const [routeSetup, setRouteSetup] = useState(null);
  const [isSelectingPoints, setIsSelectingPoints] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [isRouteFinalized, setIsRouteFinalized] = useState(false);

  const [start_point, setStartPoint] = useState(null);
  const [end_point, setEndPoint] = useState(null);

  const [isVieweingRoute, setIsVieweingRoute] = useState(false);
  const [openRoute, setOpenRoute] = useState(null);

  const cameraRef = React.useRef(null);

  const toast = useToast();
  
  const selectedRouteGeojson = {
    type: "FeatureCollection",
    features: selectedRoute,
  };


  useEffect(() => {
    MapboxGL.setTelemetryEnabled(true);

    const getLocation = async () =>
    {
      if(tempLocation.length > 1)
      {
        setLocation(tempLocation);
        const cityGeojson = await GeojsonService.readGeojson(cityID);
        setActiveRegions([cityID]);
        setLoadedGeojsons(prev => ({ ...prev, [cityID]: cityGeojson }));
        focusLocation();
      }
      else
      {
        const { status } = await Location.requestForegroundPermissionsAsync();
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
    if (!selectedFeature) return;
  
    const fetchPrediction = async () =>
    {
      setPredictionLoading(true);
      setPredictionError(false);
      const selectedStreet = selectedFeature.properties.id;
  
      try
      {
        const res = await api.get(`/streets/${selectedStreet.split('/')[1]}/forecast`);
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
  }, [selectedFeature]);

  const RenderedForecastBars = useMemo(() => {
    return (
      <View style={styles.forecastRow}>
        {predictionData?.days?.map((day, index) => (
          <ForecastBar
            key={index}
            day={day}
            highlighted=
            {
              (openRoute && selectedRoute.find(f => f.id === selectedFeature?.id)) ? Array.isArray(openRoute?.active_days) && openRoute.active_days.includes(day.day_name)
              : routeSetup ? Array.isArray(routeSetup?.active_days) && routeSetup.active_days.includes(day.day_name)
              : false
            }
            onPress={() => setDailyForecastData(day)}
          />
        ))}
      </View>
    );
  }, [predictionData]);

  useEffect(() =>
  {
    const setup = route.params?.routeSetup;
    if (setup)
    {
      setRouteSetup(setup);
      setIsPlanningRoute(true);
      setIsSelectingPoints(true);
      setStartPoint(null);
      setEndPoint(null);
      setSelectedRoute([]);
      setIsVieweingRoute(false);
      navigation.setParams({ routeSetup: undefined });
    }
  }, [route.params?.routeSetup]);

  useEffect(() =>
  {
    const openedRoute = route.params?.openRoute;

    if(openedRoute)
    {
      setOpenRoute(openedRoute);
      setSelectedRoute(openedRoute.geometry.features);
      setStartPoint(openedRoute.start_point);
      setEndPoint(openedRoute.end_point);
      setIsVieweingRoute(true);
      fitCameraToBounds(start_point, end_point);
    }
  }, [route.params?.openRoute]);

  useEffect(() => {
    if (start_point && end_point) {
      fitCameraToBounds(start_point, end_point);
    }
  }, [start_point, end_point]);  

  const LegendItem = ({ color, label }) => (
    <View style={styles.legendItem}>
      <View style={[styles.legendColor, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );

  const fitCameraToBounds = (pointA, pointB) => {
    if (cameraRef.current && pointA && pointB) {
      const bounds = [pointA, pointB];
      cameraRef.current.fitBounds(
        [Math.min(pointA[0], pointB[0]), Math.min(pointA[1], pointB[1])],
        [Math.max(pointA[0], pointB[0]), Math.max(pointA[1], pointB[1])],
        100,
        1000
      );
    }
  };  

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
      const bufferDistanceKM = 20;
      const keepCities = citiesWithDistance.slice(0, 3).filter(city => city.distance < bufferDistanceKM);
      const keepIds = keepCities.map(c => c.id);

      for (const city of keepCities) {
        if (!loadedGeojsons[city.id]) {
          const geojson = await GeojsonService.readGeojson(city.id);
          setLoadedGeojsons(prev => ({ ...prev, [city.id]: geojson }));
        }
      }
      setActiveRegions(keepIds);
      const zoom = region.properties.zoom;
      setMapLineWidth(Math.max(1, zoom - 10));
    }
    catch(error)
    {
      console.error(error);
    }
  }

  const focusLocation = async () =>
  {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status)
    {
      const userLocation = await MapboxGL.locationManager.getLastKnownLocation();
      if (userLocation && cameraRef.current)
      {
        const newCoords = [userLocation.coords.longitude, userLocation.coords.latitude];
        cameraRef.current.setCamera({
          centerCoordinate: newCoords,
          zoomLevel: 16,
          animationDuration: 1000
        });
        setShowLocation(!showLocation);
      }
    }
  }

  const handleSelectStreet = async (e) => 
  {
    const netInfo = await useNetworkStatus();
    if (!netInfo)
    {
      console.error('no internet!');
      toast.show('No internet connection!',
        {
          type: 'error',
          duration: 3000,
          placement: 'bottom',
        }
      );
      return;
    }
    else
    {
      const feature = e.features[0];
      setSelectedFeature(feature);
    }
  }

  function getOriginalFeatureById(id) {
    for (const cityId of activeRegions) {
      const geojson = loadedGeojsons[cityId];
      if (!geojson) continue;
  
      const match = geojson.features.find(f => f.properties.id === id);
      if (match) {
        return JSON.parse(JSON.stringify(match));
      }
    }
    return null;
  }
  


  function getLineCoords(line) {
    return turf.getCoords(line);
  }


  function touchesPoint(line, point, tolerance = 0.0001) {
    const coords = getLineCoords(line);
    return coords.some(coord =>
      turf.distance(turf.point(coord), point) < tolerance
    );
  }


  function touchesAnotherLine(lineA, lineB, tolerance = 0.0001) {
    const coordsA = getLineCoords(lineA);
    const coordsB = getLineCoords(lineB);
  
    return coordsA.some(coordA =>
      coordsB.some(coordB =>
        turf.distance(turf.point(coordA), turf.point(coordB)) < tolerance
      )
    );
  }
  

  function smartSliceEdgeSegment(segment, pointCoord, neighborSegment, isStart) {
    const point = turf.point(pointCoord);
    const snapped = turf.nearestPointOnLine(segment, point);

    const snapDistance = turf.distance(snapped, point);
  
    const split = turf.lineSplit(segment, snapped);
    if (!split || split.features.length < 2) {
      return segment;
    }
  
    const [partA, partB] = split.features;
  
    const startTouchesA = touchesPoint(partA, snapped);
    const otherTouchesA = touchesAnotherLine(partA, neighborSegment);
  
    const startTouchesB = touchesPoint(partB, snapped);
    const otherTouchesB = touchesAnotherLine(partB, neighborSegment);

  
    if (startTouchesA && otherTouchesA) return partA;
    if (startTouchesB && otherTouchesB) return partB;

    if (otherTouchesA) return partA;
    if (otherTouchesB) return partB;

    return turf.length(partA) > turf.length(partB) ? partA : partB;
  }  


  function finalizeRoute(selectedRoute, start_point, end_point) {
    if (selectedRoute.length < 2 || !start_point || !end_point) return selectedRoute;

    const firstSegment = selectedRoute[0];
    const nextSegment = selectedRoute[1];
    const lastSegment = selectedRoute[selectedRoute.length - 1];
    const prevSegment = selectedRoute[selectedRoute.length - 2];

    const slicedStart = smartSliceEdgeSegment(firstSegment, start_point, nextSegment, true);
    const slicedEnd = smartSliceEdgeSegment(lastSegment, end_point, prevSegment, false);

    return [
      { ...firstSegment, geometry: slicedStart.geometry },
      ...selectedRoute.slice(1, -1),
      { ...lastSegment, geometry: slicedEnd.geometry }
    ];
  }

  const calculateRouteDistance = (features) => {
    const line = turf.featureCollection(features);
    return turf.length(line, { units: 'kilometers' });
  };

  const handleResetPlanning = () => {
    setStartPoint(null);
    setEndPoint(null);
    setSelectedRoute([]);
    setIsSelectingPoints(true);
    setIsRouteFinalized(false);
  };
  
  const handleCancelPlanning = () => {
    setStartPoint(null);
    setEndPoint(null);
    setSelectedRoute([]);
    setIsSelectingPoints(false);
    setIsRouteFinalized(false);
    setRouteSetup(null);
    setIsPlanningRoute(false);
  };
  
  const handleFinalizeRoute = () => {
    const updated = finalizeRoute(selectedRoute, start_point, end_point);
    setSelectedRoute(updated);
    setIsRouteFinalized(true);
    fitCameraToBounds(start_point, end_point);
  };
  
  const handleSaveRoute = async () =>
  {
    if (!routeSetup || selectedRoute.length === 0) return;

    const totalDistance = calculateRouteDistance(selectedRoute);

    const newRoute = {
      id: uuid.v4(),
      name: routeSetup.name,
      time: routeSetup.time,
      active_days: routeSetup.active_days,
      distance: totalDistance,
      geometry: {
        type: 'FeatureCollection',
        features: selectedRoute,
      },
      start_point,
      end_point,
    };

    if (user)
    {
      try
      {
        await uploadRoute(newRoute);
      }
      catch (error)
      {
        toast.show('Failed to sync route to cloud', { type: 'error' });
        console.error(error);
      }
    }

    await saveRoute(newRoute);

    setSelectedRoute([]);
    setStartPoint(null);
    setEndPoint(null);
    setIsSelectingPoints(false);
    setIsRouteFinalized(false);
    setRouteSetup(null);
    setIsPlanningRoute(false);
    navigation.navigate('RoutesList');
    toast.show('Route saved successfully!');
  };
  

  if(loading)
    return null;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={'black'}/>
      <MapboxGL.MapView
        style={styles.map}
        rotateEnabled={false}
        onMapIdle={(region) => handleRegionChange(region)}
        onPress={(e) =>
        {
          if(isPlanningRoute)
          {
            const coord = e.geometry.coordinates;
            if (!start_point) setStartPoint(coord);
            else if(!end_point)
            {
              setEndPoint(coord);
              setIsSelectingPoints(false);
            }
          }
        }}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: location
              ? [location[1], location[0]]
              : [35.2354491908048, 31.778236604927155],
            zoomLevel: 16,
          }}
        />

        {showLocation && (
          <MapboxGL.PointAnnotation id="location" coordinate={[location[1], location[0]]}>
            <View style={styles.markerLocation} />
          </MapboxGL.PointAnnotation>
        )}

        {start_point && (
          <MapboxGL.PointAnnotation id="start" coordinate={start_point}>
            <View style={styles.markerStart} />
          </MapboxGL.PointAnnotation>
        )}
        {end_point && (
          <MapboxGL.PointAnnotation id="end" coordinate={end_point}>
            <View style={styles.markerEnd} />
          </MapboxGL.PointAnnotation>
        )}


        {!loading && !isSelectingPoints &&
        activeRegions.map(cityId => (
          <MapboxGL.ShapeSource
            key={`source-${cityId}`}
            id={`source-${cityId}`}
            shape={loadedGeojsons[cityId]}
            onPress={handleSelectStreet}
          >
            <MapboxGL.LineLayer
              id={`layer-${cityId}`}
              style={{ lineColor: 'blue', lineWidth: mapLineWidth, lineJoin: 'round',
                lineCap: 'round',
                 }}
              belowLayerID="road-label"
            />
          </MapboxGL.ShapeSource>
        ))}

        {!isSelectingPoints &&
        <MapboxGL.ShapeSource id="selectedRoute" shape={selectedRouteGeojson}>
          <MapboxGL.LineLayer
            id="selectedRouteLine"
            style={{ lineColor: 'green', lineWidth: mapLineWidth, lineJoin: 'round',
              lineCap: 'round',
               }}
            belowLayerID="road-label"
          />
        </MapboxGL.ShapeSource>}

      </MapboxGL.MapView>

      {/*isPlanningRoute && (
        <View style={styles.planningBanner}>
          <Text style={styles.planningText}>Planning route "{routeSetup.name}"</Text>
        </View>
      )*/}

      {isVieweingRoute && (
        <View style={styles.metadataPanel}>
          <Text style={styles.routeTitle}>{openRoute.name}</Text>
          <Text style={styles.routeMeta}>Start Time: {openRoute.time}</Text>
          <Text style={styles.routeMeta}>Distance: {openRoute.distance?.toFixed(1)} km</Text>
          {openRoute.active_days && openRoute.active_days.length > 0 && <Text style={styles.routeMeta}>
            Days: {openRoute.active_days?.join(', ') || '—'}
          </Text>}
        </View>
      )}

      {isVieweingRoute &&
      <View style={styles.floatingPanel}>
        <TouchableOpacity
          style={styles.panelButton}
          onPress={()=>
            {
              setOpenRoute(null);
              setSelectedRoute([]);
              setStartPoint(null);
              setEndPoint(null);
              setIsVieweingRoute(false);
            }
          }>
          <Text style={styles.buttonText}>Hide route</Text>
        </TouchableOpacity>
      </View>}

      {isPlanningRoute && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            {(!start_point && !end_point) ? 'Tap on map to mark starting point'
            : (start_point && !end_point) ? 'Tap to mark destination'
            : 'Tap streets to view traffic forecast and add to your route!'}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.locationButton}
        onPress={focusLocation}
      >
        <IconGroups.FontAwesome6 name="location-crosshairs" size={24} color="blue" />
      </TouchableOpacity>

      {(isPlanningRoute || isVieweingRoute) &&
        <TouchableOpacity
          style={styles.zoomOutButton}
          onPress={() =>
          {
            fitCameraToBounds(start_point, end_point);
          }}
        >
          <IconGroups.SimpleLineIcons name="size-fullscreen" size={25} color="blue" />
        </TouchableOpacity>
      }

      {!isPlanningRoute && !isVieweingRoute &&
        <TouchableOpacity
          style={styles.routeButton}
          onPress={() =>
          {
            navigation.navigate('RouteSetup');
          }}
        >
          <IconGroups.FontAwesome6 name="route" size={24} color="blue"/>
        </TouchableOpacity>
      }

      <TouchableOpacity
        style={styles.hamburgerButton}
        onPress={() => navigation.openDrawer()}
      >
        <IconGroups.Feather name="menu" size={24} color="blue" />
      </TouchableOpacity>

      <Modal
        isVisible={!!selectedFeature}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        hideModalContentWhileAnimating={true}
        useNativeDriver={false}
        onBackdropPress={() => {setSelectedFeature(null); setPredictionData(null)}}
        onSwipeComplete={() => {setSelectedFeature(null); setPredictionData(null)}}
        onRequestClose={() => {setSelectedFeature(null); setPredictionData(null)}}
        swipeDirection="down"
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <View style={{flexDirection: 'row', alignContent: 'center'}}>
            <Text style={styles.modalTitle}>Traffic Forecast</Text>
            {predictionLoading && <ActivityIndicator size="small" color="blue"/>}
          </View>
          {selectedFeature?.properties.name && <Text>Street: {selectedFeature?.properties.name}</Text>}

          {predictionLoading ? (
            <SkeletonForecastLoader />
          ) : predictionError ? (
            <Text style={styles.errorText}>Failed to load prediction</Text>
          ) : (
            <View>
              <View style={styles.forecastRow}>
                {RenderedForecastBars}
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

          {isPlanningRoute && !isRouteFinalized && !predictionLoading &&
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <TouchableOpacity
              onPress={() =>
              {
                const originalFeature = getOriginalFeatureById(selectedFeature.properties.id);
                const alreadySelected = selectedRoute.some(f => f.id === originalFeature.id);
                if (alreadySelected)
                {
                  const filteredRoute = selectedRoute.filter((f) => f.id !== originalFeature.id);
                  setSelectedRoute(filteredRoute);
                }
                else
                {
                  setSelectedRoute(prev => [...prev, originalFeature]);
                }
                setSelectedFeature(null);
                setPredictionData(null);
              }}
              style={[styles.button, { backgroundColor: 'green', flex: 2, margin: 5 }]}
            >
              {!selectedRoute.some(f => f.id === selectedFeature?.id)
              ? <Text style={styles.buttonText}>Add to Route</Text>
              : <Text style={styles.buttonText}>Remove from Route</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {setSelectedFeature(null); setPredictionData(null)}}
              style={[styles.button, { backgroundColor: 'gray', flex: 2, margin: 5 }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>}
        </View>
        
      </Modal>
      {dailyForecastData && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={() => setDailyForecastData(null)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <View style={{ flex: 1, backgroundColor: 'white', justifyContent: 'flex-start', margin: 0 }}>
            <DailyForecastScreen day={dailyForecastData} />
          </View>
      </Modal>
      )}

      {isPlanningRoute && (
        <View style={styles.floatingPanel}>
          {!start_point && !end_point && (
            <TouchableOpacity style={styles.panelButton} onPress={handleCancelPlanning}>
              <Text style={styles.panelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}

          {start_point && (!end_point || end_point) && selectedRoute.length === 0 && (
            <>
              <TouchableOpacity style={styles.panelButton} onPress={handleResetPlanning}>
                <Text style={styles.panelButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.panelButton} onPress={handleCancelPlanning}>
                <Text style={styles.panelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {start_point && end_point && !isRouteFinalized && selectedRoute.length > 0 && (
            <>
            <View style={{flex: 1,}}>
              <View style={styles.panelRow}>
                <TouchableOpacity style={styles.panelButton} onPress={handleResetPlanning}>
                  <Text style={styles.panelButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.panelButton} onPress={handleFinalizeRoute}>
                  <Text style={styles.panelButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.panelButton} onPress={handleCancelPlanning}>
                <Text style={styles.panelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            </>
          )}

          {isRouteFinalized && selectedRoute.length > 0 && (
            <>
            <View style={{flex: 1,}}>
              <View style={styles.panelRow}>
                <TouchableOpacity style={styles.panelButton} onPress={handleResetPlanning}>
                  <Text style={styles.panelButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.panelButton} onPress={handleSaveRoute}>
                  {/*<IconGroups.FontAwesome6 name="save" size={24} color="white" marginRight='5'/>*/}
                  <Text style={styles.panelButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.panelButton} onPress={handleCancelPlanning}>
                <Text style={styles.panelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            </>
          )}
        </View>
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
  modalHandle: {
    width: 100,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 10,
  },  
  modalTitle: {
    fontSize: 20,
    margin: 5,
    fontWeight: 'bold',
    textAlignVertical: 'center'
  },
  button: {
    backgroundColor: 'blue',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16
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
  routeButton: {
    position: 'absolute',
    top: 95,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'blue',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  routeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationButton: {
    position: 'absolute',
    top: 30,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    borderColor: 'blue',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  zoomOutButton: {
    position: 'absolute',
    top: 30,
    right: 90,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'blue',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  hamburgerButton: {
    position: 'absolute',
    top: 30,
    left: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 30,
    borderColor: 'blue',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },  
  planningBanner: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    zIndex: 999,
  },
  planningText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
  hintContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
  },  
  markerLocation: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#90D5FF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerStart: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'green',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerEnd: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: '#fff',
  },
  floatingPanel: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    borderColor: 'blue',
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  panelRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    //marginBottom: 5,
  },  
  panelButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'blue',
    borderRadius: 10,
  },
  panelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  metadataPanel: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    padding: 12,
    backgroundColor: '#ffffffcc',
    borderRadius: 8,
    elevation: 5,
  },
  routeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  routeMeta: {
    fontSize: 14,
    color: '#444',
  },  
});