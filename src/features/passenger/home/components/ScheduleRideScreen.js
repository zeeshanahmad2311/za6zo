import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

export default function ScheduleRideScreen() {
  const navigation = useNavigation();
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState('date');

  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  return (
    <View className="flex-1 bg-white p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Schedule Ride</Text>
        <View className="w-6" />
      </View>

      {/* Date/Time Selection */}
      <View className="space-y-4 mb-8">
        <TouchableOpacity 
          className="border border-gray-200 rounded-xl p-4"
          onPress={() => showMode('date')}
        >
          <Text className="text-gray-500 text-sm mb-1">Pickup Date</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">
              {date.toLocaleDateString()}
            </Text>
            <MaterialIcons name="calendar-today" size={20} color="#4f46e5" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          className="border border-gray-200 rounded-xl p-4"
          onPress={() => showMode('time')}
        >
          <Text className="text-gray-500 text-sm mb-1">Pickup Time</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            <MaterialIcons name="access-time" size={20} color="#4f46e5" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        className="bg-indigo-600 py-4 rounded-xl items-center justify-center"
        onPress={() => navigation.navigate('BookRide', { scheduledTime: date })}
      >
        <Text className="text-white font-bold text-lg">Confirm Schedule</Text>
      </TouchableOpacity>

      {/* DateTime Picker */}
      {showPicker && (
        <DateTimePicker
          value={date}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChange}
          minimumDate={new Date()}
        />
      )}
    </View>
  );
}