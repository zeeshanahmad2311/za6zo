// app/_layout.jsx
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import { PlacesProvider } from '../src/contexts/PlacesContext';
import { ScheduleProvider } from '../src/contexts/ScheduleContext';
import Navigation from '../src/navigation/Navigation';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlacesProvider>
        <ScheduleProvider>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'right', 'left', 'bottom']}>
              <Navigation />
            </SafeAreaView>
          </View>
        </ScheduleProvider>
      </PlacesProvider>
    </SafeAreaProvider>
  );
}