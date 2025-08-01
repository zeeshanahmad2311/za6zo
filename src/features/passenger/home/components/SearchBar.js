import { MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { Text, TouchableOpacity, View } from "react-native"

const SearchBar = React.memo(({ onPress, navigation }) => {
  const handlePress = () => {
    // Navigate to LocationSearchScreen instead of just calling onPress
    if (navigation) {
      navigation.navigate("LocationSearch")
    } else if (onPress) {
      onPress()
    }
  }

  return (
    <View className="mx-6 mb-6">
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
          <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-4">
            <View className="flex-row items-center">
              <View
                className="w-10 h-10 bg-indigo-100 items-center justify-center mr-4 border border-indigo-200"
                style={{ borderRadius: 20 }}
              >
                <MaterialIcons name="search" size={20} color="#4f46e5" />
              </View>
              <Text className="text-gray-600 text-base flex-1 font-medium">Where would you like to go?</Text>
              <View
                className="w-10 h-10 bg-gray-100 items-center justify-center border border-gray-200"
                style={{ borderRadius: 20 }}
              >
                <MaterialIcons name="my-location" size={18} color="#6b7280" />
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </View>
  )
})

export default SearchBar
