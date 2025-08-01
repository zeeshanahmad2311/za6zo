"use client"

import * as Haptics from "expo-haptics"
import { useCallback, useState } from "react"
import { Alert, RefreshControl, ScrollView, View } from "react-native"

// Components
import PremiumHeader from "../../../components/passenger/PremiumHeader"
import GreetingSection from "./components/GreetingSection"
import PremiumBookingCard from "./components/PremiumBookingCard"
import PremiumOffersSection from "./components/PremiumOffersSection"
import QuickActionsSection from "./components/QuickActionsSection"
import SearchBar from "./components/SearchBar"

// Hooks
import { useLocationPermission } from "./hooks/useLocationPermission"

export default function PassengerHome({ navigation, route }) {
  const [refreshing, setRefreshing] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [userName, setUserName] = useState("Alex Johnson")
  const { hasPermission, currentLocation } = useLocationPermission()

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (error) {
      console.error("Refresh error:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Quick action handler
  const handleQuickActionPress = useCallback(
    (action) => {
      try {
        console.log(`Quick action pressed: ${action.analytics}`)
        if (navigation && action.route) {
          navigation.navigate(action.route)
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      } catch (error) {
        console.error("Quick action error:", error)
      }
    },
    [navigation],
  )

  // Premium offer handler
  const handlePremiumOfferPress = useCallback((offer) => {
    try {
      console.log(`Premium offer pressed: ${offer.analytics}`)
      Alert.alert(offer.title, `${offer.subtitle}\n\n${offer.details}`, [
        { text: "Maybe Later", style: "cancel" },
        {
          text: "Claim Offer",
          onPress: () => {
            console.log(`Claiming offer: ${offer.id}`)
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          },
        },
      ])
    } catch (error) {
      console.error("Premium offer error:", error)
    }
  }, [])

  // Header handlers
  const handleNotificationPress = useCallback(() => {
    try {
      console.log("Notifications pressed")
      if (navigation) {
        navigation.navigate("Notifications")
      }
      setNotificationCount(0)
    } catch (error) {
      console.error("Notification error:", error)
    }
  }, [navigation])

  const handleProfilePress = useCallback(() => {
    try {
      console.log("Profile pressed")
      if (navigation) {
        navigation.navigate("Profile")
      }
    } catch (error) {
      console.error("Profile press error:", error)
    }
  }, [navigation])

  const handleMenuPress = useCallback(() => {
    try {
      console.log("Menu pressed")
      if (navigation) {
        navigation.openDrawer?.() || navigation.navigate("Menu")
      }
    } catch (error) {
      console.error("Menu press error:", error)
    }
  }, [navigation])

  // Booking handlers
  const handlePickupPress = useCallback(() => {
    try {
      console.log("Pickup location pressed")
      if (navigation) {
        navigation.navigate("LocationSearch")
      }
    } catch (error) {
      console.error("Pickup press error:", error)
    }
  }, [navigation])

  const handleDestinationPress = useCallback(() => {
    try {
      console.log("Destination pressed")
      if (navigation) {
        navigation.navigate("LocationSearch")
      }
    } catch (error) {
      console.error("Destination press error:", error)
    }
  }, [navigation])

  const handleSearchPress = useCallback(() => {
    try {
      console.log("Search pressed")
      if (navigation) {
        navigation.navigate("LocationSearch")
      }
    } catch (error) {
      console.error("Search press error:", error)
    }
  }, [navigation])

  return (
    <View className="flex-1 bg-gray-50">
      <PremiumHeader
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
        onMenuPress={handleMenuPress}
        notificationCount={notificationCount}
        userAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        isOnline={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4f46e5"]} tintColor="#4f46e5" />
        }
      >
        {/* Greeting Section */}
        <View className="mt-6">
          <GreetingSection userName={userName} />
        </View>

        {/* Search Bar - Now navigates to LocationSearchScreen */}
        <SearchBar navigation={navigation} onPress={handleSearchPress} />

        {/* Premium Booking Card */}
        <PremiumBookingCard
          onPickupPress={handlePickupPress}
          onDestinationPress={handleDestinationPress}
          currentLocation={currentLocation}
        />

        {/* Quick Actions */}
        <QuickActionsSection onQuickActionPress={handleQuickActionPress} navigation={navigation} />

        {/* Premium Offers */}
        <PremiumOffersSection onPremiumOfferPress={handlePremiumOfferPress} />
      </ScrollView>
    </View>
  )
}
