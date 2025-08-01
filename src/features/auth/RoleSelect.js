import { FontAwesome5 } from '@expo/vector-icons'; // for role icons (optional)
import { Text, TouchableOpacity, View } from 'react-native';

export default function RoleSelect({ navigation, onRoleSelect }) {
  const selectRole = (role) => {
    onRoleSelect(role); // Pass role up to parent
  };

  return (
    <View className="flex-1 bg-white px-6 pt-32 items-center">
      {/* Title */}
      <Text className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</Text>
      <Text className="text-base text-gray-500 text-center mb-8">
        Select how you’d like to use the app
      </Text>

      {/* Role Buttons */}
      <TouchableOpacity
        onPress={() => selectRole('driver')}
        className="flex-row items-center justify-start w-full bg-white border border-gray-200 rounded-[10px] px-4 py-4 mb-4 shadow-sm"
      >
        <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-4">
          <FontAwesome5 name="car" size={18} color="#1f2937" />
        </View>
        <Text className="text-base font-semibold text-gray-900">Driver</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => selectRole('passenger')}
        className="flex-row items-center justify-start w-full bg-white border border-gray-200 rounded-[10px] px-4 py-4 mb-4 shadow-sm"
      >
        <View className="w-10 h-10 bg-gray-100 rounded-full justify-center items-center mr-4">
          <FontAwesome5 name="user" size={18} color="#1f2937" />
        </View>
        <Text className="text-base font-semibold text-gray-900">Passenger</Text>
      </TouchableOpacity>
    </View>
  );
}
