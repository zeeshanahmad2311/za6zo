import { createStackNavigator } from "@react-navigation/stack";
import {
  BookingHistoryScreen,
  BookRideScreen,
  RateRideScreen,
  TrackRideScreen
} from "../features/passenger/booking";
import FindRidesScreen from "../features/passenger/home/components/FindRidesScreen";
import LocationSearchScreen from "../features/passenger/home/components/LocationSearchScreen";
import SavedLocationsScreen from "../features/passenger/home/components/SavedLocationsScreen";
import ScheduleRideScreen from "../features/passenger/home/components/ScheduleRideScreen";
import PassengerTabs from "./tabs/PassengerTabs";

const Stack = createStackNavigator();

export default function PassengerStack() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' } 
      }}
    >
      <Stack.Screen name="PassengerTabs" component={PassengerTabs} />
      <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
      <Stack.Screen name="BookRide" component={BookRideScreen} />
      <Stack.Screen name="TrackRideScreen" component={TrackRideScreen} 
        options={{ gestureEnabled: false }} />
      <Stack.Screen name="BookingHistory" component={BookingHistoryScreen} />
      <Stack.Screen name="RateRideScreen" component={RateRideScreen} />
      
      {/* New Screens */}
      <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} 
        options={{ presentation: 'modal' }} />
      <Stack.Screen name="SavedLocations" component={SavedLocationsScreen} />
      <Stack.Screen name="FindRides" component={FindRidesScreen} />
    </Stack.Navigator>
  );
}