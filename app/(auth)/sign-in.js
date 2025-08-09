// app/(auth)/sign-in.js
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      navigation.navigate('(home)');
    }
  }, [isSignedIn]);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setError(null);
    setLoading(true);
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        navigation.navigate('RoleSelect');
      } else {
        setError('Sign-in not complete: ' + signInAttempt.status);
        console.error('Sign-in not complete:', signInAttempt.status);
      }
    } catch (err) {
      setError(err.errors ? err.errors[0].message : 'Sign-in error');
      console.error('Sign-in error:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (isSignedIn) return null;

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
          source={require('../../src/assets/images/Za6zo.png')} // Replace with your logo
          style={{ width: 100, height: 100, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' }}>
          Welcome Back
        </Text>
        <Text style={{ fontSize: 14, color: '#555', marginTop: 4 }}>
          Sign in to continue
        </Text>
      </View>

      {error && (
        <Text style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>
          {error}
        </Text>
      )}

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
          marginBottom: 14,
          backgroundColor: '#fff',
          fontSize: 16,
        }}
      />
      <TextInput
        value={password}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor="#888"
        style={{
          borderColor: '#ddd',
          borderWidth: 1,
          borderRadius: 10,
          padding: 12,
          marginBottom: 20,
          backgroundColor: '#fff',
          fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={onSignInPress}
        disabled={loading}
        style={{
          backgroundColor: '#007AFF',
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            Sign In
          </Text>
        )}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14 }}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={{ fontSize: 14, color: '#007AFF', fontWeight: 'bold' }}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
