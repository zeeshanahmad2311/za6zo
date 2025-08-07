import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from '../../app/(auth)/sign-in';
import SignUpScreen from '../../app/(auth)/sign-up';
import OTPVerification from '../features/auth/OTPVerification';
import RoleSelect from '../features/auth/RoleSelect';

const Stack = createStackNavigator();

export default function AuthStack({ onRoleSelect }) {
  return (
    <Stack.Navigator 
      initialRouteName="SignIn" 
      screenOptions={{ 
        headerShown: false,
        animationEnabled: false // Disable transitions if using Expo Router
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="OTP" component={OTPVerification} />
      <Stack.Screen 
        name="RoleSelect" 
        children={() => <RoleSelect onRoleSelect={onRoleSelect} />}
      />
    </Stack.Navigator>
  );
}