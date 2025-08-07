// src/navigation/Navigation.js
import { useAuth } from '@clerk/clerk-expo';
import { useState } from 'react';
import RoleSelect from '../features/auth/RoleSelect'; // Make sure this import path is correct
import AuthStack from './AuthStack';
import DriverStack from './DriverStack';
import PassengerStack from './PassengerStack';

export default function Navigation() {
  const { isLoaded, isSignedIn } = useAuth();
  const [role, setRole] = useState(null);

  if (!isLoaded) {
    return null; // or loading screen
  }

  if (!isSignedIn) {
    return <AuthStack onRoleSelect={setRole} />;
  }

  if (!role) {
    return <RoleSelect onRoleSelect={setRole} />;
  }

  if (role === 'driver') {
    return <DriverStack />;
  }

  if (role === 'passenger') { // Fixed typo here (was 'passenger')
    return <PassengerStack />;
  }

  return null;
}