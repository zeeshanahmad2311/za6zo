"use client"

import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import React, { useCallback } from "react"
import { Animated, Dimensions, Text, TouchableOpacity, View } from "react-native"
import { useAnimatedValue } from "../hooks/useAnimatedValue"

const { width: screenWidth } = Dimensions.get("window")

const PremiumQuickActionCard = React.memo(({ action, onPress }) => {
  const scaleValue = useAnimatedValue(1)
  const IconComponent = action.iconLibrary

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start()
  }, [scaleValue])

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }, [scaleValue])

  const handlePress = useCallback(() => {
    onPress(action)
  }, [action, onPress])

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }],
        width: (screenWidth - 72) / 2,
        marginBottom: 16,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={0.9}
        className="relative overflow-hidden border border-gray-200/20"
        style={{ borderRadius: 20 }}
      >
        <LinearGradient
          colors={action.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-5 h-36 justify-between"
        >
          {/* Badge */}
          <View className="absolute top-3 right-3">
            <BlurView
              intensity={20}
              className="bg-white/20 px-2 py-1 border border-white/10"
              style={{ borderRadius: 20 }}
            >
              <Text className="text-white text-xs font-semibold">{action.badge}</Text>
            </BlurView>
          </View>

          {/* Icon */}
          <View
            className="w-12 h-12 bg-white/20 items-center justify-center border border-white/10"
            style={{ borderRadius: 16 }}
          >
            <IconComponent name={action.icon} size={24} color={action.iconColor} />
          </View>

          {/* Content */}
          <View>
            <Text className="text-white text-base font-bold mb-1" numberOfLines={1}>
              {action.title}
            </Text>
            <Text className="text-white/80 text-sm font-medium" numberOfLines={2}>
              {action.description}
            </Text>
          </View>

          {/* Decorative Elements */}
          <View className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
          <View className="absolute -top-2 -left-2 w-8 h-8 bg-white/10 rounded-full" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  )
})

export default PremiumQuickActionCard
