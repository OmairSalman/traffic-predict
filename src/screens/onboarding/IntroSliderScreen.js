import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const { width } = Dimensions.get('window');

export default function IntroSliderScreen({ navigation, route }) {
  const { location } = route.params;

  const slides = [
    {
      key: '1',
      title: 'Traffic Forecasts',
      text: 'Get up-to-date forecasts for street traffic in your area for the entire upcoming week.',
      image: require('../../../assets/images/forecast.jpg')
    },
    {
      key: '2',
      title: 'Plan Your Route',
      text: 'Choose your start and end points and build a route using streets based on forecast data.',
      image: require('../../../assets/images/plan.jpg')
    },
    {
      key: '3',
      title: 'Save & Review',
      text: 'Save your planned routes and revisit them anytime with a forecast-specific traffic preview.',
      image: require('../../../assets/images/save.jpg')
    },
  ];

  const handleDone = () => {
    navigation.navigate('CallToAction', { location: location });
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  const renderSkipButton = () => (
    <TouchableOpacity style={styles.button} onPress={handleDone}>
      <Text style={styles.buttonText}>Skip</Text>
    </TouchableOpacity>
  );

  const renderDoneButton = () => (
    <TouchableOpacity style={styles.button} onPress={handleDone}>
      <Text style={styles.buttonText}>Continue</Text>
    </TouchableOpacity>
  );

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={handleDone}
      showSkipButton
      renderSkipButton={renderSkipButton}
      renderDoneButton={renderDoneButton}
      activeDotStyle={{ backgroundColor: 'blue' }}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: width * 0.8,
    height: 400,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1d',
    textAlign: 'center',
    marginBottom: 15,
  },
  text: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
  },
});