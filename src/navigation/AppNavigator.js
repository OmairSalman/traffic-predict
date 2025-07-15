import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import MapScreen from '../screens/MapScreen.js';

const Stack = createStackNavigator();

export default function AppNavigator({ screenProps }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MapScreen" screenOptions={{headerShown: false}}>
        <Stack.Screen name="MapScreen">
        {(props) => (<MapScreen {...props} cityID={screenProps.cityID} tempLocation={screenProps.location}/>)}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}