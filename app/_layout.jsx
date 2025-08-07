// app/_layout.jsx
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { PlacesProvider } from '../src/contexts/PlacesContext';
import { ScheduleProvider } from '../src/contexts/ScheduleContext';
import Navigation from '../src/navigation/Navigation';

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <SafeAreaProvider>
        <PlacesProvider>
          <ScheduleProvider>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'right', 'left', 'bottom']}>
              <Navigation />
            </SafeAreaView>
          </ScheduleProvider>
        </PlacesProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}