import { Feather } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { Dimensions, Text, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

const EnhancedPremiumOfferCard = React.memo(({ offer, onPress }) => {
  const IconComponent = offer.iconLibrary

  return (
    <TouchableOpacity
      onPress={() => onPress(offer)}
      activeOpacity={0.9}
      className="mr-4 overflow-hidden border border-gray-200/20"
      style={{
        width: screenWidth * 0.75,
        height: 200,
        borderRadius: 20,
      }}
    >
      <LinearGradient
        colors={offer.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 h-full justify-between relative"
      >
        {/* Popularity Badge */}
        <View className="absolute top-4 right-4">
          <BlurView
            intensity={20}
            className="bg-white/20 px-3 py-1 border border-white/10"
            style={{ borderRadius: 20 }}
          >
            <Text className="text-white text-xs font-bold">{offer.popularity}</Text>
          </BlurView>
        </View>

        {/* Header */}
        <View>
          <View className="flex-row items-center mb-3">
            <View
              className="w-10 h-10 bg-white/20 items-center justify-center mr-3 border border-white/10"
              style={{ borderRadius: 16 }}
            >
              <IconComponent name={offer.icon} size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-xs font-bold tracking-wider">{offer.badgeText}</Text>
              <Text className="text-white text-lg font-bold mt-1" numberOfLines={1}>
                {offer.title}
              </Text>
            </View>
          </View>

          {/* Content */}
          <Text className="text-white/90 text-sm font-semibold mb-2" numberOfLines={1}>
            {offer.subtitle}
          </Text>
          <Text className="text-white/70 text-xs mb-3" numberOfLines={1}>
            {offer.details}
          </Text>
        </View>

        {/* Bottom Section */}
        <View>
          {/* Price Section (if available) */}
          {offer.originalPrice && (
            <View className="flex-row items-center mb-3">
              <Text className="text-white/60 text-sm line-through mr-2">{offer.originalPrice}</Text>
              <Text className="text-white text-lg font-bold">{offer.discountedPrice}</Text>
              <View className="bg-white/20 px-2 py-1 ml-2 border border-white/10" style={{ borderRadius: 20 }}>
                <Text className="text-white text-xs font-bold">SAVE 50%</Text>
              </View>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            className="bg-white/20 py-2.5 px-4 flex-row items-center justify-center border border-white/10"
            style={{ borderRadius: 16 }}
          >
            <Text className="text-white font-bold mr-2">Claim Now</Text>
            <Feather name="arrow-right" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Decorative Elements */}
        <View className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full" />
        <View className="absolute -top-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
      </LinearGradient>
    </TouchableOpacity>
  )
})

export default EnhancedPremiumOfferCard
