"use client"

import { Feather, MaterialIcons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect, useState } from "react"
import { Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native"
import { refreshApiKeys } from "../services/locationService"

const ApiKeySetup = ({ navigation }) => {
  const [googleApiKey, setGoogleApiKey] = useState("")
  const [mapboxToken, setMapboxToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [existingKeys, setExistingKeys] = useState({ google: false, mapbox: false })

  useEffect(() => {
    loadExistingKeys()
  }, [])

  const loadExistingKeys = async () => {
    try {
      const googleKey = await AsyncStorage.getItem("GOOGLE_PLACES_API_KEY")
      const mapboxKey = await AsyncStorage.getItem("MAPBOX_ACCESS_TOKEN")

      setExistingKeys({
        google: !!googleKey,
        mapbox: !!mapboxKey,
      })

      if (googleKey) setGoogleApiKey("••••••••••••••••")
      if (mapboxKey) setMapboxToken("••••••••••••••••")
    } catch (error) {
      console.error("Error loading existing keys:", error)
    }
  }

  const handleSaveKeys = async () => {
    setIsLoading(true)
    try {
      let saved = false

      if (googleApiKey.trim() && !googleApiKey.includes("•")) {
        await AsyncStorage.setItem("GOOGLE_PLACES_API_KEY", googleApiKey.trim())
        saved = true
      }

      if (mapboxToken.trim() && !mapboxToken.includes("•")) {
        await AsyncStorage.setItem("MAPBOX_ACCESS_TOKEN", mapboxToken.trim())
        saved = true
      }

      if (saved) {
        await refreshApiKeys() // Refresh the service with new keys
        Alert.alert("Success", "API keys saved successfully! Enhanced location search is now enabled.", [
          {
            text: "Continue",
            onPress: () => navigation.goBack(),
          },
        ])
      } else {
        Alert.alert("No Changes", "No new API keys were provided.")
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save API keys. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    Alert.alert(
      "Continue Without API Keys",
      "You can still search locations in Pakistan using our built-in database and OpenStreetMap. For enhanced results worldwide, you can add API keys later in settings.",
      [
        { text: "Go Back", style: "cancel" },
        {
          text: "Continue",
          onPress: () => navigation.goBack(),
        },
      ],
    )
  }

  const openGoogleConsole = () => {
    Linking.openURL("https://console.cloud.google.com/apis/library/places-backend.googleapis.com")
  }

  const openMapboxDashboard = () => {
    Linking.openURL("https://account.mapbox.com/access-tokens/")
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-12 pb-6 px-6"
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4"
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Enhanced Search Setup</Text>
        </View>
        <Text className="text-white/80 text-base">
          Add API keys for worldwide location search with millions of places
        </Text>
      </LinearGradient>

      <View className="p-6">
        {/* Current Status */}
        <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200 mb-6">
          <View className="flex-row items-center mb-2">
            <Feather name="info" size={20} color="#2563eb" />
            <Text className="text-blue-800 text-base font-bold ml-2">Current Status</Text>
          </View>
          <Text className="text-blue-700 text-sm mb-2">✅ Pakistan locations database (Built-in)</Text>
          <Text className="text-blue-700 text-sm mb-2">✅ OpenStreetMap search (Free worldwide)</Text>
          <Text className="text-blue-700 text-sm">
            {existingKeys.google ? "✅" : "❌"} Google Places API{" "}
            {existingKeys.google ? "(Configured)" : "(Not configured)"}
          </Text>
          <Text className="text-blue-700 text-sm">
            {existingKeys.mapbox ? "✅" : "❌"} Mapbox Geocoding{" "}
            {existingKeys.mapbox ? "(Configured)" : "(Not configured)"}
          </Text>
        </View>

        {/* Google Places API */}
        <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200 mb-6">
          <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                <MaterialIcons name="place" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold">Google Places API</Text>
                <Text className="text-gray-600 text-sm">Most accurate with millions of places worldwide</Text>
                {existingKeys.google && (
                  <Text className="text-green-600 text-xs font-semibold mt-1">✅ Currently configured</Text>
                )}
              </View>
            </View>

            <TextInput
              value={googleApiKey}
              onChangeText={setGoogleApiKey}
              placeholder="Enter Google Places API Key"
              className="bg-white rounded-2xl p-4 border border-gray-200 text-gray-900 mb-3"
              secureTextEntry={googleApiKey.includes("•")}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Get Google Places API Key",
                    "1. Go to Google Cloud Console\n2. Enable Places API\n3. Create credentials (API Key)\n4. Restrict to Places API\n5. Copy the API key",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Open Console", onPress: openGoogleConsole },
                    ],
                  )
                }
                className="flex-row items-center"
              >
                <Feather name="help-circle" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 text-sm font-semibold ml-2">How to get API key?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openGoogleConsole} className="flex-row items-center">
                <Feather name="external-link" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 text-sm font-semibold ml-2">Open Console</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>

        {/* Mapbox API */}
        <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200 mb-6">
          <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center mr-4">
                <MaterialIcons name="map" size={24} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold">Mapbox Geocoding</Text>
                <Text className="text-gray-600 text-sm">Great alternative with excellent coverage</Text>
                {existingKeys.mapbox && (
                  <Text className="text-green-600 text-xs font-semibold mt-1">✅ Currently configured</Text>
                )}
              </View>
            </View>

            <TextInput
              value={mapboxToken}
              onChangeText={setMapboxToken}
              placeholder="Enter Mapbox Access Token"
              className="bg-white rounded-2xl p-4 border border-gray-200 text-gray-900 mb-3"
              secureTextEntry={mapboxToken.includes("•")}
            />

            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    "Get Mapbox Access Token",
                    "1. Go to Mapbox.com\n2. Create account (free tier available)\n3. Go to Account → Access tokens\n4. Copy the default public token",
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Open Mapbox", onPress: openMapboxDashboard },
                    ],
                  )
                }
                className="flex-row items-center"
              >
                <Feather name="help-circle" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 text-sm font-semibold ml-2">How to get token?</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={openMapboxDashboard} className="flex-row items-center">
                <Feather name="external-link" size={16} color="#4f46e5" />
                <Text className="text-indigo-600 text-sm font-semibold ml-2">Open Mapbox</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>

        {/* Pakistan Focus Info */}
        <View className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-6">
          <View className="flex-row items-center mb-2">
            <Text className="text-2xl mr-2">🇵🇰</Text>
            <Text className="text-green-800 text-base font-bold">Pakistan Ready!</Text>
          </View>
          <Text className="text-green-700 text-sm">
            Our app includes a comprehensive database of Pakistani locations including major cities like Karachi,
            Lahore, Islamabad, and more. You can start using location search immediately!
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={handleSkip}
            className="flex-1 bg-gray-100 py-4 px-6 rounded-2xl border border-gray-200"
          >
            <Text className="text-gray-600 text-center font-bold">Continue Without APIs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveKeys}
            disabled={isLoading}
            className="flex-1 bg-indigo-600 py-4 px-6 rounded-2xl border border-indigo-700"
          >
            <Text className="text-white text-center font-bold">
              {isLoading ? "Saving..." : existingKeys.google || existingKeys.mapbox ? "Update Keys" : "Save Keys"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Test Search Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate("LocationSearch")}
          className="mt-4 bg-green-600 py-4 px-6 rounded-2xl border border-green-700"
        >
          <Text className="text-white text-center font-bold">🔍 Test Location Search</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default ApiKeySetup
