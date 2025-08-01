import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../features/auth/LoginScreen';
import OTPVerification from '../features/auth/OTPVerification';
import RoleSelect from '../features/auth/RoleSelect';

const Stack = createStackNavigator();

export default function AuthStack({ onRoleSelect }) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="OTP" component={OTPVerification} options={{ headerShown: false }} />
      <Stack.Screen 
        name="RoleSelect" 
        children={() => <RoleSelect onRoleSelect={onRoleSelect} />}options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}