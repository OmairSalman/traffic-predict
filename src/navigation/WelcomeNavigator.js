import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen.js';
import LocationPermissionScreen from '../screens/onboarding/LocationPermissionScreen.js';
import FinalOnboardingScreen from '../screens/onboarding/FinalOnboardingScreen.js';

const Stack = createStackNavigator();

export default function WelcomeNavigator({ screenProps }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LocPerm" component={LocationPermissionScreen}/>
        <Stack.Screen name="Final">
        {(props) => (<FinalOnboardingScreen {...props} finishOnboarding={screenProps.finishOnboarding}/>)}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}