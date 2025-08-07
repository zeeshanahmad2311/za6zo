import React, { useCallback, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import {
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO } from '@clerk/clerk-expo';

WebBrowser.maybeCompleteAuthSession();

const useWarmUpBrowser = () => {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function CompactLoginScreen({ navigation }) {
  useWarmUpBrowser();
  const { startSSOFlow } = useSSO();

  const onGoogleSignIn = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        Alert.alert('Success', 'You are now signed in with Google!');
        // You can redirect here, for example:
        // navigation.replace('Home');
      } else {
        Alert.alert('Verification Needed', 'Please complete all steps.');
      }
    } catch (err) {
      console.error('Google SSO Error:', err);
      Alert.alert('Google Sign-In Failed', 'Something went wrong.');
    }
  }, []);

  return (
    <View className="flex-1 bg-white px-6 justify-center">
     
      {/* Header */}
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-gray-50 rounded-[10px] border border-gray-100 justify-center items-center mb-4 overflow-hidden">
          <Image
            source={require('../../assets/images/Za6zo.png')}
            style={{ width: 80, height: 80, resizeMode: 'contain' }}
          />
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-1">Welcome</Text>
        <Text className="text-sm text-gray-500">Access your account</Text>
      </View>

      {/* Email Input */}
      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-500 mb-1 tracking-wider">EMAIL</Text>
        <View className="h-12 bg-white border border-gray-200 rounded-[10px] px-4">
          <TextInput
            className="flex-1 h-full text-base text-gray-900"
            placeholder="your@email.com"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      {/* Divider */}
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="px-2 text-xs text-gray-400">OR</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* Phone Input */}
      <View className="mb-6">
        <Text className="text-xs font-semibold text-gray-500 mb-1 tracking-wider">PHONE NUMBER</Text>
        <View className="h-12 bg-white border border-gray-200 rounded-[10px] px-4">
          <TextInput
            className="flex-1 h-full text-base text-gray-900"
            placeholder="Enter Your Phone Number"
            placeholderTextColor="#A0AEC0"
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        className="h-12 bg-gray-900 rounded-[10px] justify-center items-center mb-6"
        onPress={() => navigation.navigate('OTP')}
      >
        <Text className="text-white text-base font-semibold">Continue</Text>
      </TouchableOpacity>

      {/* Social Login */}
      <Text className="text-center text-xs text-gray-500 mb-4">Continue with</Text>
      <View className="flex-row justify-center mb-8">
        <TouchableOpacity
          className="w-12 h-12 bg-white rounded-[10px] border border-gray-200 justify-center items-center mx-2"
          onPress={onGoogleSignIn}
        >
          <FontAwesome name="google" size={20} color="#A0AEC0" />
        </TouchableOpacity>

        {/* Placeholders for future integration */}
        <TouchableOpacity className="w-12 h-12 bg-white rounded-[10px] border border-gray-200 justify-center items-center mx-2">
          <FontAwesome name="facebook" size={20} color="#A0AEC0" />
        </TouchableOpacity>
        <TouchableOpacity className="w-12 h-12 bg-white rounded-[10px] border border-gray-200 justify-center items-center mx-2">
          <FontAwesome name="apple" size={20} color="#A0AEC0" />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View className="flex-row justify-center pb-4">
        <Text className="text-sm text-gray-500">No account?</Text>
        <TouchableOpacity className="ml-1">
          <Text className="text-sm text-gray-900 font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
