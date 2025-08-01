import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import DriverHome from '../features/driver/home/HomeScreen';

const Stack = createStackNavigator();

export default function DriverStack() {
  return (
    <Stack.Navigator initialRouteName="DriverHome">
      <Stack.Screen name="DriverHome" component={DriverHome} />
    </Stack.Navigator>
  );
}
