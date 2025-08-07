import { useAuth, useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigation = useNavigation();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already signed in
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
    <View style={{ padding: 20 }}>
      {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
      
      {pendingVerification ? (
        <>
          <Text>Enter verification code sent to {emailAddress}</Text>
          <TextInput
            value={code}
            placeholder="Verification code"
            onChangeText={setCode}
            style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity 
            onPress={onVerifyPress}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#007AFF',
              padding: 10,
              borderRadius: 5,
              alignItems: 'center'
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: 'white' }}>Verify Email</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Create Account</Text>
          
          <TextInput
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email address"
            onChangeText={setEmailAddress}
            style={{ borderWidth: 1, padding: 12, marginBottom: 15, borderRadius: 5 }}
            keyboardType="email-address"
          />
          
          <TextInput
            value={password}
            placeholder="Password (min 8 characters)"
            secureTextEntry
            onChangeText={setPassword}
            style={{ borderWidth: 1, padding: 12, marginBottom: 15, borderRadius: 5 }}
          />
          
          <TouchableOpacity 
            onPress={onSignUpPress}
            disabled={loading || !emailAddress || !password || password.length < 8}
            style={{
              backgroundColor: 
                loading || !emailAddress || !password || password.length < 8 
                  ? '#ccc' 
                  : '#007AFF',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center',
              marginBottom: 15
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Continue</Text>
            )}
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('SignIn')}
              disabled={loading}
            >
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}