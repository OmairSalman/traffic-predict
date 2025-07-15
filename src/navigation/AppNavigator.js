import * as IconGroups from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../components/UserContext';
import LoginScreen from '../screens/account/LoginScreen.js';
import MapScreen from '../screens/MapScreen.js';
import ProfileScreen from '../screens/account/ProfileScreen.js';
import RegisterScreen from '../screens/account/RegisterScreen.js';
import RouteListScreen from '../screens/RouteListScreen.js';
import RouteSetupScreen from '../screens/RouteSetupScreen.js';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const { user } = useUser();

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingBottom: 0 }}>
        {/* App header */}
        <View style={styles.drawerHeader}>
          <Image source={require('../../assets/images/traffico-icon.png')} style={styles.drawerIcon} />
          <Text style={styles.drawerTitle}>Traffico</Text>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Bottom area — Sign In or Profile */}
      <View style={styles.bottomSection}>
        {user ? (
          <DrawerItem
            label="Profile"
            onPress={() => props.navigation.navigate('ProfileScreen')}
            icon={({ color, size }) => (
              <IconGroups.MaterialIcons name="person" size={size} color={color} />
            )}
          />
        ) : (
          <DrawerItem
            label="Sign In"
            onPress={() => props.navigation.navigate('LoginScreen')}
            icon={({ color, size }) => (
              <IconGroups.MaterialIcons name="login" size={size} color={color} />
            )}
          />
        )}
      </View>
    </View>
  );
}

export default function AppNavigator({ screenProps }) {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="MapScreen"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
        }}
      >
        <Drawer.Screen
          name="MapScreen"
          component={MapScreen}
          initialParams={{
            cityID: screenProps.cityID,
            tempLocation: screenProps.location,
            routeSetup: null,
          }}
          options={{
            title: 'Map View',
            drawerIcon: ({ focused, size }) => (
              <IconGroups.FontAwesome5 name="map-marked-alt" size={size} color={focused ? 'blue' : 'gray'} />
            ),
          }}
        />
        <Drawer.Screen
          name="RouteSetup"
          component={RouteSetupScreen}
          options={{
            headerShown: true,
            title: 'Add New Route',
            drawerIcon: ({ focused, size }) => (
              <IconGroups.FontAwesome6 name="add" size={size} color={focused ? 'blue' : 'gray'} />
            ),
          }}
        />
        <Drawer.Screen
          name="RoutesList"
          component={RouteListScreen}
          options={{
            headerShown: true,
            title: 'Saved Routes',
            drawerIcon: ({ focused, size }) => (
              <IconGroups.FontAwesome6 name="route" size={size} color={focused ? 'blue' : 'gray'} />
            ),
          }}
        />
        <Drawer.Screen name="LoginScreen" component={LoginScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="RegisterScreen" component={RegisterScreen} options={{ drawerItemStyle: { display: 'none' } }} />
        <Drawer.Screen name="ProfileScreen" component={ProfileScreen} options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  drawerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  bottomSection: {
    borderTopWidth: 1 ,
    borderTopColor: '#ccc',
    paddingVertical: 10,
    padding: 16,
  },
});