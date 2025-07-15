import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;
const segmentCount = 6;
const segmentMargin = 14;
const totalMargin = segmentMargin * (segmentCount - 1);
const segmentWidth = (screenWidth * 0.9 - totalMargin) / segmentCount;

function getColor(prediction) {
  switch (prediction) {
    case "Low": return "#4CAF50";
    case "Normal": return "#FFC107";
    case "High": return "#FF9800";
    case "Heavy": return "#F44336";
    default: return "#9E9E9E";
  }
}

const ForecastBar = ({ day, onPress, highlighted }) => {
  const navigation = useNavigation();
  const segments = [6, 9, 12, 15, 18, 21];

  return (
    <TouchableOpacity
      style={[
        styles.barContainer,
        highlighted && { borderWidth: 2, borderColor: 'blue', borderRadius: 8 },
      ]}
      onPress={onPress}
    >
      <Text style={styles.dayLabel}>
        {day.day_name === 'Tomorrow' ? 'Tomorrow' : day.day_name}
      </Text>
      <View style={styles.segmentRow}>
        {segments.map(hour => (
          <View
            key={hour}
            style={[
              styles.segment,
              { backgroundColor: getColor(day.predictions[hour]) }
            ]}
          >
            <Text style={styles.segmentText}>
              {hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </Text>
          </View>
        ))}
        <Icon name="chevron-forward" size={20} color="#444" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    width: '100%',
    paddingHorizontal: '5%',
    padding: 5,
    marginBottom: 10,
  },
  dayLabel: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  segment: {
    width: segmentWidth,
    height: 35,
    borderRadius: 4,
    justifyContent: 'center'
  },
  segmentText:
  {
    textAlign: 'center',
    color: 'white'
  },
});

export default ForecastBar;