import { createStackNavigator } from '@react-navigation/stack';
import Registration from '../features/driver/home/components/registration/Registration';
import DriverTabs from './tabs/DriverTabs';

const Stack = createStackNavigator();

export default function DriverStack() {
  return (
    <Stack.Navigator initialRouteName="DriverRegistration">
      <Stack.Screen name="DriverRegistration" component={Registration} options={{headerShown:false}}/>
      <Stack.Screen name="DriverHome" component={DriverTabs} options={{headerShown:false}}/>
       <Stack.Screen name="DriverTabs" component={DriverTabs} />
    </Stack.Navigator>
  );
}
