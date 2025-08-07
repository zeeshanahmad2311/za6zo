// src/features/passenger/home/components/SavedLocationsScreen.js
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { usePlaces } from "../../../../contexts/PlacesContext";

const SavedLocationsScreen = () => {
  const navigation = useNavigation();
  const { savedPlaces, deletePlace } = usePlaces();

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Place",
      "Are you sure you want to delete this saved location?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: () => deletePlace(id), style: "destructive" }
      ]
    );
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity 
      className="bg-white p-4 border border-gray-100 rounded-xl mb-3"
      onPress={() => navigation.navigate("LocationSearch", { preSelected: item })}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <MaterialIcons 
              name={
                item.type === 'home' ? 'home' :
                item.type === 'work' ? 'work' :
                item.type === 'favorite' ? 'favorite' : 'place'
              } 
              size={20} 
              color={
                item.type === 'home' ? '#3b82f6' :
                item.type === 'work' ? '#10b981' :
                item.type === 'favorite' ? '#ec4899' : '#6b7280'
              } 
            />
            <Text className="text-lg font-semibold ml-2 text-gray-900">{item.name}</Text>
          </View>
          <Text className="text-gray-500 text-sm">{item.address}</Text>
          {item.createdAt && (
            <Text className="text-gray-400 text-xs mt-2">
              Saved on {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">Saved Places</Text>
        <Text className="text-gray-500 mt-1">
          {savedPlaces.length} {savedPlaces.length === 1 ? 'place' : 'places'} saved
        </Text>
      </View>

      {savedPlaces.length > 0 ? (
        <FlatList
          data={savedPlaces}
          renderItem={renderPlaceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <MaterialIcons name="bookmark-border" size={48} color="#d1d5db" />
          <Text className="text-gray-500 mt-4 text-center">
            You haven't saved any places yet.{"\n"}
            Save your frequent locations for quick access.
          </Text>
        </View>
      )}
    </View>
  );
};

export default SavedLocationsScreen;