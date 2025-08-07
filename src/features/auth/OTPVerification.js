import { useSignIn } from '@clerk/clerk-expo';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function OTPVerification() {
  const route = useRoute();
  const { signIn } = useSignIn();
  const navigation = useNavigation();
  const inputs = Array(6).fill(0).map(() => useRef(null));
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(30);
  const { email, phoneNumber } = route.params;

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (text, index) => {
    if (text.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs[index + 1].current.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: email ? 'email_code' : 'phone_code',
        code,
      });
      
      await signIn.setActive({ session: completeSignIn.createdSessionId });
      navigation.navigate('RoleSelect');
    } catch (err) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Invalid verification code');
    }
  };

  const handleResend = async () => {
    try {
      if (email) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: signIn.supportedFirstFactors.find(
            (f) => f.strategy === 'email_code'
          ).emailAddressId,
        });
      } else {
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumber,
        });
      }
      setResendTimer(30);
    } catch (err) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to resend code');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-6 pt-32 items-center">
        <Text className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</Text>
        <Text className="text-base text-gray-500 text-center mb-6">
          Enter the 6-digit code sent to {email || phoneNumber}
        </Text>

        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputs[index]}
              className="w-12 h-14 text-xl text-center border border-gray-300 rounded-[10px] mx-1 text-gray-900"
              maxLength={1}
              keyboardType="number-pad"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              autoFocus={index === 0}
            />
          ))}
        </View>

        <Text className="text-sm text-gray-500 mb-8">
          Didn't get the code?{' '}
          {resendTimer === 0 ? (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-sm font-semibold text-black">Resend</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-sm font-medium text-gray-400">Resend in {resendTimer}s</Text>
          )}
        </Text>

        <TouchableOpacity
          onPress={handleVerify}
          className="bg-gray-900 w-full h-14 rounded-[10px] justify-center items-center"
        >
          <Text className="text-white text-base font-semibold">Verify</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}