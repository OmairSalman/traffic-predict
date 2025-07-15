import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RouteSetupScreen({ route, navigation })
{
    const [routeName, setRouteName] = useState('');
    const [startTime, setStartTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [active_days, setActiveDays] = useState([]);

    const baseDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    function getDaysStartingFromTomorrow() {
      const todayIndex = new Date().getDay();
      const tomorrowIndex = (todayIndex + 1) % 7;

      return [...baseDays.slice(tomorrowIndex), ...baseDays.slice(0, tomorrowIndex)];
    }

    const daysOfWeek = getDaysStartingFromTomorrow();

    const toggleDay = (day) => {
      setActiveDays(prev =>
        prev.includes(day)
          ? prev.filter(d => d !== day)
          : [...prev, day]
      );
    };

    const handleContinue = () =>
    {
      if (!routeName.trim()) return alert('Please enter a route name');

      navigation.navigate('MapScreen', {
        routeSetup: {
          name: routeName.trim(),
          time: startTime.toTimeString().slice(0, 5),
          active_days,
        },
      });

      setRouteName('');
      setStartTime(new Date());
      setActiveDays([]);
    };

    const handleCancel = () =>
    {
      navigation.goBack();
      setRouteName('');
      setStartTime(new Date());
      setActiveDays([]);
    }

    return (
        <View style={styles.container}>
        <Text style={styles.label}>Route Name</Text>
        <TextInput
            style={styles.input}
            value={routeName}
            onChangeText={setRouteName}
            placeholder="e.g. Commute to Office"
        />

        <Text style={styles.label}>Start Time</Text>
        <Text style={styles.timeText} onPress={() => setShowTimePicker(true)}>
            {startTime.toTimeString().slice(0, 5)}
        </Text>

        {showTimePicker && (
            <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) setStartTime(selectedDate);
            }}
            />
        )}

        <Text style={styles.label}>Active Days</Text>
        <View style={styles.daySelectionRow}>
          {daysOfWeek.map(day => (
            <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              active_days.includes(day) && styles.dayButtonSelected
            ]}
            onPress={() => toggleDay(day)}
          >
            <Text
              style={[
                styles.dayButtonText,
                active_days.includes(day) && styles.dayButtonTextSelected
              ]}
            >
              {day}
            </Text>
          </TouchableOpacity>          
          ))}
        </View>


        <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>Countinue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  timeText: {
    fontSize: 18,
    color: 'blue',
    paddingVertical: 12,
  },
  button: {
    alignContent: 'center',
    margin: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'blue',
    borderRadius: 10,
    marginTop: 16,
  },
  buttonText:
  {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  daySelectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  dayButtonSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dayButtonText: {
    color: '#000', // default black
  },
  dayButtonTextSelected: {
    color: '#fff', // selected white
  },  
});