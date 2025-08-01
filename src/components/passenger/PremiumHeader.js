"use client"

import { MaterialIcons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useCallback, useEffect, useState } from "react"
import { Animated, Dimensions, Image, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

const PremiumHeader = ({
  onNotificationPress,
  onProfilePress,
  onMenuPress,
  notificationCount = 0,
  userAvatar = null,
  isOnline = true,
}) => {
  const [notificationAnimation] = useState(new Animated.Value(1))

  // Animate notification badge when count changes
  useEffect(() => {
    if (notificationCount > 0) {
      Animated.sequence([
        Animated.timing(notificationAnimation, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(notificationAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [notificationCount])

  const handleNotificationPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onNotificationPress?.()
  }, [onNotificationPress])

  const handleProfilePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onProfilePress?.()
  }, [onProfilePress])

  const handleMenuPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onMenuPress?.()
  }, [onMenuPress])

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Minimal Header Container */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row items-center justify-between">
          {/* Menu Button */}
     

          {/* Logo Container */}
          <View className="flex-1 items-start">
            <View className="bg-white/15 rounded-2xl px-8 py-3 border border-white/20">
              <Image
                source={require("../../assets/images/Za6zo.png")}
                style={{
                  width: 80,
                  height: 32,
                  tintColor: "white",
                }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Right Actions */}
          <View className="flex-row items-center gap-3 space-x-3">
            {/* Notification Button */}
            <TouchableOpacity
              onPress={handleNotificationPress}
              className="relative w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              activeOpacity={0.7}
            >
              <MaterialIcons name="notifications-none" size={22} color="white" />
              {notificationCount > 0 && (
                <Animated.View
                  style={{
                    transform: [{ scale: notificationAnimation }],
                  }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full items-center justify-center border-2 border-white"
                >
                  <Text className="text-white text-xs font-bold">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </Text>
                </Animated.View>
              )}
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity onPress={handleProfilePress} className="relative" activeOpacity={0.8}>
              <View className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden">
                {userAvatar ? (
                  <Image source={{ uri: userAvatar }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <MaterialIcons name="person" size={20} color="white" />
                  </View>
                )}
              </View>

              {/* Online Status Indicator */}
              {isOnline && (
                <View className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  )
}

export default PremiumHeader
