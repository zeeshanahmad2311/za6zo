"use client"

import { Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { Dimensions, Platform, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

// Mock notifications data
const MOCK_NOTIFICATIONS = [
  {
    id: "notif_001",
    type: "ride_completed",
    title: "Ride Completed",
    message: "Your ride to Gulshan-e-Iqbal has been completed. Rate your driver!",
    time: "2 min ago",
    read: false,
    icon: "check-circle",
    color: "#10b981",
  },
  {
    id: "notif_002",
    type: "driver_assigned",
    title: "Driver Assigned",
    message: "Ahmed Khan is on the way to pick you up. ETA: 5 minutes",
    time: "15 min ago",
    read: false,
    icon: "car",
    color: "#3b82f6",
  },
  {
    id: "notif_003",
    type: "promotion",
    title: "Special Offer! 🎉",
    message: "Get 50% off on your next 3 rides. Use code SAVE50",
    time: "1 hour ago",
    read: true,
    icon: "gift",
    color: "#f59e0b",
  },
  {
    id: "notif_004",
    type: "payment",
    title: "Payment Successful",
    message: "₹180 paid for your ride to DHA Phase 2",
    time: "2 hours ago",
    read: true,
    icon: "credit-card",
    color: "#10b981",
  },
  {
    id: "notif_005",
    type: "system",
    title: "App Update Available",
    message: "Update to the latest version for better performance and new features",
    time: "1 day ago",
    read: true,
    icon: "download",
    color: "#6b7280",
  },
]

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const markAsRead = (notificationId) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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
          <View>
            <Text className="text-white text-xl font-bold">Notifications</Text>
            <Text className="text-white/80 text-sm">
              {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up!"}
            </Text>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="bg-white/20 px-4 py-2 border border-white/30"
              style={{ borderRadius: 20 }}
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-semibold">Mark All Read</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} />}
      >
        {/* Notifications List */}
        <View className="p-6">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => {
                  markAsRead(notification.id)
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                  // Handle notification tap based on type
                  if (notification.type === "ride_completed") {
                    // Navigate to ride history or rating screen
                  } else if (notification.type === "driver_assigned") {
                    // Navigate to tracking screen
                  }
                }}
                className={`bg-white rounded-2xl p-4 mb-4 border shadow-sm ${
                  notification.read ? "border-gray-100" : "border-indigo-200"
                }`}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start">
                  <View
                    className="w-12 h-12 items-center justify-center mr-4 border"
                    style={{
                      backgroundColor: `${notification.color}15`,
                      borderColor: `${notification.color}30`,
                      borderRadius: 20,
                    }}
                  >
                    <Feather name={notification.icon} size={20} color={notification.color} />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-gray-900 text-base font-bold flex-1">{notification.title}</Text>
                      {!notification.read && <View className="w-2 h-2 bg-indigo-600 rounded-full ml-2" />}
                    </View>

                    <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                      {notification.message}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-400 text-xs">{notification.time}</Text>
                      {notification.type === "promotion" && (
                        <View className="bg-yellow-100 px-2 py-1 border border-yellow-200" style={{ borderRadius: 12 }}>
                          <Text className="text-yellow-800 text-xs font-semibold">Offer</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center py-12">
              <Text className="text-4xl mb-4">🔔</Text>
              <Text className="text-gray-500 text-lg font-bold mb-2">No notifications</Text>
              <Text className="text-gray-400 text-sm text-center">
                You're all caught up! New notifications will appear here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default NotificationsScreen
