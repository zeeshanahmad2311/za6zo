import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { View } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"

// Screens
import BookingHistoryScreen from "../../features/passenger/booking/BookingHistoryScreen"
import PassengerHome from "../../features/passenger/home/HomeScreen"
import NotificationsScreen from "../../features/passenger/notifications/NotificationsScreen"
import SettingsScreen from "../../features/passenger/settings/SettingsScreen"

const Tab = createBottomTabNavigator()

export default function PassengerTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#4f46e5", // Indigo for active
        tabBarInactiveTintColor: "#9CA3AF", // Gray for inactive
        tabBarStyle: {
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName
          const iconSize = 24

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline"
              break
            case "Bookings":
              iconName = focused ? "car" : "car-outline"
              break
            case "Notifications":
              iconName = focused ? "notifications" : "notifications-outline"
              break
            case "Settings":
              iconName = focused ? "settings" : "settings-outline"
              break
            default:
              iconName = "ellipse"
          }

          return (
            <View className={`items-center justify-center ${focused ? "transform scale-110" : ""}`}>
              <Ionicons name={iconName} size={iconSize} color={color} />
              {focused && <View className="w-1 h-1 bg-indigo-600 rounded-full mt-1" />}
            </View>
          )
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={PassengerHome}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingHistoryScreen}
        options={{
          tabBarLabel: "Bookings",
          tabBarBadge: null, // You can add booking count here
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Alerts",
          tabBarBadge: 3, // You can make this dynamic
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  )
}
