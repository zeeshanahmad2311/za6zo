"use client"

import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { Alert, Dimensions, Platform, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

// Vehicle types configuration
const VEHICLE_TYPES = [
  {
    id: "auto",
    name: "Auto Rickshaw",
    icon: "🛺",
    basePrice: 12,
    pricePerKm: 12,
    capacity: "3 passengers",
    eta: "2-5 min",
    description: "Affordable and quick",
    features: ["AC Available", "Shared Ride", "Budget Friendly"],
  },
  {
    id: "cab",
    name: "Cab",
    icon: "🚗",
    basePrice: 25,
    pricePerKm: 18,
    capacity: "4 passengers",
    eta: "5-8 min",
    description: "Comfortable ride",
    features: ["Air Conditioned", "Private", "Comfortable"],
  },
  {
    id: "bike",
    name: "Bike",
    icon: "🏍️",
    basePrice: 8,
    pricePerKm: 8,
    capacity: "1 passenger",
    eta: "1-3 min",
    description: "Fastest option",
    features: ["Quick", "Traffic Friendly", "Solo Ride"],
  },
  {
    id: "premium",
    name: "Premium Car",
    icon: "🚙",
    basePrice: 40,
    pricePerKm: 25,
    capacity: "4 passengers",
    eta: "8-12 min",
    description: "Luxury experience",
    features: ["Luxury", "Professional Driver", "Premium Service"],
  },
]

const BookRideScreen = ({ navigation, route }) => {
  const { pickup, destination, destinationName, distance, estimatedTime } = route.params
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TYPES[0])
  const [isBooking, setIsBooking] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash")

  const calculatePrice = (vehicle, distance) => {
    return Math.round(vehicle.basePrice + vehicle.pricePerKm * distance)
  }

  const calculateSavings = (currentVehicle, distance) => {
    const premiumPrice = calculatePrice(VEHICLE_TYPES[3], distance) // Premium car price
    const currentPrice = calculatePrice(currentVehicle, distance)
    return premiumPrice - currentPrice
  }

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleBookRide = async () => {
    setIsBooking(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      // Simulate booking process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Create booking data
      const bookingData = {
        id: `booking_${Date.now()}`,
        vehicle: selectedVehicle,
        pickup,
        destination,
        destinationName,
        distance,
        estimatedTime,
        price: calculatePrice(selectedVehicle, distance),
        paymentMethod: selectedPaymentMethod,
        bookingTime: new Date().toISOString(),
        status: "confirmed",
      }

      Alert.alert("Ride Booked Successfully!", `Your ${selectedVehicle.name} will arrive in ${selectedVehicle.eta}`, [
        {
          text: "Track Ride",
          onPress: () => {
            navigation.navigate("TrackRideScreen", {
              rideDetails: bookingData,
            })
          },
        },
      ])
    } catch (error) {
      Alert.alert("Booking Failed", "Please try again")
    } finally {
      setIsBooking(false)
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
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-4"
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold flex-1">Book Your Ride</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("BookingHistory")}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name="history" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Trip Details */}
        <View className="p-6">
          <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
            <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
              <Text className="text-gray-900 text-xl font-bold mb-4">Trip Details</Text>

              <View className="space-y-4">
                {/* Pickup */}
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 bg-green-100 items-center justify-center mr-4 border border-green-200"
                    style={{ borderRadius: 20 }}
                  >
                    <MaterialIcons name="my-location" size={20} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold tracking-wider">PICKUP</Text>
                    <Text className="text-gray-900 text-base font-bold">Current Location</Text>
                  </View>
                </View>

                {/* Destination */}
                <View className="flex-row items-center">
                  <View
                    className="w-10 h-10 bg-red-100 items-center justify-center mr-4 border border-red-200"
                    style={{ borderRadius: 20 }}
                  >
                    <MaterialIcons name="place" size={20} color="#dc2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-xs font-semibold tracking-wider">DESTINATION</Text>
                    <Text className="text-gray-900 text-base font-bold">{destinationName}</Text>
                  </View>
                </View>
              </View>

              {/* Trip Stats */}
              <View className="flex-row items-center justify-between mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="items-center">
                  <FontAwesome5 name="route" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm font-semibold mt-1">{distance.toFixed(1)} km</Text>
                </View>
                <View className="items-center">
                  <MaterialIcons name="access-time" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm font-semibold mt-1">~{estimatedTime} min</Text>
                </View>
                <View className="items-center">
                  <FontAwesome5 name="rupee-sign" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-sm font-semibold mt-1">
                    ₹{calculatePrice(selectedVehicle, distance)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Vehicle Selection */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Choose Vehicle</Text>

          {VEHICLE_TYPES.map((vehicle) => {
            const price = calculatePrice(vehicle, distance)
            const savings = calculateSavings(vehicle, distance)

            return (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => handleVehicleSelect(vehicle)}
                className={`bg-white rounded-2xl p-4 mb-3 border-2 ${
                  selectedVehicle.id === vehicle.id ? "border-indigo-500" : "border-gray-100"
                } shadow-sm`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <View className="mr-4">
                    <Text style={{ fontSize: 32 }}>{vehicle.icon}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-gray-900 text-lg font-bold">{vehicle.name}</Text>
                      <View className="items-end">
                        <Text className="text-indigo-600 text-lg font-bold">₹{price}</Text>
                        {savings > 0 && <Text className="text-green-600 text-xs font-semibold">Save ₹{savings}</Text>}
                      </View>
                    </View>

                    <Text className="text-gray-500 text-sm mb-2">{vehicle.description}</Text>

                    {/* Features */}
                    <View className="flex-row flex-wrap mb-2">
                      {vehicle.features.slice(0, 2).map((feature, index) => (
                        <View key={index} className="bg-gray-100 px-2 py-1 rounded-full mr-2 mb-1">
                          <Text className="text-gray-600 text-xs font-semibold">{feature}</Text>
                        </View>
                      ))}
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-400 text-xs">{vehicle.capacity}</Text>
                      <View className="flex-row items-center">
                        <MaterialIcons name="access-time" size={12} color="#6b7280" />
                        <Text className="text-gray-400 text-xs ml-1">ETA: {vehicle.eta}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedVehicle.id === vehicle.id && (
                    <View className="ml-3">
                      <View className="w-6 h-6 bg-indigo-600 rounded-full items-center justify-center">
                        <Feather name="check" size={14} color="white" />
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Payment Method */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4">Payment Method</Text>

          {/* Cash Payment */}
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod("cash")}
            className={`bg-white rounded-2xl p-4 border-2 ${
              selectedPaymentMethod === "cash" ? "border-green-500" : "border-gray-100"
            } shadow-sm mb-3`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 bg-green-100 items-center justify-center mr-4 border border-green-200"
                style={{ borderRadius: 20 }}
              >
                <FontAwesome5 name="money-bill-wave" size={20} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-bold mb-1">Cash Payment</Text>
                <Text className="text-gray-500 text-sm">Pay directly to driver</Text>
              </View>
              {selectedPaymentMethod === "cash" && (
                <View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center">
                  <Feather name="check" size={14} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Digital Payment */}
          <TouchableOpacity
            onPress={() => setSelectedPaymentMethod("digital")}
            className={`bg-white rounded-2xl p-4 border-2 ${
              selectedPaymentMethod === "digital" ? "border-blue-500" : "border-gray-100"
            } shadow-sm`}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 bg-blue-100 items-center justify-center mr-4 border border-blue-200"
                style={{ borderRadius: 20 }}
              >
                <MaterialIcons name="payment" size={20} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 text-base font-bold mb-1">Digital Payment</Text>
                <Text className="text-gray-500 text-sm">JazzCash, EasyPaisa, Card</Text>
              </View>
              {selectedPaymentMethod === "digital" && (
                <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                  <Feather name="check" size={14} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Booking Summary */}
        <View className="px-6 mb-8">
          <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
            <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
              <Text className="text-gray-900 text-lg font-bold mb-4">Booking Summary</Text>

              <View className="space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 text-sm">Base Fare</Text>
                  <Text className="text-gray-900 text-sm font-semibold">₹{selectedVehicle.basePrice}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600 text-sm">Distance ({distance.toFixed(1)} km)</Text>
                  <Text className="text-gray-900 text-sm font-semibold">
                    ₹{Math.round(selectedVehicle.pricePerKm * distance)}
                  </Text>
                </View>
                <View className="border-t border-gray-200 pt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-900 text-base font-bold">Total Fare</Text>
                    <Text className="text-indigo-600 text-lg font-bold">
                      ₹{calculatePrice(selectedVehicle, distance)}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View className="p-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleBookRide}
          disabled={isBooking}
          className={`py-4 px-6 flex-row items-center justify-center border ${
            isBooking ? "bg-gray-400 border-gray-500" : "bg-indigo-600 border-indigo-700"
          }`}
          style={{ borderRadius: 20 }}
        >
          {isBooking ? (
            <>
              <Text className="text-white text-lg font-bold mr-2">Booking...</Text>
              <MaterialIcons name="hourglass-empty" size={20} color="white" />
            </>
          ) : (
            <>
              <FontAwesome5 name="car" size={18} color="white" />
              <Text className="text-white text-lg font-bold ml-3">
                Book {selectedVehicle.name} - ₹{calculatePrice(selectedVehicle, distance)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default BookRideScreen
