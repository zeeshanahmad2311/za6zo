// app/(auth)/sign-in.js
import { useAuth, useSignIn } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigation.navigate('(home)');
    }
  }, [isSignedIn]);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setError(null);
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
    }
  };

  if (isSignedIn) {
    return null; // or a loading indicator
  }

  return (
    <View style={{ padding: 20 }}>
      {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
      <Text>Sign In</Text>
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
      <TouchableOpacity onPress={onSignInPress}>
        <Text>Continue</Text>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={{ color: 'blue' }}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}