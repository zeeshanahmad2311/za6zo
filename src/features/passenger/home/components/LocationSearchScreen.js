"use client"

import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"
import { getNearbyPlaces, reverseGeocode, searchLocations } from "../services/locationService"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

// Pakistan coordinates for emulator fallback
const PAKISTAN_DEFAULT_LOCATION = {
  latitude: 30.3753, // Center of Pakistan
  longitude: 69.3451,
}

// Major Pakistan cities for emulator testing
const PAKISTAN_CITIES = [
  { name: "Karachi", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", lat: 31.5204, lng: 74.3587 },
  { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
  { name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
  { name: "Faisalabad", lat: 31.4504, lng: 73.135 },
]

// Calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate estimated time (assuming average speed of 30 km/h in city)
const calculateEstimatedTime = (distance) => {
  const averageSpeed = 30 // km/h
  const timeInHours = distance / averageSpeed
  const timeInMinutes = Math.round(timeInHours * 60)
  return timeInMinutes
}

// Detect if running on emulator
const isEmulator = () => {
  return (
    Platform.OS === "android" &&
    (Platform.constants?.Brand === "google" ||
      Platform.constants?.Manufacturer === "Google" ||
      Platform.constants?.Model?.includes("sdk") ||
      Platform.constants?.Model?.includes("Emulator"))
  )
}

const LocationSearchScreen = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [distance, setDistance] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  const [hasApiKeys, setHasApiKeys] = useState(false)
  const [currentLocationAddress, setCurrentLocationAddress] = useState("Getting location...")
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [watchId, setWatchId] = useState(null)
  const [isEmulatorMode, setIsEmulatorMode] = useState(false)

  const mapRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchTimeoutRef = useRef(null)

  // Get current location on component mount
  useEffect(() => {
    checkIfEmulator()
    getCurrentLocation()
    checkApiKeys()

    // Start location tracking when component mounts
    if (!isEmulator()) {
      startLocationTracking()
    }

    // Cleanup function
    return () => {
      if (watchId) {
        Location.removeLocationUpdatesAsync(watchId)
      }
    }
  }, [])

  // Load nearby places when current location is available
  useEffect(() => {
    if (currentLocation && !showMap) {
      loadNearbyPlaces()
    }
  }, [currentLocation, showMap])

  const checkIfEmulator = () => {
    const emulatorDetected = isEmulator()
    setIsEmulatorMode(emulatorDetected)
    console.log("Emulator detected:", emulatorDetected)
  }

  const checkApiKeys = async () => {
    try {
      const AsyncStorage = require("@react-native-async-storage/async-storage").default
      const googleKey = await AsyncStorage.getItem("GOOGLE_PLACES_API_KEY")
      const mapboxKey = await AsyncStorage.getItem("MAPBOX_ACCESS_TOKEN")
      setHasApiKeys(!!(googleKey || mapboxKey))
    } catch (error) {
      console.error("Error checking API keys:", error)
    }
  }

  const getCurrentLocation = async () => {
    try {
      // Check if running on emulator
      if (isEmulator()) {
        console.log("Emulator detected - using Pakistan default location")

        Alert.alert(
          "Emulator Detected",
          "You're running on an emulator. Choose your location in Pakistan:",
          PAKISTAN_CITIES.map((city) => ({
            text: city.name,
            onPress: () => {
              const location = { latitude: city.lat, longitude: city.lng }
              setCurrentLocation(location)
              setCurrentLocationAddress(`${city.name}, Pakistan (Emulator)`)
              setIsLocationLoading(false)
            },
          })).concat([
            {
              text: "Use Default (Center of Pakistan)",
              onPress: () => {
                setCurrentLocation(PAKISTAN_DEFAULT_LOCATION)
                setCurrentLocationAddress("Pakistan (Emulator Default)")
                setIsLocationLoading(false)
              },
            },
          ]),
        )
        return
      }

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "Please enable location permission to detect your current location and find nearby places.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
            {
              text: "Use Pakistan Default",
              onPress: () => {
                setCurrentLocation(PAKISTAN_DEFAULT_LOCATION)
                setCurrentLocationAddress("Pakistan (Default - No GPS)")
              },
            },
          ],
        )
        return
      }

      // Show loading indicator while getting location
      setIsLocationLoading(true)

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
      })

      const currentCoord = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }

      setCurrentLocation(currentCoord)

      // Get address for current location
      try {
        const addressData = await reverseGeocode(currentCoord)
        setCurrentLocationAddress(addressData.address)
      } catch (error) {
        console.error("Error getting current address:", error)
        setCurrentLocationAddress("Current Location")
      }

      setIsLocationLoading(false)
    } catch (error) {
      console.error("Error getting current location:", error)
      setIsLocationLoading(false)

      Alert.alert(
        "Location Error",
        "Unable to get your current location. Choose a Pakistan location:",
        PAKISTAN_CITIES.map((city) => ({
          text: city.name,
          onPress: () => {
            const location = { latitude: city.lat, longitude: city.lng }
            setCurrentLocation(location)
            setCurrentLocationAddress(`${city.name}, Pakistan (Manual Selection)`)
          },
        })).concat([
          {
            text: "Use Default",
            onPress: () => {
              setCurrentLocation(PAKISTAN_DEFAULT_LOCATION)
              setCurrentLocationAddress("Pakistan (Default)")
            },
          },
        ]),
      )
    }
  }

  const loadNearbyPlaces = async () => {
    if (!currentLocation) return

    try {
      const places = await getNearbyPlaces(currentLocation)
      setNearbyPlaces(places)
    } catch (error) {
      console.error("Error loading nearby places:", error)
    }
  }

  // Debounced search function
  const handleSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([])
        return
      }

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Set new timeout for debounced search
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true)
        try {
          console.log("Starting worldwide search for:", query)
          const results = await searchLocations(query, currentLocation)
          console.log("Search completed, results:", results.length)
          setSearchResults(results)

          if (results.length === 0) {
            // Show helpful message for worldwide search
          
          }
        } catch (error) {
          console.error("Search error:", error)
          Alert.alert(
            "Search Error",
            "Unable to search locations. Please check your internet connection and try again.",
          )
        } finally {
          setIsSearching(false)
        }
      }, 300) // 300ms delay
    },
    [currentLocation],
  )

  // Handle location selection
  const handleLocationSelect = useCallback(
    (location) => {
      setSelectedLocation(location)
      setSearchQuery(location.name)
      setSearchResults([])
      setShowMap(true)
      Keyboard.dismiss()

      // Add to search history
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== location.id)
        return [location, ...filtered].slice(0, 5) // Keep only 5 recent searches
      })

      if (currentLocation) {
        // Calculate distance and time
        const dist = calculateDistance(currentLocation, location.coordinate)
        const time = calculateEstimatedTime(dist)

        setDistance(dist)
        setEstimatedTime(time)

        // Create route coordinates (simple straight line for demo)
        setRouteCoordinates([currentLocation, location.coordinate])

        // Animate map to show both locations
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates([currentLocation, location.coordinate], {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true,
            })
          }
        }, 500)
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    },
    [currentLocation],
  )

  // Handle map press to select location
  const handleMapPress = useCallback(
    async (event) => {
      const coordinate = event.nativeEvent.coordinate

      try {
        const locationData = await reverseGeocode(coordinate)
        const customLocation = {
          id: `custom_${Date.now()}`,
          name: locationData.name,
          address: locationData.address,
          coordinate: coordinate,
          type: "custom",
        }

        handleLocationSelect(customLocation)
      } catch (error) {
        console.error("Reverse geocoding error:", error)
        const customLocation = {
          id: `custom_${Date.now()}`,
          name: "Selected Location",
          address: `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
          coordinate: coordinate,
          type: "custom",
        }
        handleLocationSelect(customLocation)
      }
    },
    [handleLocationSelect],
  )

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (showMap) {
      setShowMap(false)
      setSelectedLocation(null)
      setRouteCoordinates([])
    } else {
      navigation.goBack()
    }
  }, [showMap, navigation])

  // Handle book ride
  const handleBookRide = useCallback(() => {
    if (selectedLocation && currentLocation) {
      navigation.navigate("BookRide", {
        pickup: currentLocation,
        destination: selectedLocation.coordinate,
        destinationName: selectedLocation.name,
        distance: distance,
        estimatedTime: estimatedTime,
      })
    }
  }, [selectedLocation, currentLocation, distance, estimatedTime, navigation])

  const getLocationIcon = (type) => {
    switch (type) {
      case "city":
        return "map"
      case "airport":
        return "send"
      case "transit":
        return "train"
      case "medical":
        return "heart"
      case "restaurant":
        return "coffee"
      case "gas_station":
        return "zap"
      case "bank":
        return "credit-card"
      case "education":
        return "book"
      case "landmark":
        return "camera"
      case "shopping":
        return "shopping-bag"
      case "custom":
        return "map-pin"
      default:
        return "map-pin"
    }
  }

  const getLocationIconColor = (type) => {
    switch (type) {
      case "city":
        return "#3b82f6"
      case "airport":
        return "#0ea5e9"
      case "transit":
        return "#2563eb"
      case "medical":
        return "#dc2626"
      case "restaurant":
        return "#f59e0b"
      case "gas_station":
        return "#10b981"
      case "bank":
        return "#8b5cf6"
      case "education":
        return "#06b6d4"
      case "landmark":
        return "#f97316"
      case "shopping":
        return "#ec4899"
      default:
        return "#4f46e5"
    }
  }

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") return

      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update when moved 50 meters
        },
        (location) => {
          const newCoord = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
          setCurrentLocation(newCoord)

          // Update route if destination is selected
          if (selectedLocation) {
            const dist = calculateDistance(newCoord, selectedLocation.coordinate)
            const time = calculateEstimatedTime(dist)
            setDistance(dist)
            setEstimatedTime(time)
            setRouteCoordinates([newCoord, selectedLocation.coordinate])
          }
        },
      )

      setWatchId(watchId)
    } catch (error) {
      console.error("Error starting location tracking:", error)
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: statusBarHeight + 15,
          paddingBottom: 15,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold flex-1">
            {showMap ? "Select Destination" : "Search Worldwide"}
          </Text>

          {showMap && (
            <TouchableOpacity
              onPress={() => setShowMap(false)}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              activeOpacity={0.7}
            >
              <Feather name="search" size={20} color="white" />
            </TouchableOpacity>
          )}

          {!hasApiKeys && !showMap && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ApiKeySetup")}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              activeOpacity={0.7}
            >
              <Feather name="settings" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {!showMap ? (
        // Search Interface
        <View className="flex-1">
          {/* Search Input */}
          <View className="p-6">
            <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
              <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-4">
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 bg-indigo-100 items-center justify-center mr-4 border border-indigo-200"
                    style={{ borderRadius: 20 }}
                  >
                    <MaterialIcons name="search" size={20} color="#4f46e5" />
                  </View>
                  <TextInput
                    ref={searchInputRef}
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text)
                      handleSearch(text)
                    }}
                    placeholder="Search anywhere: New York, London, Tokyo, Karachi..."
                    className="text-gray-900 text-base flex-1 font-medium"
                    autoFocus
                    returnKeyType="search"
                    onSubmitEditing={() => handleSearch(searchQuery)}
                  />
                  {isSearching && <ActivityIndicator size="small" color="#4f46e5" />}
                  {searchQuery.length > 0 && !isSearching && (
                    <TouchableOpacity
                      onPress={() => {
                        setSearchQuery("")
                        setSearchResults([])
                      }}
                      className="w-8 h-8 bg-gray-100 items-center justify-center border border-gray-200"
                      style={{ borderRadius: 20 }}
                    >
                      <Feather name="x" size={16} color="#6b7280" />
                    </TouchableOpacity>
                  )}
                </View>
              </LinearGradient>
            </BlurView>

            {/* Emulator Notice */}
            {isEmulatorMode && (
              <View className="mt-3 bg-blue-50 rounded-2xl p-3 border border-blue-200">
                <View className="flex-row items-center">
                  <Feather name="smartphone" size={16} color="#2563eb" />
                  <Text className="text-blue-800 text-sm font-semibold ml-2 flex-1">
                    Emulator Mode: Location set to Pakistan
                  </Text>
                </View>
              </View>
            )}

            {/* API Status */}
            {!hasApiKeys && (
              <TouchableOpacity
                onPress={() => navigation.navigate("ApiKeySetup")}
                className="mt-3 bg-yellow-50 rounded-2xl p-3 border border-yellow-200"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Feather name="zap" size={16} color="#f59e0b" />
                  <Text className="text-yellow-800 text-sm font-semibold ml-2 flex-1">
                    Add API keys for enhanced worldwide search
                  </Text>
                  <Feather name="chevron-right" size={16} color="#f59e0b" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            {/* Search Results */}
            {searchResults.map((location) => (
              <TouchableOpacity
                key={location.id}
                onPress={() => handleLocationSelect(location)}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 items-center justify-center mr-4 border"
                    style={{
                      borderRadius: 20,
                      backgroundColor: `${getLocationIconColor(location.type)}15`,
                      borderColor: `${getLocationIconColor(location.type)}30`,
                    }}
                  >
                    <Feather
                      name={getLocationIcon(location.type)}
                      size={20}
                      color={getLocationIconColor(location.type)}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-bold mb-1">{location.name}</Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={2}>
                      {location.address}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      {location.rating && (
                        <>
                          <FontAwesome5 name="star" size={12} color="#fbbf24" solid />
                          <Text className="text-gray-400 text-xs ml-1 mr-3">{location.rating}</Text>
                        </>
                      )}
                      {location.country && (
                        <View className="bg-gray-100 px-2 py-1 rounded-full">
                          <Text className="text-gray-600 text-xs font-semibold">{location.country}</Text>
                        </View>
                      )}
                      {location.source && (
                        <View className="bg-indigo-100 px-2 py-1 rounded-full ml-2">
                          <Text className="text-indigo-600 text-xs font-semibold">{location.source}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Feather name="chevron-right" size={20} color="#9ca3af" />
                </View>
              </TouchableOpacity>
            ))}

            {searchQuery.length > 0 && !isSearching && searchResults.length === 0 && (
              <View className="py-8 items-center">
                <Text className="text-4xl mb-4">🌍</Text>
                <Text className="text-gray-500 text-base font-bold mb-2">No locations found worldwide</Text>
                <Text className="text-gray-400 text-sm text-center mb-4">
                  Try searching for cities, landmarks, or countries
                </Text>
                <View className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                  <Text className="text-blue-800 text-sm font-semibold mb-2">Try searching for:</Text>
                  <Text className="text-blue-700 text-sm">• Cities: New York, London, Tokyo, Karachi</Text>
                  <Text className="text-blue-700 text-sm">• Landmarks: Eiffel Tower, Big Ben, Taj Mahal</Text>
                  <Text className="text-blue-700 text-sm">• Airports: JFK, Heathrow, Dubai Airport</Text>
                  <Text className="text-blue-700 text-sm">• Countries: USA, UK, Japan, Pakistan</Text>
                </View>
              </View>
            )}

            {/* Quick Access and Popular Places */}
            {searchQuery.length === 0 && (
              <View>
                {/* Quick Access */}
                <Text className="text-xl font-bold text-gray-900 mb-4">Quick Access</Text>

                <TouchableOpacity
                  onPress={() => {
                    if (!currentLocation) {
                      Alert.alert(
                        "Location Not Available",
                        "Please wait while we get your current location, or choose a city manually.",
                      )
                      return
                    }

                    setShowMap(true)
                    setSelectedLocation(null) // Clear any previous selection
                    setRouteCoordinates([]) // Clear route

                    // Center map on current location with proper zoom
                    setTimeout(() => {
                      if (mapRef.current && currentLocation) {
                        mapRef.current.animateToRegion(
                          {
                            latitude: currentLocation.latitude,
                            longitude: currentLocation.longitude,
                            latitudeDelta: 0.01, // Closer zoom level
                            longitudeDelta: 0.01,
                          },
                          1000,
                        )
                      }
                    }, 500)
                  }}
                  className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <View
                      className="w-12 h-12 bg-green-100 items-center justify-center mr-4 border border-green-200"
                      style={{ borderRadius: 20 }}
                    >
                      <MaterialIcons name="my-location" size={20} color="#059669" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 text-base font-bold mb-1">Choose on Map</Text>
                      <Text className="text-gray-500 text-sm">
                        {currentLocation
                          ? currentLocationAddress || "Tap to view your location on map"
                          : isLocationLoading
                            ? "Getting your location..."
                            : "Location not available"}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9ca3af" />
                  </View>
                </TouchableOpacity>

                {/* Popular Worldwide Locations */}
                <Text className="text-lg font-bold text-gray-900 mb-4 mt-6">🌍 Popular Worldwide</Text>

                {[
                  { name: "New York", address: "New York, NY, USA", type: "city", country: "🇺🇸" },
                  { name: "London", address: "London, United Kingdom", type: "city", country: "🇬🇧" },
                  { name: "Dubai", address: "Dubai, UAE", type: "city", country: "🇦🇪" },
                  { name: "Tokyo", address: "Tokyo, Japan", type: "city", country: "🇯🇵" },
                  { name: "Paris", address: "Paris, France", type: "city", country: "🇫🇷" },
                ].map((place, index) => (
                  <TouchableOpacity
                    key={`popular_${index}`}
                    onPress={() =>
                      handleLocationSelect({
                        id: `popular_${index}`,
                        name: place.name,
                        address: place.address,
                        coordinate: { latitude: 40.7128 + index * 10, longitude: -74.006 + index * 10 },
                        type: place.type,
                        country: place.country,
                        isWorldwidePlace: true,
                      })
                    }
                    className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-12 h-12 items-center justify-center mr-4 border"
                        style={{
                          borderRadius: 20,
                          backgroundColor: `${getLocationIconColor(place.type)}15`,
                          borderColor: `${getLocationIconColor(place.type)}30`,
                        }}
                      >
                        <Feather
                          name={getLocationIcon(place.type)}
                          size={20}
                          color={getLocationIconColor(place.type)}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 text-base font-bold mb-1">{place.name}</Text>
                        <Text className="text-gray-500 text-sm">{place.address}</Text>
                        <View className="bg-blue-100 px-2 py-1 rounded-full mt-1 self-start">
                          <Text className="text-blue-600 text-xs font-semibold">{place.country} Worldwide</Text>
                        </View>
                      </View>
                      <Feather name="chevron-right" size={20} color="#9ca3af" />
                    </View>
                  </TouchableOpacity>
                ))}

                {/* Search History */}
                {searchHistory.length > 0 && (
                  <>
                    <Text className="text-lg font-bold text-gray-900 mb-4 mt-6">Recent Searches</Text>
                    {searchHistory.map((location) => (
                      <TouchableOpacity
                        key={`history_${location.id}`}
                        onPress={() => handleLocationSelect(location)}
                        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                        activeOpacity={0.8}
                      >
                        <View className="flex-row items-center">
                          <View
                            className="w-12 h-12 bg-gray-100 items-center justify-center mr-4 border border-gray-200"
                            style={{ borderRadius: 20 }}
                          >
                            <MaterialIcons name="history" size={20} color="#6b7280" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 text-base font-bold mb-1">{location.name}</Text>
                            <Text className="text-gray-500 text-sm" numberOfLines={1}>
                              {location.address}
                            </Text>
                          </View>
                          <Feather name="chevron-right" size={20} color="#9ca3af" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}

                {/* Nearby Places */}
                {nearbyPlaces.length > 0 && (
                  <>
                    <Text className="text-lg font-bold text-gray-900 mb-4 mt-6">Nearby Places</Text>
                    {nearbyPlaces.map((place) => (
                      <TouchableOpacity
                        key={`nearby_${place.id}`}
                        onPress={() => handleLocationSelect(place)}
                        className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
                        activeOpacity={0.8}
                      >
                        <View className="flex-row items-center">
                          <View
                            className="w-12 h-12 items-center justify-center mr-4 border"
                            style={{
                              borderRadius: 20,
                              backgroundColor: `${getLocationIconColor(place.type)}15`,
                              borderColor: `${getLocationIconColor(place.type)}30`,
                            }}
                          >
                            <Feather
                              name={getLocationIcon(place.type)}
                              size={20}
                              color={getLocationIconColor(place.type)}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 text-base font-bold mb-1">{place.name}</Text>
                            <Text className="text-gray-500 text-sm">{place.address}</Text>
                            <View className="flex-row items-center mt-1">
                              {place.rating && (
                                <>
                                  <FontAwesome5 name="star" size={12} color="#fbbf24" solid />
                                  <Text className="text-gray-400 text-xs ml-1 mr-3">{place.rating}</Text>
                                </>
                              )}
                              {place.isOpen !== undefined && (
                                <View
                                  className={`px-2 py-1 rounded-full ${place.isOpen ? "bg-green-100" : "bg-red-100"}`}
                                >
                                  <Text
                                    className={`text-xs font-semibold ${place.isOpen ? "text-green-600" : "text-red-600"}`}
                                  >
                                    {place.isOpen ? "Open" : "Closed"}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                          <Feather name="chevron-right" size={20} color="#9ca3af" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        // Map Interface
        <View className="flex-1">
          {currentLocation && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={{
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01, // Closer zoom for better detail
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
              showsUserLocation={!isEmulatorMode} // Hide user location dot on emulator
              showsMyLocationButton={false}
              followsUserLocation={!isEmulatorMode}
              showsCompass={true}
              showsScale={true}
              showsTraffic={true}
            >
              {/* Current Location Marker with custom design */}
              <Marker coordinate={currentLocation} title="Your Current Location" description={currentLocationAddress}>
                <View className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              </Marker>

              {/* Selected Location Marker */}
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation.coordinate}
                  title={selectedLocation.name}
                  description={selectedLocation.address}
                >
                  <View className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg items-center justify-center">
                    <MaterialIcons name="place" size={20} color="white" />
                  </View>
                </Marker>
              )}

              {/* Route Polyline with better styling */}
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="#4f46e5"
                  strokeWidth={5}
                  lineDashPattern={[10, 5]}
                  lineJoin="round"
                  lineCap="round"
                />
              )}
            </MapView>
          )}

          {/* My Location Button - Enhanced */}
          {showMap && (
            <View className="absolute top-20 right-6">
              <TouchableOpacity
                onPress={() => {
                  if (mapRef.current && currentLocation) {
                    // Clear any selected location and route when centering on current location
                    setSelectedLocation(null)
                    setRouteCoordinates([])

                    mapRef.current.animateToRegion(
                      {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        latitudeDelta: 0.005, // Very close zoom
                        longitudeDelta: 0.005,
                      },
                      1000,
                    )

                    // Haptic feedback
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  }
                }}
                className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border border-gray-200"
                activeOpacity={0.8}
              >
                <MaterialIcons name="my-location" size={24} color="#4f46e5" />
              </TouchableOpacity>
            </View>
          )}

          {/* Floating Search Bar on Map */}
          {showMap && (
            <View className="absolute top-20 left-6 right-20">
              <BlurView intensity={80} style={{ borderRadius: 16 }} className="overflow-hidden border border-gray-200">
                <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-3">
                  <View className="flex-row items-center">
                    <MaterialIcons name="search" size={20} color="#4f46e5" />
                    <TextInput
                      value={searchQuery}
                      onChangeText={(text) => {
                        setSearchQuery(text)
                        handleSearch(text)
                      }}
                      placeholder="Search anywhere on map..."
                      className="text-gray-900 text-sm flex-1 font-medium ml-3"
                      returnKeyType="search"
                      onSubmitEditing={() => handleSearch(searchQuery)}
                    />
                  </View>

                  {/* Search Results Dropdown on Map */}
                  {searchResults.length > 0 && (
                    <ScrollView
                      className="mt-3 max-h-40"
                      showsVerticalScrollIndicator={false}
                      nestedScrollEnabled={true}
                    >
                      {searchResults.slice(0, 5).map((location) => (
                        <TouchableOpacity
                          key={location.id}
                          onPress={() => {
                            handleLocationSelect(location)
                            setSearchResults([])
                          }}
                          className="py-2 border-t border-gray-100"
                          activeOpacity={0.8}
                        >
                          <View className="flex-row items-center">
                            <Text className="text-gray-900 text-sm font-semibold flex-1" numberOfLines={1}>
                              {location.name}
                            </Text>
                            {location.country && <Text className="text-gray-500 text-xs ml-2">{location.country}</Text>}
                          </View>
                          <Text className="text-gray-500 text-xs" numberOfLines={1}>
                            {location.address}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </LinearGradient>
              </BlurView>
            </View>
          )}

          {/* Bottom Info Card */}
          {selectedLocation && (
            <View className="absolute bottom-6 left-6 right-6">
              <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
                <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
                  <View className="flex-row items-center mb-4">
                    <View
                      className="w-12 h-12 bg-red-100 items-center justify-center mr-4 border border-red-200"
                      style={{ borderRadius: 20 }}
                    >
                      <MaterialIcons name="place" size={24} color="#dc2626" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 text-lg font-bold mb-1">{selectedLocation.name}</Text>
                      <Text className="text-gray-500 text-sm" numberOfLines={2}>
                        {selectedLocation.address}
                      </Text>
                    </View>
                  </View>

                  {/* Distance and Time Info */}
                  <View className="flex-row items-center justify-between mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <View className="flex-row items-center">
                      <FontAwesome5 name="route" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm font-semibold ml-2">{distance.toFixed(1)} km</Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="access-time" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm font-semibold ml-2">~{estimatedTime} min</Text>
                    </View>
                    <View className="flex-row items-center">
                      <FontAwesome5 name="rupee-sign" size={14} color="#6b7280" />
                      <Text className="text-gray-600 text-sm font-semibold ml-1">₹{Math.round(distance * 12)}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row" style={{ gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => setShowMap(false)}
                      className="flex-1 bg-gray-100 py-3 px-4 flex-row items-center justify-center border border-gray-200"
                      style={{ borderRadius: 16 }}
                    >
                      <Feather name="edit-2" size={16} color="#6b7280" />
                      <Text className="text-gray-600 text-sm font-bold ml-2">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleBookRide}
                      className="flex-2 bg-indigo-600 py-3 px-6 flex-row items-center justify-center border border-indigo-700"
                      style={{ borderRadius: 16 }}
                    >
                      <FontAwesome5 name="car" size={16} color="white" />
                      <Text className="text-white text-sm font-bold ml-2">Book Ride</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default LocationSearchScreen
