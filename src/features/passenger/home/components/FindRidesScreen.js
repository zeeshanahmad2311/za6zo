import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

export default function FindRidesScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);

  const findRides = () => {
    setLoading(true);
    setTimeout(() => {
      setRides([
        {
          id: '1',
          driver: 'John D.',
          car: 'Toyota Camry 2020',
          rating: '4.9',
          eta: '5 min',
          price: '$15.50'
        },
        {
          id: '2',
          driver: 'Sarah M.',
          car: 'Honda Accord 2021',
          rating: '4.8',
          eta: '7 min',
          price: '$14.75'
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Available Rides</Text>
        <View className="w-6" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-4 text-gray-600">Finding available rides...</Text>
        </View>
      ) : rides.length > 0 ? (
        <View className="space-y-4">
          {rides.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              className="border border-gray-200 rounded-xl p-4"
              onPress={() => navigation.navigate('BookRide', { selectedRide: ride })}
            >
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-lg font-bold">{ride.driver}</Text>
                  <Text className="text-gray-600">{ride.car}</Text>
                  <View className="flex-row items-center mt-1">
                    <MaterialIcons name="star" size={16} color="#fbbf24" />
                    <Text className="text-gray-700 ml-1">{ride.rating}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold">{ride.price}</Text>
                  <Text className="text-gray-600">ETA: {ride.eta}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View className="flex-1 justify-center">
          <Text className="text-center text-gray-500 mb-6">
            Search for available rides based on your locations
          </Text>
          <TouchableOpacity
            className="bg-indigo-600 py-4 rounded-xl items-center"
            onPress={findRides}
          >
            <Text className="text-white font-bold text-lg">Find Rides Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}