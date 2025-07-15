import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { getCurrentLocation } from '../../services/regionService.js';

export default function LocationPermissionScreen({ navigation, finishOnboarding })
{
    const [requesting, setRequesting] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(true);
    const [requested, setRequested] = useState(false);
    const [location, setLocation] = useState([]);

    return (
        <View style={styles.container}>
        <Text style={styles.title}>We need permission to use your location</Text>
        {requested &&
        (permissionGranted ? (<Text style={styles.subtitle}>Permission granted!</Text>)
        : (<Text style={styles.subtitle}>Location permissions denied! App will use a default location</Text>))}
        { requesting ? (<ActivityIndicator size="large"/>)
        : (<Button title="Next" onPress={async () =>
            {
                if(!requested)
                {
                    setRequesting(true);
                    const { location, permissionGranted } = await getCurrentLocation();
                    setPermissionGranted(permissionGranted);
                    if(permissionGranted)
                        setLocation([location.latitude, location.longitude]);
                    else
                        setLocation(location);
                    setRequesting(false);
                    setRequested(true);
                }
                else
                {
                    navigation.navigate('Final', {location: location});
                }
            }} />)
        }
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