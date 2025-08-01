import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const PremiumBookingCard = React.memo(({ 
  currentLocation,
  onPickupPress,
  onDestinationPress,
  onSchedulePress,
  onSavedPress,
  onFindRidesPress
}) => {
  const navigation = useNavigation();

  // Navigation handlers with fallbacks
  const handlePickupPress = () => 
    onPickupPress?.() || navigation.navigate('LocationSearch', { type: 'pickup' });

  const handleDestinationPress = () => 
    onDestinationPress?.() || navigation.navigate('LocationSearch', { type: 'destination' });

  const handleSchedulePress = () => 
    onSchedulePress?.() || navigation.navigate('ScheduleRide');

  const handleSavedPress = () => 
    onSavedPress?.() || navigation.navigate('SavedLocations');

  const handleFindRidesPress = () => 
    onFindRidesPress?.() || navigation.navigate('FindRides');

  return (
    <View className="mx-6 mb-8">
      <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
        <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
          
          {/* Header Section */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-gray-900 text-2xl font-bold">Book Your Ride</Text>
              <Text className="text-gray-600 text-sm mt-1">Quick and reliable transportation</Text>
            </View>
            <View className="w-12 h-12 bg-indigo-100 items-center justify-center border border-indigo-200 rounded-xl">
              <FontAwesome5 name="car" size={20} color="#4f46e5" />
            </View>
          </View>

          {/* Location Inputs */}
          <View style={{ gap: 16 }}>
            <LocationInput
              icon={<MaterialIcons name="my-location" size={20} color="#059669" />}
              title="PICKUP LOCATION"
              value={currentLocation ? "Current Location" : "Select pickup location"}
              subtitle="Tap to change location"
              onPress={handlePickupPress}
              bgColor="bg-green-100"
              borderColor="border-green-200"
            />
            
            <LocationInput
              icon={<MaterialIcons name="place" size={20} color="#dc2626" />}
              title="DESTINATION"
              value="Where would you like to go?"
              subtitle="Enter your destination"
              onPress={handleDestinationPress}
              bgColor="bg-red-100"
              borderColor="border-red-200"
            />
          </View>

          {/* Quick Actions */}
          <QuickActions
            onSchedule={handleSchedulePress}
            onSaved={handleSavedPress}
            onFindRides={handleFindRidesPress}
          />
          
        </LinearGradient>
      </BlurView>
    </View>
  );
});

// Sub-components for better organization
const LocationInput = ({ icon, title, value, subtitle, onPress, bgColor, borderColor }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-4 border border-gray-100 shadow-sm rounded-xl"
    activeOpacity={0.8}
  >
    <View className="flex-row items-center">
      <View className={`w-10 h-10 ${bgColor} items-center justify-center mr-4 border ${borderColor} rounded-xl`}>
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-semibold tracking-wider">{title}</Text>
        <Text className="text-gray-900 text-base font-bold mt-1">{value}</Text>
        <Text className="text-gray-400 text-sm">{subtitle}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </View>
  </TouchableOpacity>
);

const QuickActions = ({ onSchedule, onSaved, onFindRides }) => (
  <View className="flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100" style={{ gap: 8 }}>
    <ActionButton 
      icon={<MaterialIcons name="schedule" size={16} color="#6b7280" />}
      label="Schedule"
      onPress={onSchedule}
      bgClass="bg-gray-50"
      borderClass="border-gray-200"
    />
    
    <ActionButton
      icon={<MaterialIcons name="favorite" size={16} color="#6b7280" />}
      label="Saved"
      onPress={onSaved}
      bgClass="bg-gray-50"
      borderClass="border-gray-200"
    />
    
    <ActionButton
      icon={<Feather name="search" size={16} color="white" />}
      label="Find Rides"
      onPress={onFindRides}
      bgClass="bg-indigo-600"
      borderClass="border-indigo-700"
      textClass="text-white"
    />
  </View>
);

const ActionButton = ({ icon, label, onPress, bgClass, borderClass, textClass = "text-gray-600" }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center ${bgClass} px-4 py-2 border ${borderClass} rounded-xl`}
    activeOpacity={0.7}
  >
    {icon}
    <Text className={`text-sm font-semibold ml-2 ${textClass}`}>{label}</Text>
  </TouchableOpacity>
);

export default PremiumBookingCard;