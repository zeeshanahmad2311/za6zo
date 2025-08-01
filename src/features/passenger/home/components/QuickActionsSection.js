import { Feather } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import React from "react"
import { Alert, Text, TouchableOpacity, View } from "react-native"
import { QUICK_ACTIONS } from "../constants"
import PremiumQuickActionCard from "./PremiumQuickActionCard"

const QuickActionsSection = React.memo(({ onQuickActionPress, navigation }) => {
  const handleQuickActionPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    switch (action.id) {
      case "nearby-rides":
        // Show nearby available rides
        Alert.alert("🚗 Nearby Rides", "12 auto rickshaws available within 2km radius. Book now for instant pickup!", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Find Rides",
            onPress: () => navigation?.navigate("LocationSearch"),
          },
        ])
        break

      case "schedule":
        // Schedule a ride for later
        Alert.alert("⏰ Schedule Ride", "Plan your journey in advance. Choose date and time for your pickup.", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Schedule Now",
            onPress: () => showScheduleOptions(navigation),
          },
        ])
        break

      case "favorites":
        // Show saved places
        Alert.alert(
          "❤️ Saved Places",
          "Quick access to your favorite destinations:\n• Home\n• Office\n• Gym\n• Shopping Mall\n• Airport",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View All",
              onPress: () => showSavedPlaces(navigation),
            },
          ],
        )
        break

      case "support":
        // Show support options
        Alert.alert("🎧 24/7 Support", "How can we help you today?", [
          { text: "Cancel", style: "cancel" },
          { text: "Live Chat", onPress: () => startLiveChat() },
          { text: "Call Support", onPress: () => callSupport() },
          { text: "FAQ", onPress: () => showFAQ(navigation) },
        ])
        break

      default:
        // Fallback for any other actions
        if (onQuickActionPress) {
          onQuickActionPress(action)
        }
    }
  }

  return (
    <View className="px-6 mb-8">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-gray-900">Quick Actions</Text>
        <TouchableOpacity className="flex-row items-center" onPress={() => showAllQuickActions(navigation)}>
          <Text className="text-indigo-600 text-sm font-semibold mr-1">View All</Text>
          <Feather name="chevron-right" size={16} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Fixed Grid Layout - 2 columns with proper gap */}
      <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
        {QUICK_ACTIONS.map((action) => (
          <PremiumQuickActionCard key={action.id} action={action} onPress={handleQuickActionPress} />
        ))}
      </View>
    </View>
  )
})

// Helper functions for different quick actions
const showScheduleOptions = (navigation) => {
  const scheduleOptions = ["In 30 minutes", "In 1 hour", "In 2 hours", "Tomorrow morning", "Custom time"]

  Alert.alert(
    "When do you want to travel?",
    "Choose your preferred pickup time:",
    scheduleOptions
      .map((option) => ({
        text: option,
        onPress: () => {
          if (option === "Custom time") {
            // Navigate to custom schedule screen
            navigation?.navigate("ScheduleRideScreen")
          } else {
            Alert.alert("Scheduled! ✅", `Your ride has been scheduled for ${option.toLowerCase()}`)
          }
        },
      }))
      .concat([{ text: "Cancel", style: "cancel" }]),
  )
}

const showSavedPlaces = (navigation) => {
  const savedPlaces = [
    { name: "🏠 Home", address: "DHA Phase 2, Karachi" },
    { name: "🏢 Office", address: "Clifton Block 4, Karachi" },
    { name: "🏋️ Gym", address: "Gulshan-e-Iqbal, Karachi" },
    { name: "🛒 Mall", address: "Dolmen Mall, Karachi" },
    { name: "✈️ Airport", address: "Jinnah International Airport" },
  ]

  Alert.alert(
    "Choose Destination",
    "Select from your saved places:",
    savedPlaces
      .map((place) => ({
        text: place.name,
        onPress: () => {
          // Navigate to booking with pre-selected destination
          navigation?.navigate("LocationSearch", {
            preSelected: place,
          })
        },
      }))
      .concat([
        { text: "Add New Place", onPress: () => navigation?.navigate("LocationSearch") },
        { text: "Cancel", style: "cancel" },
      ]),
  )
}

const startLiveChat = () => {
  Alert.alert(
    "Live Chat Started! 💬",
    "You'll be connected with our support team shortly. Average wait time: 2 minutes",
    [{ text: "OK" }],
  )
}

const callSupport = () => {
  Alert.alert("Call Support", "Call our 24/7 support hotline?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Call Now",
      onPress: () => {
        // In a real app, you'd use Linking.openURL('tel:+92-XXX-XXXXXXX')
        Alert.alert("Calling...", "Connecting to +92-300-SUPPORT")
      },
    },
  ])
}

const showFAQ = (navigation) => {
  Alert.alert("Frequently Asked Questions", "Choose a topic:", [
    { text: "How to book a ride?", onPress: () => showFAQAnswer("booking") },
    { text: "Payment methods", onPress: () => showFAQAnswer("payment") },
    { text: "Cancellation policy", onPress: () => showFAQAnswer("cancellation") },
    { text: "Safety features", onPress: () => showFAQAnswer("safety") },
    { text: "View All FAQs", onPress: () => navigation?.navigate("FAQScreen") },
    { text: "Cancel", style: "cancel" },
  ])
}

const showFAQAnswer = (topic) => {
  const answers = {
    booking:
      "To book a ride:\n1. Enter your destination\n2. Choose vehicle type\n3. Confirm pickup location\n4. Track your driver in real-time",
    payment: "We accept:\n• Cash payments\n• JazzCash\n• EasyPaisa\n• Credit/Debit cards\n• Bank transfers",
    cancellation:
      "Free cancellation within 2 minutes of booking. After that, a small fee may apply based on driver's location.",
    safety:
      "Your safety is our priority:\n• All drivers are verified\n• Real-time GPS tracking\n• Emergency button\n• 24/7 support",
  }

  Alert.alert("FAQ Answer", answers[topic] || "Information not available", [{ text: "Got it!" }])
}

const showAllQuickActions = (navigation) => {
  Alert.alert("All Quick Actions", "More actions coming soon! What would you like to see?", [
    { text: "Ride History", onPress: () => navigation?.navigate("BookingHistory") },
    {
      text: "Wallet & Payments",
      onPress: () => Alert.alert("Coming Soon!", "Wallet feature will be available in next update"),
    },
    {
      text: "Refer Friends",
      onPress: () => Alert.alert("Refer & Earn", "Invite friends and earn ₹100 for each successful referral!"),
    },
    { text: "Cancel", style: "cancel" },
  ])
}

export default QuickActionsSection
