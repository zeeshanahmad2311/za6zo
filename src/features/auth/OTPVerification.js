import React, { useRef, useState } from 'react';
import { Keyboard, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function OTPVerification({ navigation }) {
  const inputs = Array(6).fill(0).map(() => useRef(null));
  const [otp, setOtp] = useState(Array(6).fill(''));
  const [resendTimer, setResendTimer] = useState(30);

  // Countdown timer
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

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length === 6) {
      navigation.navigate('RoleSelect');
    } else {
      alert('Please enter a valid 6-digit code');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white px-6 pt-32 items-center">
        {/* Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</Text>
        <Text className="text-base text-gray-500 text-center mb-6">
          Enter the 6-digit code we sent to your phone number
        </Text>

        {/* OTP Boxes */}
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

        {/* Resend code */}
        <Text className="text-sm text-gray-500 mb-8">
          Didn’t get the code?{' '}
          {resendTimer === 0 ? (
            <TouchableOpacity onPress={() => setResendTimer(30)}>
              <Text className="text-sm font-semibold text-black">Resend</Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-sm font-medium text-gray-400">Resend in {resendTimer}s</Text>
          )}
        </Text>

        {/* Verify Button */}
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
