import { Entypo, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

// Your screens
import HomeScreen from '../../features/driver/home/HomeScreen';
import MessageScreen from '../../features/driver/home/Message';
import ProfileScreen from '../../features/driver/home/Profile';
import SaveScreen from '../../features/driver/home/Save';

const Tab = createBottomTabNavigator();

const DriverTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',      // white background
          borderTopLeftRadius: 20,      // only top-left
          borderTopRightRadius: 20,     // only top-right
          height: 70,                   // normal height
          borderTopWidth: 0,
          elevation: 10,                // subtle shadow
        },
        tabBarActiveTintColor: '#000',    // active text color (black)
        tabBarInactiveTintColor: '#aaa',  // inactive text color (gray)
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let IconComponent;

          if (route.name === 'Home') {
            iconName = 'home';
            IconComponent = Entypo;
          } else if (route.name === 'Save') {
            iconName = 'save';
            IconComponent = FontAwesome;
          } else if (route.name === 'Message') {
            iconName = 'message-text';
            IconComponent = MaterialCommunityIcons;
          } else if (route.name === 'Profile') {
            iconName = 'user';
            IconComponent = FontAwesome;
          }

          if (focused) {
            return (
              <LinearGradient
                colors={['#4A00E0', '#8E2DE2']} // Purple to blue gradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientIcon}
              >
                <IconComponent name={iconName} size={20} color="#fff" />
              </LinearGradient>
            );
          }

          return <IconComponent name={iconName} size={20} color="#aaa" />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Save" component={SaveScreen} options={{headerShown:false}}/>
      <Tab.Screen name="Message" component={MessageScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  gradientIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DriverTabs;