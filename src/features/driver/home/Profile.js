import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Responsive scaling functions
const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ProfileScreen = () => {
  // Color scheme
  const colors = {
    gradientStart: '#6366F1',  // Indigo
    gradientEnd: '#8B5CF6',    // Purple
    textLight: '#FFFFFF',
    textDark: '#1F2937',
    cardBg: '#1E1B4B',
    border: '#374151'
  };

  const [driverData] = useState({
    name: 'Rajesh Kumar',
    rating: 4.92,
    trips: 1247,
    memberSince: 'May 2018',
    vehicle: 'Toyota Innova Crysta (DL1TA1234)',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@example.com',
    profileImage: 'https://randomuser.me/api/portraits/men/42.jpg'
  });

  const stats = [
    { icon: 'star', label: 'Rating', value: driverData.rating },
    { icon: 'local-taxi', label: 'Trips', value: driverData.trips },
    { icon: 'calendar-today', label: 'Member Since', value: driverData.memberSince }
  ];

  const menuItems = [
    { icon: 'payment', label: 'Payment Methods', action: () => console.log('Payment') },
    { icon: 'history', label: 'Trip History', action: () => console.log('History') },
    { icon: 'help', label: 'Help Center', action: () => console.log('Help') },
    { icon: 'settings', label: 'Settings', action: () => console.log('Settings') },
    { icon: 'logout', label: 'Log Out', action: () => console.log('Logout') }
  ];

  // Card component for consistent styling
  const Card = ({ children, style = {} }) => (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[{
        borderRadius: moderateScale(16),
        padding: moderateScale(16),
        marginBottom: verticalScale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: moderateScale(2) },
        shadowOpacity: 0.2,
        shadowRadius: moderateScale(4),
        elevation: 3
      }, style]}
    >
      {children}
    </LinearGradient>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ padding: moderateScale(16) }}>
        {/* Profile Header */}
        <Card style={{
          alignItems: 'center',
          paddingVertical: verticalScale(24),
          marginBottom: verticalScale(24)
        }}>
          <Image
            source={{ uri: driverData.profileImage }}
            style={{
              width: moderateScale(120),
              height: moderateScale(120),
              borderRadius: moderateScale(60),
              borderWidth: moderateScale(4),
              borderColor: colors.textLight
            }}
          />
          <Text style={{
            color: colors.textLight,
            fontSize: moderateScale(24),
            fontWeight: 'bold',
            marginTop: verticalScale(16)
          }}>
            {driverData.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(8) }}>
            <FontAwesome name="star" size={moderateScale(16)} color="#FFD700" />
            <Text style={{
              color: colors.textLight,
              fontSize: moderateScale(16),
              marginLeft: moderateScale(8)
            }}>
              {driverData.rating}
            </Text>
          </View>
        </Card>

        {/* Stats Cards */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: verticalScale(16)
        }}>
          {stats.map((stat, index) => (
            <Card key={index} style={{
              width: '30%',
              alignItems: 'center',
              padding: moderateScale(12)
            }}>
              <MaterialIcons 
                name={stat.icon} 
                size={moderateScale(24)} 
                color={colors.textLight} 
              />
              <Text style={{
                color: colors.textLight,
                fontSize: moderateScale(18),
                fontWeight: 'bold',
                marginVertical: verticalScale(8)
              }}>
                {stat.value}
              </Text>
              <Text style={{
                color: colors.textLight,
                fontSize: moderateScale(12),
                opacity: 0.8
              }}>
                {stat.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Vehicle Info Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12) }}>
            <MaterialIcons 
              name="directions-car" 
              size={moderateScale(24)} 
              color={colors.textLight} 
            />
            <Text style={{
              color: colors.textLight,
              fontSize: moderateScale(18),
              fontWeight: 'bold',
              marginLeft: moderateScale(12)
            }}>
              Vehicle Information
            </Text>
          </View>
          <Text style={{
            color: colors.textLight,
            fontSize: moderateScale(16)
          }}>
            {driverData.vehicle}
          </Text>
        </Card>

        {/* Contact Info Card */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(12) }}>
            <MaterialIcons 
              name="contact-phone" 
              size={moderateScale(24)} 
              color={colors.textLight} 
            />
            <Text style={{
              color: colors.textLight,
              fontSize: moderateScale(18),
              fontWeight: 'bold',
              marginLeft: moderateScale(12)
            }}>
              Contact Information
            </Text>
          </View>
          <Text style={{
            color: colors.textLight,
            fontSize: moderateScale(16),
            marginBottom: verticalScale(8)
          }}>
            {driverData.phone}
          </Text>
          <Text style={{
            color: colors.textLight,
            fontSize: moderateScale(16)
          }}>
            {driverData.email}
          </Text>
        </Card>

        {/* Menu Items */}
        <Card style={{ padding: 0 }}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: moderateScale(16),
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: 'rgba(255,255,255,0.1)'
              }}
              onPress={item.action}
            >
              <MaterialIcons 
                name={item.icon} 
                size={moderateScale(24)} 
                color={colors.textLight} 
              />
              <Text style={{
                color: colors.textLight,
                fontSize: moderateScale(16),
                flex: 1,
                marginLeft: moderateScale(16)
              }}>
                {item.label}
              </Text>
              <MaterialIcons 
                name="chevron-right" 
                size={moderateScale(24)} 
                color="rgba(255,255,255,0.5)" 
              />
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;