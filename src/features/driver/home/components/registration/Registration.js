import { Entypo, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const steps = ['Personal Info', 'Vehicle Info', 'Documents', 'Review'];

const colors = {
  gradientStart: '#8A2BE2',
  gradientEnd: '#4B0082',
  textDark: '#2F2F2F',
  textLight: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E0E0E0',
  icon: '#FFFFFF',
  progressActive: '#8A2BE2',
  progressInactive: '#D3D3D3'
};

const Registration = () => {
  const [step, setStep] = useState(1);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isEmulator, setIsEmulator] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    licenseNumber: ''
  });

  const [licenseImage, setLicenseImage] = useState(null);
  const [rcImage, setRcImage] = useState(null);

  useEffect(() => {
    // Check if running in emulator
    setIsEmulator(Platform.isTV || Platform.OS === 'web' || __DEV__);
    
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const pickImage = async (setImage) => {
    if (isEmulator) {
      Alert.alert('Demo Mode', 'Document upload is skipped in emulator/demo mode');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const validateStep = () => {
    switch(step) {
      case 1:
        if (!formData.fullName.trim()) {
          Alert.alert('Error', 'Please enter your full name');
          return false;
        }
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
          Alert.alert('Error', 'Please enter a valid email address');
          return false;
        }
        if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
          Alert.alert('Error', 'Please enter a valid 10-digit phone number');
          return false;
        }
        return true;
      case 2:
        if (!formData.vehicleType.trim()) {
          Alert.alert('Error', 'Please enter your vehicle type');
          return false;
        }
        if (!formData.vehicleNumber.trim()) {
          Alert.alert('Error', 'Please enter your vehicle number');
          return false;
        }
        if (!formData.licenseNumber.trim()) {
          Alert.alert('Error', 'Please enter your license number');
          return false;
        }
        return true;
      case 3:
        // Skip document validation in emulator/demo mode
        if (isEmulator) return true;
        
        if (!licenseImage) {
          Alert.alert('Error', 'Please upload your driving license');
          return false;
        }
        if (!rcImage) {
          Alert.alert('Error', 'Please upload your vehicle RC');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('DriverHome');
    }, 2000);
  };

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Driver Registration</Text>
          <Text style={styles.subTitle}>Step {step} of {steps.length}</Text>
        </View>

        {/* Step Indicators */}
        <View style={styles.stepContainer}>
          {steps.map((label, index) => (
            <View key={index} style={styles.stepItem}>
              <View style={[
                styles.stepBullet,
                step === index + 1 ? styles.activeBullet : styles.inactiveBullet
              ]} />
              <Text style={styles.stepText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#888"
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#888"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              style={styles.input}
              maxLength={10}
            />
          </View>
        )}

        {/* Step 2: Vehicle Info */}
        {step === 2 && (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Vehicle Type (e.g. Sedan, SUV)"
              placeholderTextColor="#888"
              value={formData.vehicleType}
              onChangeText={(text) => handleChange('vehicleType', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="Vehicle Number"
              placeholderTextColor="#888"
              value={formData.vehicleNumber}
              onChangeText={(text) => handleChange('vehicleNumber', text)}
              style={styles.input}
            />
            <TextInput
              placeholder="License Number"
              placeholderTextColor="#888"
              value={formData.licenseNumber}
              onChangeText={(text) => handleChange('licenseNumber', text)}
              style={styles.input}
            />
          </View>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <View style={styles.documentsContainer}>
            {isEmulator && (
              <Text style={styles.demoNote}>
                Note: Document upload is skipped in emulator/demo mode
              </Text>
            )}
            <View style={styles.documentItem}>
              <Text style={styles.documentTitle}>Driving License</Text>
              <TouchableOpacity
                onPress={() => pickImage(setLicenseImage)}
                style={styles.uploadBox}
              >
                {licenseImage ? (
                  <Image 
                    source={{ uri: licenseImage }} 
                    style={styles.documentImage}
                  />
                ) : (
                  <Entypo name="upload" size={32} color={colors.gradientStart} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.documentItem}>
              <Text style={styles.documentTitle}>Vehicle RC</Text>
              <TouchableOpacity
                onPress={() => pickImage(setRcImage)}
                style={styles.uploadBox}
              >
                {rcImage ? (
                  <Image 
                    source={{ uri: rcImage }} 
                    style={styles.documentImage}
                  />
                ) : (
                  <Entypo name="upload" size={32} color={colors.gradientStart} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Review Information</Text>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Name:</Text>
              <Text style={styles.reviewValue}>{formData.fullName}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Email:</Text>
              <Text style={styles.reviewValue}>{formData.email}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Phone:</Text>
              <Text style={styles.reviewValue}>{formData.phone}</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Vehicle:</Text>
              <Text style={styles.reviewValue}>{formData.vehicleType} ({formData.vehicleNumber})</Text>
            </View>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>License No:</Text>
              <Text style={styles.reviewValue}>{formData.licenseNumber}</Text>
            </View>
            {isEmulator && (
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, {color: '#FFA500'}]}>Note:</Text>
                <Text style={[styles.reviewValue, {color: '#FFA500'}]}>Demo mode - Documents skipped</Text>
              </View>
            )}
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.navContainer}>
          {step > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Entypo name="chevron-left" size={24} color={colors.gradientStart} />
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Entypo name="chevron-right" size={24} color={colors.textLight} />
            </TouchableOpacity>
          ) : loading ? (
            <View style={styles.nextButton}>
              <ActivityIndicator size="small" color={colors.textLight} />
            </View>
          ) : (
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <FontAwesome name="check" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60
  },
  header: {
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 8
  },
  subTitle: {
    fontSize: 16,
    color: colors.textLight,
    opacity: 0.8
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    width: '100%'
  },
  stepItem: {
    alignItems: 'center',
    flex: 1
  },
  stepBullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8
  },
  activeBullet: {
    backgroundColor: colors.progressActive
  },
  inactiveBullet: {
    backgroundColor: colors.progressInactive
  },
  stepText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center'
  },
  formContainer: {
    width: '100%',
    marginBottom: 30
  },
  input: {
    backgroundColor: colors.card,
    color: colors.textDark,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%'
  },
  documentsContainer: {
    width: '100%',
    marginBottom: 30
  },
  demoNote: {
    color: '#FFA500',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  documentItem: {
    alignItems: 'center',
    marginBottom: 20
  },
  documentTitle: {
    color: colors.textLight,
    marginBottom: 12,
    fontSize: 14
  },
  uploadBox: {
    width: width > 600 ? 150 : 120,
    height: width > 600 ? 150 : 120,
    backgroundColor: colors.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  documentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  reviewContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%'
  },
  reviewTitle: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: 8
  },
  reviewLabel: {
    color: colors.textLight,
    fontWeight: '600',
    width: 100
  },
  reviewValue: {
    color: colors.textLight,
    flex: 1
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%'
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center'
  },
  nextButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto'
  },
  submitButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gradientStart,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto'
  }
});

export default Registration;