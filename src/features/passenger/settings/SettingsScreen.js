"use client"

import { useClerk, useUser } from '@clerk/clerk-expo'
import { Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons"
import { BlurView } from "expo-blur"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useState } from "react"
import { Alert, Dimensions, Image, Platform, ScrollView, StatusBar, Switch, Text, TextInput, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const statusBarHeight = Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0

const SettingsScreen = ({ navigation }) => {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [editing, setEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [profileImage, setProfileImage] = useState(user?.imageUrl || '')
  const [saving, setSaving] = useState(false)

  const settingsOptions = [
    {
      section: "Account",
      items: [
        {
          id: "profile",
          title: "Edit Profile",
          subtitle: "Update your personal information",
          icon: "user",
          action: () => navigation.navigate("ProfileScreen"),
        },
        {
          id: "payment",
          title: "Payment Methods",
          subtitle: "Manage cards and payment options",
          icon: "credit-card",
          action: () => navigation.navigate("PaymentScreen"),
        },
        {
          id: "addresses",
          title: "Saved Addresses",
          subtitle: "Home, work, and favorite places",
          icon: "map-pin",
          action: () => navigation.navigate("SavedAddressesScreen"),
        },
      ],
    },
    {
      section: "Preferences",
      items: [
        {
          id: "notifications",
          title: "Push Notifications",
          subtitle: "Ride updates and promotions",
          icon: "bell",
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: "location",
          title: "Location Services",
          subtitle: "Allow location access for better service",
          icon: "map-pin",
          toggle: true,
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          id: "dark-mode",
          title: "Dark Mode",
          subtitle: "Switch to dark theme",
          icon: "moon",
          toggle: true,
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
      ],
    },
    {
      section: "Support",
      items: [
        {
          id: "help",
          title: "Help Center",
          subtitle: "FAQs and support articles",
          icon: "help-circle",
          action: () => navigation.navigate("HelpScreen"),
        },
        {
          id: "contact",
          title: "Contact Support",
          subtitle: "Get help from our team",
          icon: "message-circle",
          action: () => navigation.navigate("ContactScreen"),
        },
        {
          id: "feedback",
          title: "Send Feedback",
          subtitle: "Help us improve the app",
          icon: "star",
          action: () => navigation.navigate("FeedbackScreen"),
        },
      ],
    },
    {
      section: "Legal",
      items: [
        {
          id: "terms",
          title: "Terms of Service",
          subtitle: "Read our terms and conditions",
          icon: "file-text",
          action: () => navigation.navigate("TermsScreen"),
        },
        {
          id: "privacy",
          title: "Privacy Policy",
          subtitle: "How we handle your data",
          icon: "shield",
          action: () => navigation.navigate("PrivacyScreen"),
        },
        {
          id: "about",
          title: "About Za6zo",
          subtitle: "Version 1.0.0",
          icon: "info",
          action: () => navigation.navigate("AboutScreen"),
        },
      ],
    },
  ]

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut()
        },
      },
    ])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await user.update({ firstName, lastName })
      // Clerk does not support direct image upload from client, so image update is omitted here
      setEditing(false)
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile')
    }
    setSaving(false)
  }

  if (!isLoaded) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>
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
          <View>
            <Text className="text-white text-xl font-bold">Settings</Text>
            <Text className="text-white/80 text-sm">Manage your preferences</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border border-white/30"
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View className="p-6">
          <BlurView intensity={80} style={{ borderRadius: 20 }} className="overflow-hidden border border-gray-200">
            <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-6">
              <View className="flex-row items-center">
                <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mr-4 border border-indigo-200 overflow-hidden">
                  {user?.imageUrl ? (
                    <Image source={{ uri: user.imageUrl }} style={{ width: 64, height: 64, borderRadius: 32 }} />
                  ) : (
                    <Text style={{ fontSize: 32, color: '#6366f1', fontWeight: 'bold' }}>{user?.firstName ? user.firstName[0].toUpperCase() : user?.emailAddresses?.[0]?.emailAddress[0].toUpperCase()}</Text>
                  )}
                </View>
                <View className="flex-1">
                  {editing ? (
                    <>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First Name"
                        style={{ borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 4 }}
                      />
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last Name"
                        style={{ borderBottomWidth: 1, borderColor: '#ddd', marginBottom: 4 }}
                      />
                    </>
                  ) : (
                    <Text className="text-gray-900 text-lg font-bold">{user?.firstName} {user?.lastName}</Text>
                  )}
                  <Text className="text-gray-600 text-sm">{user?.emailAddresses?.[0]?.emailAddress}</Text>
                  <View className="flex-row items-center mt-1">
                    <FontAwesome5 name="star" size={12} color="#fbbf24" solid />
                    <Text className="text-gray-500 text-sm ml-1">4.9 • 127 rides</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setEditing(!editing)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center border border-gray-200"
                >
                  <Feather name={editing ? "check" : "edit-2"} size={16} color="#6b7280" />
                </TouchableOpacity>
              </View>
              {editing && (
                <TouchableOpacity
                  onPress={handleSave}
                  style={{ marginTop: 10, backgroundColor: '#6366f1', padding: 8, borderRadius: 8 }}
                  disabled={saving}
                >
                  <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{saving ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </BlurView>
        </View>

        {/* Settings Sections */}
        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} className="px-6 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">{section.section}</Text>

            <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    if (item.action) {
                      item.action()
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }
                  }}
                  className={`p-4 flex-row items-center ${
                    itemIndex < section.items.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                  activeOpacity={item.toggle ? 1 : 0.8}
                  disabled={item.toggle}
                >
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4 border border-gray-200">
                    <Feather name={item.icon} size={18} color="#6b7280" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-semibold">{item.title}</Text>
                    <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                  </View>

                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={(value) => {
                        item.onToggle(value)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                      }}
                      trackColor={{ false: "#d1d5db", true: "#4f46e5" }}
                      thumbColor={item.value ? "#ffffff" : "#ffffff"}
                    />
                  ) : (
                    <Feather name="chevron-right" size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 border border-red-200 py-4 px-6 flex-row items-center justify-center"
            style={{ borderRadius: 20 }}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={20} color="#dc2626" />
            <Text className="text-red-600 text-base font-bold ml-3">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

export default SettingsScreen
