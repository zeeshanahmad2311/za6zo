import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SaveScreen = () => {
  // Color scheme matching your ProfileScreen
  const colors = {
    gradientStart: '#6366F1',  // Indigo
    gradientEnd: '#8B5CF6',    // Purple
    textLight: '#FFFFFF',
    textDark: '#1F2937',
    accent: '#4CAF50',
    cardBg: '#1E1B4B',
    border: '#374151'
  };

  // Complete 12 premium locations data
  const savedLocations = [
    {
      id: '1',
      name: 'Luxury Villa',
      address: '123 Palm Beach Road, Mumbai',
      type: 'home'
    },
    {
      id: '2',
      name: 'Corporate Office',
      address: '456 Business Tower, Delhi',
      type: 'work'
    },
    {
      id: '3',
      name: 'Elite Fitness',
      address: '789 Health Avenue, Bangalore',
      type: 'favorite'
    },
    {
      id: '4',
      name: 'Family Residence',
      address: '321 Heritage Lane, Kolkata',
      type: 'favorite'
    },
    {
      id: '5',
      name: 'Weekend Retreat',
      address: '654 Mountain View, Shimla',
      type: 'vacation'
    },
    {
      id: '6',
      name: 'Client Meeting Point',
      address: '987 Corporate Park, Hyderabad',
      type: 'work'
    },
    {
      id: '7',
      name: 'Golf Club',
      address: '147 Country Club Road, Pune',
      type: 'favorite'
    },
    {
      id: '8',
      name: 'Private Jet Terminal',
      address: '258 Airport Avenue, Delhi',
      type: 'special'
    },
    {
      id: '9',
      name: 'Yacht Club',
      address: '369 Marina Bay, Goa',
      type: 'leisure'
    },
    {
      id: '10',
      name: 'VIP Lounge',
      address: '741 Star Avenue, Mumbai',
      type: 'special'
    },
    {
      id: '11',
      name: 'Penthouse',
      address: '852 Sky Towers, Bangalore',
      type: 'home'
    },
    {
      id: '12',
      name: 'Executive Suite',
      address: '963 Platinum Heights, Chennai',
      type: 'work'
    }
  ];

  const handleAddPress = () => {
    console.log("Add new location button pressed");
  };

  const getLocationIcon = (type) => {
    const icons = {
      home: 'home',
      work: 'work',
      favorite: 'favorite',
      vacation: 'beach-access',
      leisure: 'pool',
      special: 'star'
    };
    return icons[type] || 'location-on';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Title */}
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: 'black', fontSize: 22, fontWeight: 'bold' }}>
          Saved Locations
        </Text>
      </View>

      {/* Location List */}
      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {savedLocations.map((location) => (
          <LinearGradient
            key={location.id}
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            {/* Location Icon */}
            <MaterialIcons 
              name={getLocationIcon(location.type)} 
              size={24} 
              color={colors.textLight} 
              style={{ marginRight: 16 }}
            />
            
            {/* Location Details */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textLight, fontSize: 16, fontWeight: 'bold' }}>
                {location.name}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
                {location.address}
              </Text>
            </View>
            
            {/* Edit Button */}
            <TouchableOpacity style={{ padding: 8 }}>
              <MaterialIcons name="edit" size={20} color={colors.textLight} />
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity 
        onPress={handleAddPress}
        style={{
          backgroundColor: colors.cardBg,
          borderWidth: 1,
          borderColor: colors.gradientStart,
          borderRadius: 8,
          padding: 16,
          margin: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <MaterialIcons name="add" size={24} color={colors.gradientStart} />
        <Text style={{ color: colors.gradientStart, fontSize: 16, fontWeight: 'bold', marginLeft: 8 }}>
          Add New Location
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SaveScreen;