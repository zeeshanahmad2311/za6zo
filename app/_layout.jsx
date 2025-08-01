import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';
import Navigation from '../src/navigation/Navigation';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      {/* Main container with black safe area */}
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Safe area with white content background */}
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'right', 'left', 'bottom']}>
          <Navigation />
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}