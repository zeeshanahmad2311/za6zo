import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setError(null);
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(err.errors ? err.errors[0].message : 'Sign-up error');
      console.error('Sign-up error:', JSON.stringify(err, null, 2));
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      console.log('Verification result:', JSON.stringify(result, null, 2));
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigation.navigate('RoleSelect'); // Use React Navigation
      } else {
        // Handle missing requirements
        if (result.nextStep) {
          setError(`Verification not complete: ${result.nextStep}`);
        } else if (result.missingFields && result.missingFields.length > 0) {
          setError(`Missing fields: ${result.missingFields.join(', ')}`);
        } else {
          setError(`Verification not complete: ${result.status}`);
        }
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].message : 'Verification error');
      console.error('Verification error:', JSON.stringify(err, null, 2));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
      {pendingVerification ? (
        <>
          <Text>Enter verification code</Text>
          <TextInput
            value={code}
            placeholder="Code"
            onChangeText={setCode}
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          />
          <TouchableOpacity onPress={onVerifyPress}>
            <Text>Verify</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text>Sign Up</Text>
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            onChangeText={setEmailAddress}
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          />
          <TextInput
            value={password}
            placeholder="Password"
            secureTextEntry
            onChangeText={setPassword}
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
          />
          <TouchableOpacity onPress={onSignUpPress}>
            <Text>Continue</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            <Text>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={{ color: 'blue' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
