// src/features/passenger/home/components/QuickActionsSection.js

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSchedule } from "../../../../contexts/ScheduleContext";
import { QUICK_ACTIONS } from "../constants";
import PremiumQuickActionCard from "./PremiumQuickActionCard";

const QuickActionsSection = React.memo(({ onQuickActionPress, navigation }) => {
  const { scheduledRides } = useSchedule();

  const handleQuickActionPress = (action) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    switch (action.id) {
      case "nearby-rides":
        Alert.alert("🚗 Nearby Rides", "12 auto rickshaws available within 2km radius. Book now for instant pickup!", [
          { text: "Cancel", style: "cancel" },
          { text: "Find Rides", onPress: () => navigation?.navigate("LocationSearch") },
        ]);
        break;

      case "schedule":
        if (scheduledRides.length > 0) {
          showScheduledRidesOptions();
        } else {
          navigation?.navigate("ScheduleRide");
        }
        break;

      case "favorites":
        showSavedPlaces(navigation);
        break;

      case "support":
        showSupportOptions(navigation);
        break;

      default:
        if (onQuickActionPress) onQuickActionPress(action);
    }
  };

  const showScheduledRidesOptions = () => {
    const options = [
      ...scheduledRides.slice(0, 3).map((ride) => ({
        text: `${ride.destination} - ${new Date(ride.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        onPress: () =>
          navigation.navigate("BookRide", {
            scheduledTime: ride.date,
            pickup: ride.pickup,
            destination: ride.destination,
          }),
      })),
      {
        text: "➕ Schedule New Ride",
        onPress: () => navigation.navigate("ScheduleRide"),
      },
      {
        text: "📅 View All Scheduled",
        onPress: () => navigation.navigate("ScheduleRide"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options.map((opt) => opt.text),
          cancelButtonIndex: options.length - 1,
        },
        (buttonIndex) => {
          const selected = options[buttonIndex];
          if (selected?.onPress) selected.onPress();
        }
      );
    } else {
      Alert.alert(
        "Scheduled Rides",
        `You have ${scheduledRides.length} upcoming rides.`,
        options
      );
    }
  };

  const showSavedPlaces = (navigation) => {
    const savedPlaces = [
      { name: "🏠 Home", address: "DHA Phase 2, Karachi" },
      { name: "🏢 Office", address: "Clifton Block 4, Karachi" },
      { name: "🏋️ Gym", address: "Gulshan-e-Iqbal, Karachi" },
      { name: "🛒 Mall", address: "Dolmen Mall, Karachi" },
      { name: "✈️ Airport", address: "Jinnah International Airport" },
    ];

    Alert.alert(
      "❤️ Saved Places",
      "Choose your destination:",
      [
        ...savedPlaces.map((place) => ({
          text: `${place.name} (${place.address})`,
          onPress: () =>
            navigation?.navigate("LocationSearch", {
              preSelected: place,
            }),
        })),
        { text: "Add New Place", onPress: () => navigation?.navigate("LocationSearch") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const showSupportOptions = (navigation) => {
    Alert.alert("🎧 24/7 Support", "How can we assist you?", [
      { text: "Live Chat", onPress: () => startLiveChat() },
      { text: "Call Support", onPress: () => callSupport() },
      { text: "FAQs", onPress: () => showFAQ(navigation) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const startLiveChat = () => {
    Alert.alert("💬 Chat Support", "Connecting to a support agent...");
  };

  const callSupport = () => {
    Alert.alert("📞 Call Support", "Dialing +92-300-SUPPORT...");
  };

  const showFAQ = (navigation) => {
    Alert.alert("❓ FAQs", "Choose a topic:", [
      { text: "Booking", onPress: () => showFAQAnswer("booking") },
      { text: "Payments", onPress: () => showFAQAnswer("payment") },
      { text: "Cancellations", onPress: () => showFAQAnswer("cancellation") },
      { text: "Safety", onPress: () => showFAQAnswer("safety") },
      { text: "View All", onPress: () => navigation?.navigate("FAQScreen") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showFAQAnswer = (topic) => {
    const answers = {
      booking:
        "To book a ride:\n1. Enter destination\n2. Confirm pickup\n3. Select vehicle\n4. Book & Track",
      payment:
        "We accept Cash, JazzCash, EasyPaisa, Cards & Bank Transfers.",
      cancellation:
        "Free within 2 minutes. A small fee may apply afterward.",
      safety:
        "Verified drivers, real-time tracking, emergency support, and 24/7 help.",
    };

    Alert.alert("📘 FAQ", answers[topic] || "Details not available.");
  };

  const showAllQuickActions = (navigation) => {
    Alert.alert("🚀 More Features", "Explore additional tools:", [
      { text: "Ride History", onPress: () => navigation?.navigate("BookingHistory") },
      {
        text: "Wallet & Payments",
        onPress: () => Alert.alert("Coming Soon!", "Wallet features in next update"),
      },
      {
        text: "Refer Friends",
        onPress: () =>
          Alert.alert("Refer & Earn", "Earn ₹100 per successful referral!"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View className="px-6 mb-8">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-xl font-bold text-gray-900">Quick Actions</Text>
        <TouchableOpacity className="flex-row items-center" onPress={() => showAllQuickActions(navigation)}>
          <Text className="text-indigo-600 text-sm font-semibold mr-1">View All</Text>
          <Feather name="chevron-right" size={16} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap justify-between" style={{ gap: 12 }}>
        {QUICK_ACTIONS.map((action) => (
          <PremiumQuickActionCard key={action.id} action={action} onPress={handleQuickActionPress} />
        ))}
      </View>
    </View>
  );
});

export default QuickActionsSection;
