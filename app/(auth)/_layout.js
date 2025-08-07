// app/(auth)/_layout.js
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // Wait for Clerk to load
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // If signed in, redirect to home
  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack />;
}