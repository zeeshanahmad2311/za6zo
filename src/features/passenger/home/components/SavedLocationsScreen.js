import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const locations = [
  { id: '1', name: 'Home', address: '123 Main St, New York' },
  { id: '2', name: 'Work', address: '456 Business Ave, Brooklyn' },
  { id: '3', name: 'Gym', address: '789 Fitness St, Queens' },
];

export default function SavedLocationsScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Saved Locations</Text>
        <View className="w-6" />
      </View>

      {/* Locations List */}
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="py-4 border-b border-gray-100"
            onPress={() => navigation.navigate('BookRide', { location: item })}
          >
            <Text className="text-lg font-semibold">{item.name}</Text>
            <Text className="text-gray-600">{item.address}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Add New Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-indigo-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('LocationSearch', { saveMode: true })}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}