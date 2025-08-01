import React from "react"
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { PREMIUM_OFFERS } from "../constants"
import EnhancedPremiumOfferCard from "./EnhancedPremiumOfferCard"

const { width: screenWidth } = Dimensions.get("window")

const PremiumOffersSection = React.memo(({ onPremiumOfferPress }) => {
  return (
    <View className="mb-12">
      <View className="flex-row items-center justify-between mb-6 px-6">
        <View>
          <Text className="text-xl font-bold text-gray-900">Exclusive Offers</Text>
          <Text className="text-gray-600 text-sm mt-1">Limited time deals just for you</Text>
        </View>
        <TouchableOpacity className="bg-indigo-600 px-4 py-2 border border-indigo-700" style={{ borderRadius: 16 }}>
          <Text className="text-white text-sm font-bold">View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 24, paddingRight: 24 }}
        decelerationRate="fast"
        snapToInterval={screenWidth * 0.8}
        snapToAlignment="start"
      >
        {PREMIUM_OFFERS.map((offer) => (
          <EnhancedPremiumOfferCard key={offer.id} offer={offer} onPress={onPremiumOfferPress} />
        ))}
      </ScrollView>
    </View>
  )
})

export default PremiumOffersSection
