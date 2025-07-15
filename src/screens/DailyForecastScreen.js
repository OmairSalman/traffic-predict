import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

function getColor(prediction) {
  switch (prediction) {
    case "Low": return "#4CAF50";
    case "Normal": return "#FFC107";
    case "High": return "#FF9800";
    case "Heavy": return "#F44336";
    default: return "#9E9E9E";
  }
}

function DailyForecastScreen({ day }) {
  const renderItem = ({ item, index }) => {
    const color = getColor(item);

    return (
      <View style={styles.row}>
        {(index === 0) ? <Text style={styles.timeLabel}>{`12:00 AM`}</Text>
        : (index < 12) ? <Text style={styles.timeLabel}>{`${index}:00 AM`}</Text>
        : (index > 12) ? <Text style={styles.timeLabel}>{`${index - 12}:00 PM`}</Text>
        : <Text style={styles.timeLabel}>{`${index}:00 PM`}</Text>}
        <View style={[styles.predictionBar, { backgroundColor: color }]}>
          <Text style={styles.predictionText}>{item}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Full day traffic forecast for {'\n'} {day.day_name} – {day.date}</Text>
      <FlatList
        data={day.predictions}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    width: 75,
    fontSize: 16,
    color: '#444',
  },
  predictionBar: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  predictionText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DailyForecastScreen;