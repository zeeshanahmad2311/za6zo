"use client"

import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { Dimensions, Platform, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

// Mock booking history data
const MOCK_BOOKINGS = [
  {
    id: "booking_001",
    date: "2024-01-15",
    time: "14:30",
    from: "Current Location",
    to: "Gulshan-e-Iqbal, Karachi",
    vehicle: "Auto Rickshaw",
    fare: 180,
    status: "completed",
    driver: "Ahmed Khan",
    rating: 4.5,
    distance: 8.5,
  },
  {
    id: "booking_002",
    date: "2024-01-14",
    time: "09:15",
    from: "DHA Phase 2",
    to: "Clifton Beach, Karachi",
    vehicle: "Cab",
    fare: 320,
    status: "completed",
    driver: "Muhammad Ali",
    rating: 5.0,
    distance: 12.3,
  },
  {
    id: "booking_003",
    date: "2024-01-13",
    time: "18:45",
    from: "Saddar",
    to: "North Nazimabad",
    vehicle: "Bike",
    fare: 95,
    status: "cancelled",
    driver: "Hassan Ahmed",
    rating: null,
    distance: 6.2,
  },
  {
    id: "booking_004",
    date: "2024-01-12",
    time: "11:20",
    from: "Korangi",
    to: "Malir Cantonment",
    vehicle: "Auto Rickshaw",
    fare: 150,
    status: "completed",
    driver: "Tariq Mahmood",
    rating: 4.2,
    distance: 7.8,
  },
]

const BookingHistoryScreen = ({ navigation }) => {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#10b981"
      case "cancelled":
        return "#ef4444"
      case "ongoing":
        return "#3b82f6"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      case "ongoing":
        return "Ongoing"
      default:
        return "Unknown"
    }
  }

  const getVehicleIcon = (vehicle) => {
    switch (vehicle.toLowerCase()) {
      case "auto rickshaw":
        return "🛺"
      case "cab":
        return "🚗"
      case "bike":
        return "🏍️"
      case "premium car":
        return "🚙"
      default:
        return "🚗"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (selectedFilter === "all") return true
    return booking.status === selectedFilter
  })

  const totalSpent = bookings.filter((b) => b.status === "completed").reduce((sum, booking) => sum + booking.fare, 0)

  const totalRides = bookings.filter((b) => b.status === "completed").length

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

          <Text className="text-white text-lg font-bold flex-1">Booking History</Text>

          <TouchableOpacity
            onPress={() => console.log("Export history")}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Feather name="download" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} />}
      >
        {/* Stats Cards */}
        <View className="p-6">
          <View className="flex-row" style={{ gap: 12 }}>
            <View className="flex-1">
              <BlurView intensity={80} style={{ borderRadius: 16 }} className="overflow-hidden border border-gray-200">
                <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-4">
                  <View className="items-center">
                    <FontAwesome5 name="car" size={20} color="#4f46e5" />
                    <Text className="text-gray-900 text-xl font-bold mt-2">{totalRides}</Text>
                    <Text className="text-gray-600 text-sm">Total Rides</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>

            <View className="flex-1">
              <BlurView intensity={80} style={{ borderRadius: 16 }} className="overflow-hidden border border-gray-200">
                <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-4">
                  <View className="items-center">
                    <FontAwesome5 name="rupee-sign" size={20} color="#10b981" />
                    <Text className="text-gray-900 text-xl font-bold mt-2">₹{totalSpent}</Text>
                    <Text className="text-gray-600 text-sm">Total Spent</Text>
                  </View>
                </LinearGradient>
              </BlurView>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 mb-4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row" style={{ gap: 12 }}>
              {[
                { key: "all", label: "All" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  className={`px-4 py-2 border ${
                    selectedFilter === filter.key ? "bg-indigo-600 border-indigo-700" : "bg-white border-gray-200"
                  }`}
                  style={{ borderRadius: 20 }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedFilter === filter.key ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Booking List */}
        <View className="px-6 pb-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                onPress={() =>
                  navigation.navigate("BookingDetailsScreen", {
                    booking,
                  })
                }
                className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm"
                activeOpacity={0.8}
              >
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Text className="text-2xl mr-3">{getVehicleIcon(booking.vehicle)}</Text>
                      <View className="flex-1">
                        <Text className="text-gray-900 text-base font-bold">{booking.vehicle}</Text>
                        <Text className="text-gray-500 text-sm">
                          {booking.date} • {booking.time}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-gray-900 text-lg font-bold">₹{booking.fare}</Text>
                    <View
                      className="px-2 py-1 mt-1"
                      style={{
                        backgroundColor: `${getStatusColor(booking.status)}15`,
                        borderRadius: 12,
                      }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: getStatusColor(booking.status) }}>
                        {getStatusText(booking.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Route */}
                <View className="mb-3">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
                    <Text className="text-gray-900 text-sm font-semibold flex-1" numberOfLines={1}>
                      {booking.from}
                    </Text>
                  </View>
                  <View className="ml-1.5 w-0.5 h-4 bg-gray-300" />
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-red-500 rounded-full mr-3" />
                    <Text className="text-gray-900 text-sm font-semibold flex-1" numberOfLines={1}>
                      {booking.to}
                    </Text>
                  </View>
                </View>

                {/* Bottom Info */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <MaterialIcons name="person" size={16} color="#6b7280" />
                    <Text className="text-gray-600 text-sm ml-1">{booking.driver}</Text>
                  </View>

                  <View className="flex-row items-center">
                    <FontAwesome5 name="route" size={12} color="#6b7280" />
                    <Text className="text-gray-600 text-sm ml-1">{booking.distance} km</Text>
                  </View>

                  {booking.rating && (
                    <View className="flex-row items-center">
                      <FontAwesome5 name="star" size={12} color="#fbbf24" solid />
                      <Text className="text-gray-600 text-sm ml-1">{booking.rating}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-12">
              <Text className="text-4xl mb-4">📋</Text>
              <Text className="text-gray-500 text-lg font-bold mb-2">No bookings found</Text>
              <Text className="text-gray-400 text-sm text-center">
                {selectedFilter === "all" ? "You haven't made any bookings yet" : `No ${selectedFilter} bookings found`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default BookingHistoryScreen
