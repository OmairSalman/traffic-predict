import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;
const segmentCount = 6;
const segmentMargin = 14;
const totalMargin = segmentMargin * (segmentCount - 1);
const segmentWidth = (screenWidth * 0.9 - totalMargin) / segmentCount;

const SkeletonForecastLoader = () => {
    return (
    <View style={styles.container}>
        {Array.from({ length: 7 }).map((_, dayIndex) => (
        <View key={`day-${dayIndex}`} style={styles.barContainer}>
            <View style={styles.dayLabelPlaceholder} />
            <View style={styles.segmentRow}>
            {Array.from({ length: 6 }).map((_, segIndex) => (
                <View key={`day-${dayIndex}-seg-${segIndex}`} style={styles.segmentPlaceholder} />
            ))}
            <Icon name="chevron-forward" size={20} color="#444" />
            </View>
        </View>
        ))}

        <View style={styles.legendTitle} />
        <View style={styles.legendRow}>
        {Array.from({ length: 4 }).map((_, legendIndex) => (
            <View key={`legend-${legendIndex}`} style={styles.legendItem}>
            <View style={styles.legendColor} />
            <View style={styles.legendLabel} />
            </View>
        ))}
        </View>
    </View>
    );
};

const styles = StyleSheet.create({
  container:
  {
    width: '100%',
    paddingHorizontal: '5%',
    padding: 5,
    marginBottom: 10,
  },
  barContainer: { marginBottom: 24 },
  dayLabelPlaceholder: {
    width: 80,
    height: 14,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  segmentPlaceholder: {
    width: segmentWidth,
    height: 35,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  legendTitle: {
    width: 140,
    height: 14,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 2,
    backgroundColor: '#ccc',
    marginRight: 5,
  },
  legendLabel: {
    width: 40,
    height: 12,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
});

export default SkeletonForecastLoader;