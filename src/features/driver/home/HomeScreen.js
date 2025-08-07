import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const HomeScreen = () => {
  const [driverStatus, setDriverStatus] = useState('offline');
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);

  // Mock ride request data
  const mockRideRequest = {
    id: '123',
    passenger: {
      name: 'John Doe',
      rating: 4.8,
    },
    pickup: {
      address: '123 Main St, City',
      distance: '0.5 km away',
    },
    destination: {
      address: '456 Central Ave, City',
    },
    fare: '₹120',
    estimatedTime: '3 min',
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      setHasLocationPermission(true);
      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  const toggleDriverStatus = () => {
    if (driverStatus === 'offline') {
      setDriverStatus('online');
      // Simulate receiving a ride request after going online
      setTimeout(() => {
        setRideRequests([mockRideRequest]);
        setShowRideRequest(true);
      }, 3000);
    } else {
      setDriverStatus('offline');
      setShowRideRequest(false);
    }
  };

  const acceptRide = () => {
    setActiveRide(mockRideRequest);
    setDriverStatus('on-trip');
    setShowRideRequest(false);
  };

  const rejectRide = () => {
    setShowRideRequest(false);
  };

  const completeRide = () => {
    setActiveRide(null);
    setDriverStatus('online');
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        region={currentLocation}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {activeRide && (
          <>
            <Marker
              coordinate={{
                latitude: currentLocation.latitude + 0.005,
                longitude: currentLocation.longitude + 0.005,
              }}
              title="Pickup Location"
              description={activeRide.pickup.address}
            />
            <Marker
              coordinate={{
                latitude: currentLocation.latitude + 0.01,
                longitude: currentLocation.longitude + 0.01,
              }}
              title="Destination"
              description={activeRide.destination.address}
              pinColor="green"
            />
          </>
        )}
      </MapView>

      {/* Safe Area for Header */}
      <SafeAreaView style={styles.safeAreaHeader}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.statusButton} onPress={toggleDriverStatus}>
            <Text style={styles.statusButtonText}>
              {driverStatus === 'offline' ? 'GO ONLINE' : driverStatus === 'online' ? 'ONLINE' : 'ON TRIP'}
            </Text>
            <View style={[styles.statusIndicator, 
              { backgroundColor: driverStatus === 'offline' ? 'gray' : driverStatus === 'online' ? 'green' : 'orange' }]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.earningsButton}>
            <Text style={styles.earningsText}>Today: ₹1,250</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Safe Area for Bottom Panel */}
      <SafeAreaView style={styles.safeAreaBottom}>
        {/* Bottom Panel - Changes based on driver status */}
        <View style={[
          styles.bottomPanel,
          showRideRequest && styles.bottomPanelExpanded,
          activeRide && styles.bottomPanelExpanded
        ]}>
          {driverStatus === 'on-trip' && activeRide && (
            <View style={styles.tripContainer}>
              <Text style={styles.tripHeader}>Current Trip</Text>
              
              <View style={styles.passengerInfo}>
                <Image 
                  source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.passengerImage}
                />
                <View style={styles.passengerDetails}>
                  <Text style={styles.passengerName}>{activeRide.passenger.name}</Text>
                  <View style={styles.ratingContainer}>
                    <FontAwesome name="star" size={16} color="gold" />
                    <Text style={styles.ratingText}>{activeRide.passenger.rating}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.routeInfo}>
                <View style={styles.routeDot} />
                <View style={styles.routeLine} />
                <View style={[styles.routeDot, { backgroundColor: 'green' }]} />
                
                <View style={styles.routeTextContainer}>
                  <View style={styles.routeSection}>
                    <Text style={styles.routeAddress}>{activeRide.pickup.address}</Text>
                    <Text style={styles.routeLabel}>PICKUP</Text>
                  </View>
                  <View style={styles.routeSection}>
                    <Text style={styles.routeAddress}>{activeRide.destination.address}</Text>
                    <Text style={styles.routeLabel}>DESTINATION</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.completeButton} onPress={completeRide}>
                <Text style={styles.completeButtonText}>Complete Ride</Text>
              </TouchableOpacity>
            </View>
          )}

          {driverStatus === 'online' && !showRideRequest && (
            <View style={styles.waitingContainer}>
              <MaterialIcons name="local-taxi" size={50} color="#555" />
              <Text style={styles.waitingText}>Waiting for ride requests...</Text>
              <Text style={styles.waitingSubtext}>You'll be notified when a ride is available</Text>
            </View>
          )}

          {showRideRequest && (
            <View style={styles.rideRequestContainer}>
              <Text style={styles.rideRequestHeader}>New Ride Request</Text>
              
              <View style={styles.rideRequestInfo}>
                <View style={styles.passengerInfo}>
                  <Image 
                    source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                    style={styles.passengerImage}
                  />
                  <View style={styles.passengerDetails}>
                    <Text style={styles.passengerName}>{mockRideRequest.passenger.name}</Text>
                    <View style={styles.ratingContainer}>
                      <FontAwesome name="star" size={16} color="gold" />
                      <Text style={styles.ratingText}>{mockRideRequest.passenger.rating}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.rideDetails}>
                  <View style={styles.rideDetailRow}>
                    <Ionicons name="location" size={18} color="red" />
                    <View style={styles.rideDetailText}>
                      <Text style={styles.rideDetailAddress}>{mockRideRequest.pickup.address}</Text>
                      <Text style={styles.rideDetailDistance}>{mockRideRequest.pickup.distance}</Text>
                    </View>
                  </View>

                  <View style={styles.rideDetailRow}>
                    <Ionicons name="location" size={18} color="green" />
                    <View style={styles.rideDetailText}>
                      <Text style={styles.rideDetailAddress}>{mockRideRequest.destination.address}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.fareInfo}>
                  <Text style={styles.fareText}>Fare: {mockRideRequest.fare}</Text>
                  <Text style={styles.etaText}>ETA: {mockRideRequest.estimatedTime}</Text>
                </View>
              </View>

              <View style={styles.rideRequestButtons}>
                <TouchableOpacity style={styles.rejectButton} onPress={rejectRide}>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptButton} onPress={acceptRide}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeAreaHeader: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeAreaBottom: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statusButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusButtonText: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  earningsButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  earningsText: {
    fontWeight: 'bold',
  },
  bottomPanel: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: Dimensions.get('window').height * 0.35,
  },
  bottomPanelExpanded: {
    maxHeight: Dimensions.get('window').height * 0.45,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  waitingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  waitingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  rideRequestContainer: {
    width: '100%',
  },
  rideRequestHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  passengerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  passengerDetails: {
    marginLeft: 10,
  },
  passengerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
  },
  rideDetails: {
    marginBottom: 15,
  },
  rideDetailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  rideDetailText: {
    marginLeft: 10,
    flex: 1,
  },
  rideDetailAddress: {
    fontSize: 14,
  },
  rideDetailDistance: {
    fontSize: 12,
    color: '#666',
  },
  fareInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fareText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  etaText: {
    fontSize: 14,
    color: '#666',
  },
  rideRequestButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tripContainer: {
    width: '100%',
  },
  tripHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  routeInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 10,
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#ccc',
    marginRight: 10,
    marginVertical: 2,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeSection: {
    marginBottom: 15,
  },
  routeAddress: {
    fontSize: 14,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;