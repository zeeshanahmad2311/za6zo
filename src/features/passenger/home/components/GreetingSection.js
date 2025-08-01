"use client"

import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native'; // Added import
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const GreetingSection = React.memo(({ userName }) => {
  const navigation = useNavigation(); // Get navigation object
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback(() => {
    return currentTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [currentTime]);

  const getGreeting = useCallback(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, [currentTime]);

  return (
    <View className="mx-6 mb-6">
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20 }}
        className="p-6 border border-gray-200/20"
      >
        {/* Greeting and Time Row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-white/80 text-base font-medium">{getGreeting()}</Text>
            <Text className="text-white text-2xl font-bold mt-1">{userName}</Text>
          </View>

          {/* Time and Status */}
          <View className="items-end">
            <View className="flex-row items-center bg-white/15 rounded-full px-3 py-2 mb-2 border border-white/10">
              <MaterialIcons name="access-time" size={16} color="white" />
              <Text className="text-white text-sm font-semibold ml-2">{formatTime()}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              <Text className="text-white/80 text-xs font-medium">All systems online</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between pt-4 border-t border-white/20">
          <View className="flex-row items-center space-x-8">
            {/* Rides Count */}
            <View className="items-center">
              <Text className="text-white text-xl font-bold">24</Text>
              <Text className="text-white/70 text-xs font-medium">Rides</Text>
            </View>

            {/* Rating */}
            <View className="items-center">
              <View className="flex-row items-center">
                <FontAwesome5 name="star" size={14} color="#fbbf24" solid />
                <Text className="text-white text-xl font-bold ml-1">4.9</Text>
              </View>
              <Text className="text-white/70 text-xs font-medium">Rating</Text>
            </View>

            {/* Savings */}
            <View className="items-center">
              <Text className="text-white text-xl font-bold">₹240</Text>
              <Text className="text-white/70 text-xs font-medium">Saved</Text>
            </View>
          </View>

          {/* Quick Book Button */}
          <TouchableOpacity
            className="bg-white/20 px-5 py-2.5 flex-row items-center border border-white/10"
            style={{ borderRadius: 20 }}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LocationSearch')}
          >
            <FontAwesome5 name="bolt" size={16} color="white" />
            <Text className="text-white text-sm font-bold ml-2">Quick Book</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
});

export default GreetingSection;