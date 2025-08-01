"use client"

import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import * as Location from "expo-location"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps"

const { width: screenWidth, height: screenHeight } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

// Mock driver data
const MOCK_DRIVER = {
  id: "driver_123",
  name: "Ahmed Khan",
  phone: "+92 300 1234567",
  rating: 4.8,
  totalRides: 1247,
  vehicleNumber: "KHI-2024",
  vehicleModel: "Bajaj Auto Rickshaw",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  currentLocation: null,
}

// Ride status types
const RIDE_STATUS = {
  SEARCHING: "searching",
  DRIVER_ASSIGNED: "driver_assigned",
  DRIVER_ARRIVING: "driver_arriving",
  DRIVER_ARRIVED: "driver_arrived",
  RIDE_STARTED: "ride_started",
  RIDE_COMPLETED: "ride_completed",
  RIDE_CANCELLED: "ride_cancelled",
}

const TrackRideScreen = ({ navigation, route }) => {
  const { rideDetails } = route.params
  const [currentLocation, setCurrentLocation] = useState(null)
  const [driverLocation, setDriverLocation] = useState(null)
  const [rideStatus, setRideStatus] = useState(RIDE_STATUS.DRIVER_ASSIGNED)
  const [estimatedArrival, setEstimatedArrival] = useState("2-5 min")
  const [rideProgress, setRideProgress] = useState(0)
  const [driver, setDriver] = useState(MOCK_DRIVER)
  const [routeCoordinates, setRouteCoordinates] = useState([])
  const [isTrackingActive, setIsTrackingActive] = useState(true)
  const [rideStartTime, setRideStartTime] = useState(null)
  const [currentFare, setCurrentFare] = useState(rideDetails.price)

  const mapRef = useRef(null)
  const pulseAnimation = useRef(new Animated.Value(1)).current

  // Initialize ride tracking
  useEffect(() => {
    initializeRideTracking()
    startLocationTracking()
    simulateRideProgress()
    startPulseAnimation()

    return () => {
      setIsTrackingActive(false)
    }
  }, [])

  // Update map view when locations change
  useEffect(() => {
    if (currentLocation && driverLocation && mapRef.current) {
      const coordinates = [currentLocation, driverLocation]
      if (rideStatus === RIDE_STATUS.RIDE_STARTED && rideDetails.destination) {
        coordinates.push(rideDetails.destination)
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      })
    }
  }, [currentLocation, driverLocation, rideStatus])

  const initializeRideTracking = () => {
    // Set initial driver location (simulate driver approaching)
    const initialDriverLocation = {
      latitude: rideDetails.pickup.latitude + 0.005,
      longitude: rideDetails.pickup.longitude + 0.005,
    }
    setDriverLocation(initialDriverLocation)
    setCurrentLocation(rideDetails.pickup)

    // Update driver info with current location
    setDriver((prev) => ({
      ...prev,
      currentLocation: initialDriverLocation,
    }))
  }

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") return

      // Track user's current location
      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (location) => {
          if (isTrackingActive) {
            const newLocation = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }
            setCurrentLocation(newLocation)
          }
        },
      )

      return () => {
        Location.removeLocationUpdatesAsync(watchId)
      }
    } catch (error) {
      console.error("Location tracking error:", error)
    }
  }

  const simulateRideProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      if (!isTrackingActive) {
        clearInterval(interval)
        return
      }

      progress += 1

      // Simulate different ride stages
      if (progress <= 30) {
        setRideStatus(RIDE_STATUS.DRIVER_ARRIVING)
        setEstimatedArrival(`${Math.max(1, 5 - Math.floor(progress / 6))} min`)

        // Move driver closer to pickup
        if (driverLocation) {
          const newDriverLocation = {
            latitude: driverLocation.latitude - 0.0001 * progress,
            longitude: driverLocation.longitude - 0.0001 * progress,
          }
          setDriverLocation(newDriverLocation)
        }
      } else if (progress <= 35) {
        setRideStatus(RIDE_STATUS.DRIVER_ARRIVED)
        setEstimatedArrival("Driver has arrived")

        // Driver at pickup location
        if (currentLocation) {
          setDriverLocation({
            latitude: currentLocation.latitude + 0.0001,
            longitude: currentLocation.longitude + 0.0001,
          })
        }
      } else if (progress <= 40) {
        setRideStatus(RIDE_STATUS.RIDE_STARTED)
        setRideStartTime(new Date())
        setEstimatedArrival(`${rideDetails.estimatedTime} min to destination`)

        // Start moving towards destination
        if (currentLocation && rideDetails.destination) {
          setRouteCoordinates([currentLocation, rideDetails.destination])
        }
      } else if (progress <= 100) {
        // Simulate ride in progress
        const rideProgressPercent = ((progress - 40) / 60) * 100
        setRideProgress(rideProgressPercent)

        // Update fare based on progress (simulate meter)
        const additionalFare = Math.floor(rideProgressPercent / 10) * 2
        setCurrentFare(rideDetails.price + additionalFare)

        // Move driver towards destination
        if (currentLocation && rideDetails.destination && driverLocation) {
          const progressRatio = rideProgressPercent / 100
          const newDriverLocation = {
            latitude:
              currentLocation.latitude + (rideDetails.destination.latitude - currentLocation.latitude) * progressRatio,
            longitude:
              currentLocation.longitude +
              (rideDetails.destination.longitude - currentLocation.longitude) * progressRatio,
          }
          setDriverLocation(newDriverLocation)
        }

        const remainingTime = Math.max(1, rideDetails.estimatedTime - Math.floor(rideProgressPercent / 10))
        setEstimatedArrival(`${remainingTime} min remaining`)
      } else {
        setRideStatus(RIDE_STATUS.RIDE_COMPLETED)
        setRideProgress(100)
        setEstimatedArrival("Ride completed")
        clearInterval(interval)

        // Show completion alert
        setTimeout(() => {
          Alert.alert(
            "Ride Completed! 🎉",
            `Thank you for riding with us!\n\nTotal Fare: ₹${currentFare}\nRide Time: ${Math.floor((new Date() - rideStartTime) / 60000)} minutes`,
            [
              {
                text: "Rate Driver",
                onPress: () => navigation.navigate("RateRideScreen", { rideDetails, driver, finalFare: currentFare }),
              },
              {
                text: "Go Home",
                onPress: () => navigation.navigate("PassengerTabs"),
              },
            ],
          )
        }, 1000)
      }
    }, 2000) // Update every 2 seconds for demo
  }

  const startPulseAnimation = () => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (isTrackingActive && rideStatus !== RIDE_STATUS.RIDE_COMPLETED) {
          pulse()
        }
      })
    }
    pulse()
  }

  const handleCallDriver = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    Alert.alert("Call Driver", `Call ${driver.name} at ${driver.phone}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Call",
        onPress: () => {
          Linking.openURL(`tel:${driver.phone}`)
        },
      },
    ])
  }, [driver])

  const handleMessageDriver = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert("Message Driver", "Send a quick message to your driver:", [
      { text: "Cancel", style: "cancel" },
      { text: "I'm waiting outside", onPress: () => console.log("Message sent: I'm waiting outside") },
      { text: "Running 2 mins late", onPress: () => console.log("Message sent: Running 2 mins late") },
      { text: "Custom message", onPress: () => console.log("Open custom message") },
    ])
  }, [])

  const handleCancelRide = useCallback(() => {
    Alert.alert("Cancel Ride", "Are you sure you want to cancel this ride? Cancellation charges may apply.", [
      { text: "Keep Ride", style: "cancel" },
      {
        text: "Cancel Ride",
        style: "destructive",
        onPress: () => {
          setRideStatus(RIDE_STATUS.RIDE_CANCELLED)
          setIsTrackingActive(false)
          navigation.goBack()
        },
      },
    ])
  }, [navigation])

  const handleEmergency = useCallback(() => {
    Alert.alert("Emergency", "Choose emergency action:", [
      { text: "Cancel", style: "cancel" },
      { text: "Call Police (100)", onPress: () => Linking.openURL("tel:100") },
      { text: "Call Emergency (1122)", onPress: () => Linking.openURL("tel:1122") },
      { text: "Share Live Location", onPress: () => console.log("Share location with emergency contact") },
    ])
  }, [])

  const getStatusColor = () => {
    switch (rideStatus) {
      case RIDE_STATUS.DRIVER_ARRIVING:
        return "#f59e0b"
      case RIDE_STATUS.DRIVER_ARRIVED:
        return "#10b981"
      case RIDE_STATUS.RIDE_STARTED:
        return "#3b82f6"
      case RIDE_STATUS.RIDE_COMPLETED:
        return "#059669"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = () => {
    switch (rideStatus) {
      case RIDE_STATUS.DRIVER_ARRIVING:
        return "Driver is on the way"
      case RIDE_STATUS.DRIVER_ARRIVED:
        return "Driver has arrived"
      case RIDE_STATUS.RIDE_STARTED:
        return "Ride in progress"
      case RIDE_STATUS.RIDE_COMPLETED:
        return "Ride completed"
      default:
        return "Searching for driver"
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
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text-white text-lg font-bold">Track Your Ride</Text>
            <Text className="text-white/80 text-sm">{getStatusText()}</Text>
          </View>

          <TouchableOpacity
            onPress={handleEmergency}
            className="w-10 h-10 rounded-full bg-red-500/80 items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name="emergency" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Map */}
      <View className="flex-1">
        {currentLocation && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsTraffic={true}
            showsCompass={true}
          >
            {/* User Location Marker */}
            <Marker coordinate={currentLocation} title="Your Location" description="Pickup point">
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnimation }],
                }}
                className="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg items-center justify-center"
              >
                <MaterialIcons name="person" size={16} color="white" />
              </Animated.View>
            </Marker>

            {/* Driver Location Marker */}
            {driverLocation && (
              <Marker
                coordinate={driverLocation}
                title={driver.name}
                description={`${driver.vehicleModel} - ${driver.vehicleNumber}`}
              >
                <View className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-lg items-center justify-center">
                  <Text className="text-white text-lg">🛺</Text>
                </View>
              </Marker>
            )}

            {/* Destination Marker */}
            {rideDetails.destination && rideStatus === RIDE_STATUS.RIDE_STARTED && (
              <Marker
                coordinate={rideDetails.destination}
                title="Destination"
                description={rideDetails.destinationName}
              >
                <View className="w-8 h-8 bg-red-500 rounded-full border-2 border-white shadow-lg items-center justify-center">
                  <MaterialIcons name="place" size={20} color="white" />
                </View>
              </Marker>
            )}

            {/* Route Polyline */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#4f46e5"
                strokeWidth={4}
                lineDashPattern={[10, 5]}
              />
            )}
          </MapView>
        )}

        {/* Status Banner */}
        <View className="absolute top-4 left-4 right-4">
          <BlurView intensity={80} style={{ borderRadius: 16 }} className="overflow-hidden border border-gray-200">
            <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-4">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: getStatusColor() }} />
                <View className="flex-1">
                  <Text className="text-gray-900 text-sm font-bold">{getStatusText()}</Text>
                  <Text className="text-gray-600 text-xs">{estimatedArrival}</Text>
                </View>
                {rideStatus === RIDE_STATUS.RIDE_STARTED && (
                  <View className="items-end">
                    <Text className="text-gray-900 text-sm font-bold">₹{currentFare}</Text>
                    <Text className="text-gray-500 text-xs">{rideProgress.toFixed(0)}% complete</Text>
                  </View>
                )}
              </View>

              {/* Progress Bar for Active Ride */}
              {rideStatus === RIDE_STATUS.RIDE_STARTED && (
                <View className="mt-3 bg-gray-200 rounded-full h-2">
                  <View className="bg-blue-500 h-2 rounded-full" style={{ width: `${rideProgress}%` }} />
                </View>
              )}
            </LinearGradient>
          </BlurView>
        </View>
      </View>

      {/* Bottom Driver Info Card */}
      <View className="bg-white border-t border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-4">
          {/* Driver Info */}
          <View
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mr-4"
            style={{ width: screenWidth * 0.8 }}
          >
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-gray-200 rounded-full mr-4 items-center justify-center">
                <Text className="text-2xl">👨‍💼</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-lg font-bold">{driver.name}</Text>
                <View className="flex-row items-center mt-1">
                  <FontAwesome5 name="star" size={12} color="#fbbf24" solid />
                  <Text className="text-gray-600 text-sm ml-1">
                    {driver.rating} • {driver.totalRides} rides
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1">
                  {driver.vehicleModel} • {driver.vehicleNumber}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleCallDriver}
                className="flex-1 bg-green-600 py-3 px-4 flex-row items-center justify-center border border-green-700"
                style={{ borderRadius: 12 }}
              >
                <Feather name="phone" size={16} color="white" />
                <Text className="text-white text-sm font-bold ml-2">Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMessageDriver}
                className="flex-1 bg-blue-600 py-3 px-4 flex-row items-center justify-center border border-blue-700"
                style={{ borderRadius: 12 }}
              >
                <Feather name="message-circle" size={16} color="white" />
                <Text className="text-white text-sm font-bold ml-2">Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Trip Details Card */}
          <View
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mr-4"
            style={{ width: screenWidth * 0.7 }}
          >
            <Text className="text-gray-900 text-lg font-bold mb-3">Trip Details</Text>

            <View className="space-y-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="my-location" size={16} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs">PICKUP</Text>
                  <Text className="text-gray-900 text-sm font-semibold">Current Location</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="place" size={16} color="#dc2626" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs">DESTINATION</Text>
                  <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
                    {rideDetails.destinationName}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                <View className="items-center">
                  <Text className="text-gray-500 text-xs">DISTANCE</Text>
                  <Text className="text-gray-900 text-sm font-bold">{rideDetails.distance.toFixed(1)} km</Text>
                </View>
                <View className="items-center">
                  <Text className="text-gray-500 text-xs">FARE</Text>
                  <Text className="text-gray-900 text-sm font-bold">₹{currentFare}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Emergency & Cancel Card */}
          <View
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            style={{ width: screenWidth * 0.6 }}
          >
            <Text className="text-gray-900 text-lg font-bold mb-3">Quick Actions</Text>

            <TouchableOpacity
              onPress={handleEmergency}
              className="bg-red-600 py-3 px-4 flex-row items-center justify-center mb-3 border border-red-700"
              style={{ borderRadius: 12 }}
            >
              <MaterialIcons name="emergency" size={16} color="white" />
              <Text className="text-white text-sm font-bold ml-2">Emergency</Text>
            </TouchableOpacity>

            {rideStatus !== RIDE_STATUS.RIDE_COMPLETED && rideStatus !== RIDE_STATUS.RIDE_STARTED && (
              <TouchableOpacity
                onPress={handleCancelRide}
                className="bg-gray-100 py-3 px-4 flex-row items-center justify-center border border-gray-200"
                style={{ borderRadius: 12 }}
              >
                <Feather name="x" size={16} color="#6b7280" />
                <Text className="text-gray-600 text-sm font-bold ml-2">Cancel Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  )
}

export default TrackRideScreen
