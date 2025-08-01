"use client"

import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import {
    Alert,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

const RateRideScreen = ({ navigation, route }) => {
  const { rideDetails, driver, finalFare } = route.params
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const feedbackTags = [
    "Great Driver",
    "Clean Vehicle",
    "On Time",
    "Safe Driving",
    "Friendly",
    "Professional",
    "Good Route",
    "Comfortable Ride",
  ]

  const handleRatingPress = (selectedRating) => {
    setRating(selectedRating)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleTagPress = (tag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  }

  const handleSubmitRating = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.")
      return
    }

    setIsSubmitting(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      Alert.alert("Thank You! 🎉", "Your feedback has been submitted successfully. It helps us improve our service.", [
        {
          text: "Done",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "PassengerTabs" }],
            })
          },
        },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    Alert.alert("Skip Rating", "Are you sure you want to skip rating this ride?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Skip",
        onPress: () => {
          navigation.reset({
            index: 0,
            routes: [{ name: "PassengerTabs" }],
          })
        },
      },
    ])
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
          <View className="flex-1 items-center">
            <Text className="text-white text-lg font-bold">Rate Your Ride</Text>
            <Text className="text-white/80 text-sm">Help us improve our service</Text>
          </View>

          <TouchableOpacity
            onPress={handleSkip}
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Feather name="x" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Trip Summary */}
        <View className="p-6">
          <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
            <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
              <Text className="text-gray-900 text-xl font-bold mb-4 text-center">Trip Completed! 🎉</Text>

              <View className="items-center mb-4">
                <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-3">
                  <Text className="text-3xl">👨‍💼</Text>
                </View>
                <Text className="text-gray-900 text-lg font-bold">{driver.name}</Text>
                <Text className="text-gray-600 text-sm">{driver.vehicleModel}</Text>
              </View>

              <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <View className="items-center">
                  <FontAwesome5 name="route" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm font-semibold mt-1">{rideDetails.distance.toFixed(1)} km</Text>
                </View>
                <View className="items-center">
                  <MaterialIcons name="access-time" size={16} color="#6b7280" />
                  <Text className="text-gray-600 text-sm font-semibold mt-1">{rideDetails.estimatedTime} min</Text>
                </View>
                <View className="items-center">
                  <FontAwesome5 name="rupee-sign" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-sm font-semibold mt-1">₹{finalFare}</Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Rating Section */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-gray-900 mb-4 text-center">How was your ride?</Text>

          {/* Star Rating */}
          <View className="flex-row justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleRatingPress(star)} className="mx-2" activeOpacity={0.8}>
                <FontAwesome5
                  name="star"
                  size={40}
                  color={star <= rating ? "#fbbf24" : "#d1d5db"}
                  solid={star <= rating}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating Text */}
          {rating > 0 && (
            <Text className="text-center text-gray-600 text-base mb-6">
              {rating === 1 && "Poor - We'll work to improve"}
              {rating === 2 && "Fair - Room for improvement"}
              {rating === 3 && "Good - Thanks for the feedback"}
              {rating === 4 && "Very Good - Great experience!"}
              {rating === 5 && "Excellent - Outstanding service!"}
            </Text>
          )}
        </View>

        {/* Feedback Tags */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">What went well?</Text>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {feedbackTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => handleTagPress(tag)}
                className={`px-4 py-2 border ${
                  selectedTags.includes(tag) ? "bg-indigo-600 border-indigo-700" : "bg-white border-gray-200"
                }`}
                style={{ borderRadius: 20 }}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-sm font-semibold ${selectedTags.includes(tag) ? "text-white" : "text-gray-600"}`}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Written Feedback */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-4">Additional Comments (Optional)</Text>
          <TextInput
            value={feedback}
            onChangeText={setFeedback}
            placeholder="Share your experience with us..."
            multiline
            numberOfLines={4}
            className="bg-white rounded-2xl p-4 border border-gray-200 text-gray-900"
            style={{ textAlignVertical: "top" }}
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-6 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleSubmitRating}
          disabled={isSubmitting || rating === 0}
          className={`py-4 px-6 flex-row items-center justify-center border ${
            isSubmitting || rating === 0 ? "bg-gray-400 border-gray-500" : "bg-indigo-600 border-indigo-700"
          }`}
          style={{ borderRadius: 20 }}
        >
          {isSubmitting ? (
            <>
              <Text className="text-white text-lg font-bold mr-2">Submitting...</Text>
              <MaterialIcons name="hourglass-empty" size={20} color="white" />
            </>
          ) : (
            <>
              <FontAwesome5 name="star" size={18} color="white" />
              <Text className="text-white text-lg font-bold ml-3">Submit Rating</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default RateRideScreen
