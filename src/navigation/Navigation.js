import React, { useState } from 'react';
import AuthStack from './AuthStack';
import DriverStack from './DriverStack';
import PassengerStack from './PassengerStack';

export default function Navigation() {
  // For demo: track which stack to show. In real app, use context/auth state.
  const [role, setRole] = useState(null);

  // Listen for navigation events from RoleSelect
  // We'll use a simple prop trick for now
  if (!role) {
    return (
      <AuthStack
        onRoleSelect={selectedRole => setRole(selectedRole)}
      />
    );
  }
  if (role === 'driver') {
    return <DriverStack />;
  }
  if (role === 'passenger') {
    return <PassengerStack />;
  }
  return null;
}
