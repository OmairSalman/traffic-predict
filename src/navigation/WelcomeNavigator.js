import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen.js';
import LocationPermissionScreen from '../screens/onboarding/LocationPermissionScreen.js';
import FinalOnboardingScreen from '../screens/onboarding/FinalOnboardingScreen.js';
import IntroSliderScreen from '../screens/onboarding/IntroSliderScreen.js';
import CallToActionScreen from '../screens/onboarding/CallToActionScreen';
import RegisterScreen from '../screens/account/RegisterScreen.js';
import LoginScreen from '../screens/account/LoginScreen.js';

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
        <Stack.Screen name="IntroSlider" component={IntroSliderScreen} />
        <Stack.Screen name="CallToAction" component={CallToActionScreen} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}