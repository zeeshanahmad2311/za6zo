import { useAuth, useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

export default function SignUpScreen() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      navigation.replace('(home)');
    }
  }, [isAuthLoaded, isSignedIn]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(err.errors ? err.errors[0].message : 'Sign-up error');
      console.error('Sign-up error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigation.replace('RoleSelect');
      } else {
        handleVerificationErrors(result);
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].message : 'Verification error');
      console.error('Verification error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationErrors = (result) => {
    if (result.nextStep) {
      setError(`Verification not complete: ${result.nextStep}`);
    } else if (result.missingFields?.length > 0) {
      setError(`Missing fields: ${result.missingFields.join(', ')}`);
    } else {
      setError(`Verification not complete: ${result.status}`);
    }
  };

  if (!isAuthLoaded || (isAuthLoaded && isSignedIn)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{
        flex: 1,
        backgroundColor: '#f5f7fa',
        paddingHorizontal: 24,
        justifyContent: 'center',
      }}
    >
      <View style={{ alignItems: 'center', marginBottom: 40 }}>
        <Image
          source={require('../../src/assets/images/Za6zo.png')} // Replace with your logo path
          style={{ width: 100, height: 100, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' }}>
          Create an Account
        </Text>
        <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
          Join us to get started
        </Text>
      </View>

      {error && (
        <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
          {error}
        </Text>
      )}

      {pendingVerification ? (
        <>
          <Text style={{ fontSize: 16, marginBottom: 8, textAlign: 'center' }}>
            Enter the verification code sent to {emailAddress}
          </Text>
          <TextInput
            value={code}
            placeholder="Verification Code"
            onChangeText={setCode}
            placeholderTextColor="#888"
            style={{
              borderColor: '#ddd',
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              backgroundColor: '#fff',
              fontSize: 16,
              marginBottom: 16,
            }}
          />
          <TouchableOpacity
            onPress={onVerifyPress}
            disabled={loading}
            style={{
              backgroundColor: '#28a745',
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Verify Email
              </Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email address"
            onChangeText={setEmailAddress}
            placeholderTextColor="#888"
            keyboardType="email-address"
            style={{
              borderColor: '#ddd',
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              backgroundColor: '#fff',
              fontSize: 16,
              marginBottom: 14,
            }}
          />

          <TextInput
            value={password}
            placeholder="Password (min 8 characters)"
            secureTextEntry
            onChangeText={setPassword}
            placeholderTextColor="#888"
            style={{
              borderColor: '#ddd',
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              backgroundColor: '#fff',
              fontSize: 16,
              marginBottom: 20,
            }}
          />

          <TouchableOpacity
            onPress={onSignUpPress}
            disabled={
              loading || !emailAddress || !password || password.length < 8
            }
            style={{
              backgroundColor:
                loading || !emailAddress || !password || password.length < 8
                  ? '#ccc'
                  : '#007AFF',
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                Continue
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            <Text style={{ fontSize: 14 }}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignIn')}
              disabled={loading}
            >
              <Text style={{ fontSize: 14, color: '#007AFF', fontWeight: 'bold' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
