// src/features/passenger/home/components/ScheduleRideScreen.js
import { Feather, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useSchedule } from "../../../../contexts/ScheduleContext";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const GOOGLE_API_KEY = Constants?.manifest?.extra?.GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY";

/** ---------- Helpers ---------- **/
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // km
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getLocationIcon = (type) => {
  switch (type) {
    case "city":
      return "map";
    case "airport":
      return "send";
    case "transit":
      return "train";
    case "medical":
      return "heart";
    case "restaurant":
      return "coffee";
    case "gas_station":
      return "zap";
    case "bank":
      return "credit-card";
    case "education":
      return "book";
    case "landmark":
      return "camera";
    case "shopping":
      return "shopping-bag";
    case "custom":
      return "map-pin";
    default:
      return "map-pin";
  }
};

const getLocationIconColor = (type) => {
  switch (type) {
    case "city":
      return "#3b82f6";
    case "airport":
      return "#0ea5e9";
    case "transit":
      return "#2563eb";
    case "medical":
      return "#dc2626";
    case "restaurant":
      return "#f59e0b";
    case "gas_station":
      return "#10b981";
    case "bank":
      return "#8b5cf6";
    case "education":
      return "#06b6d4";
    case "landmark":
      return "#f97316";
    case "shopping":
      return "#ec4899";
    default:
      return "#4f46e5";
  }
};

/** ---------- Component ---------- **/
export default function ScheduleRideScreen() {
  const navigation = useNavigation();
  const { scheduledRides, addScheduledRide, deleteScheduledRide } = useSchedule();

  // Date/time
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState("date");

  // Locations & map
  const [pickupLocation, setPickupLocation] = useState("Current Location");
  const [destination, setDestination] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationType, setLocationType] = useState(null); // 'pickup' or 'destination'
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce refs
  const searchTimeoutRef = useRef(null);
  const placesSessionRef = useRef(null); // session token for autocomplete

  // route / distance
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [distance, setDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  // map ref
  const mapRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // ---------- Location helpers ----------
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location permission is required to set pickup location",
          [{ text: "OK", style: "default" }]
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(newLocation);
      setMapRegion({
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // reverse geocode (friendly address)
      let addressObj = await Location.reverseGeocodeAsync(newLocation);
      if (addressObj && addressObj.length > 0) {
        const a = addressObj[0];
        const addressStr = `${a.name || ""} ${a.street || ""}, ${a.city || a.region || ""}`.trim();
        setPickupLocation(addressStr || "Current Location");
      } else {
        setPickupLocation("Current Location");
      }
    } catch (err) {
      console.error("getCurrentLocation error:", err);
      Alert.alert("Error", "Failed to get current location", [
        { text: "Retry", onPress: () => getCurrentLocation() },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleSelectLocation = (type) => {
    setLocationType(type);
    setShowLocationModal(true);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedLocation(null);
    setRouteCoordinates([]);
    // create a new session token for Google Places Autocomplete
    placesSessionRef.current = `${Date.now()}`;
    // focus the input a little later
    setTimeout(() => {
      searchInputRef.current?.focus?.();
    }, 300);
    if (!currentLocation) getCurrentLocation();
  };

  const handleMapPress = async (e) => {
    const { coordinate } = e.nativeEvent;
    setSelectedLocation(coordinate);
    try {
      const addressArr = await Location.reverseGeocodeAsync(coordinate);
      let addressStr = `Selected Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`;
      if (addressArr?.length > 0) {
        const a = addressArr[0];
        addressStr = `${a.name || ""} ${a.street || ""}, ${a.city || a.region || ""}`.trim();
      }

      if (locationType === "pickup") setPickupLocation(addressStr);
      else setDestination(addressStr);

      if (currentLocation) {
        const dist = calculateDistance(currentLocation, coordinate);
        setDistance(dist);
        setEstimatedTime(Math.round((dist / 30) * 60)); // simple 30 km/h average
        setRouteCoordinates([currentLocation, coordinate]);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      if (locationType === "pickup")
        setPickupLocation(`Selected Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`);
      else setDestination(`Selected Location (${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)})`);
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // ---------- Search (Places Autocomplete) ----------
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce
    searchTimeoutRef.current = setTimeout(() => {
      if (text && text.length >= 2) {
        searchLocations(text);
      } else {
        setSearchResults([]);
      }
    }, 400);
  };

  const searchLocations = async (query) => {
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_GOOGLE_API_KEY") {
      Alert.alert("Missing API Key", "Set GOOGLE_API_KEY in app config and enable Places API.");
      return;
    }

    setIsSearching(true);
    try {
      // Use session token for better billing & grouping of requests (recommended)
      const sessionToken = placesSessionRef.current || `${Date.now()}`;

      // Add &components=country:pk if you want to restrict to a country — remove if global
      // Also consider adding &types=geocode or &types=establishment for filtering (deprecated in some use cases)
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_API_KEY}&sessiontoken=${sessionToken}&language=en&components=country:pk`;

      const res = await fetch(url);
      const data = await res.json();

      // Helpful debug:
      // console.log("autocomplete response", data);

      if (data?.predictions?.length > 0) {
        const results = data.predictions.map((p) => ({
          id: p.place_id,
          name: p.structured_formatting?.main_text || p.description,
          address: p.structured_formatting?.secondary_text || "",
          description: p.description,
          type: p.types && p.types.length > 0 ? p.types[0] : "custom",
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("searchLocations error:", err);
      Alert.alert("Error", "Failed to search locations. Check your API key and internet.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result) => {
    try {
      setIsSearching(true);
      Keyboard.dismiss();

      // fetch place details to get coordinates
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${result.id}&fields=geometry,name,formatted_address&key=${GOOGLE_API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData?.result?.geometry?.location) {
        const coordinate = {
          latitude: detailsData.result.geometry.location.lat,
          longitude: detailsData.result.geometry.location.lng,
        };

        setSelectedLocation(coordinate);
        setMapRegion({
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        const displayName =
          detailsData.result.name || result.name || detailsData.result.formatted_address || result.description;

        if (locationType === "pickup") setPickupLocation(displayName);
        else setDestination(displayName);

        if (currentLocation) {
          const dist = calculateDistance(currentLocation, coordinate);
          setDistance(dist);
          setEstimatedTime(Math.round((dist / 30) * 60));
          setRouteCoordinates([currentLocation, coordinate]);

          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitToCoordinates([currentLocation, coordinate], {
                edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
                animated: true,
              });
            }
          }, 500);
        }

        // Clear search
        setSearchResults([]);
        setSearchQuery("");
      } else {
        Alert.alert("Error", "Could not get location coordinates for this place");
      }
    } catch (err) {
      console.error("handleSelectSearchResult error:", err);
      Alert.alert("Error", "Failed to get place details");
    } finally {
      setIsSearching(false);
    }
  };

  // ---------- Date/time ----------
  const onChange = (event, selectedDate) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) setDate(selectedDate);
  };

  const showMode = (currentMode) => {
    setShowPicker(true);
    setMode(currentMode);
  };

  // ---------- Scheduling ----------
  const handleAddSchedule = () => {
    if (!destination) {
      Alert.alert("Error", "Please enter a destination");
      return;
    }
    if (new Date(date) < new Date()) {
      Alert.alert("Invalid Time", "You cannot schedule a ride in the past.");
      return;
    }

    const newSchedule = {
      date: new Date(date),
      destination,
      pickup: pickupLocation,
    };

    addScheduledRide(newSchedule);
    setDestination("");
    setSelectedLocation(null);
    Alert.alert("Success", "Ride scheduled successfully!");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteSchedule = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this scheduled ride?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteScheduledRide(id),
      },
    ]);
  };

  const renderScheduleItem = ({ item }) => (
    <View className="border border-gray-200 rounded-xl p-4 mb-3 bg-white shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-3">
          <Text className="text-gray-900 font-semibold text-base">
            {item.pickup} → {item.destination}
          </Text>
          <Text className="text-gray-500 text-sm">
            {new Date(item.date).toLocaleDateString()} at{" "}
            {new Date(item.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteSchedule(item.id)}>
          <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className="bg-indigo-50 py-3 rounded-lg items-center"
        onPress={() =>
          navigation.navigate("BookRide", {
            scheduledTime: item.date,
            pickup: item.pickup,
            destination: item.destination,
          })
        }
      >
        <Text className="text-indigo-700 font-semibold">Book Now</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
        <View className="flex-row items-center justify-between px-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Schedule Ride</Text>
          <View style={{ width: 32 }} />
        </View>
      </LinearGradient>

      {/* Content */}
      <View className="flex-1 p-4 pb-5">
        <Text className="text-gray-900 font-semibold text-lg mb-3">Your Scheduled Rides</Text>

        {scheduledRides.length > 0 ? (
          <FlatList data={scheduledRides} renderItem={renderScheduleItem} keyExtractor={(i) => i.id} style={{ marginBottom: 12 }} />
        ) : (
          <View className="border border-gray-200 rounded-xl p-6 items-center mb-4 bg-gray-50">
            <MaterialIcons name="schedule" size={44} color="#d1d5db" />
            <Text className="text-gray-500 mt-3">No scheduled rides yet</Text>
          </View>
        )}

        <Text className="text-gray-900 font-semibold text-lg mt-2 mb-3">Schedule New Ride</Text>

        {/* Location Inputs */}
        <View className="mb-4">
          <TouchableOpacity className="border border-gray-200 rounded-xl p-4 mb-3 bg-white" onPress={() => handleSelectLocation("pickup")}>
            <Text className="text-sm text-gray-500 mb-2">Pickup Location</Text>
            <View className="flex-row justify-between items-center">
              <Text numberOfLines={1} className="text-gray-900 font-semibold mr-3">
                {pickupLocation}
              </Text>
              <FontAwesome name="map-marker" size={20} color="#4f46e5" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-200 rounded-xl p-4 bg-white" onPress={() => handleSelectLocation("destination")}>
            <Text className="text-sm text-gray-500 mb-2">Destination</Text>
            <View className="flex-row justify-between items-center">
              {destination ? (
                <Text numberOfLines={1} className="text-gray-900 font-semibold mr-3">
                  {destination}
                </Text>
              ) : (
                <Text className="text-gray-400 mr-3">Where to?</Text>
              )}
              <FontAwesome name="search" size={20} color="#4f46e5" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Date/Time */}
        <View className="mb-6">
          <TouchableOpacity className="border border-gray-200 rounded-xl p-4 mb-3 bg-white" onPress={() => showMode("date")}>
            <Text className="text-sm text-gray-500 mb-2">Pickup Date</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-semibold">{date.toLocaleDateString()}</Text>
              <MaterialIcons name="calendar-today" size={20} color="#4f46e5" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="border border-gray-200 rounded-xl p-4 bg-white" onPress={() => showMode("time")}>
            <Text className="text-sm text-gray-500 mb-2">Pickup Time</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-900 font-semibold">{date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
              <MaterialIcons name="access-time" size={20} color="#4f46e5" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mt-2">
          <TouchableOpacity className={`flex-1 mr-3 py-4 rounded-xl items-center ${!destination ? "opacity-60" : ""}`} style={{ backgroundColor: "#4f46e5" }} onPress={handleAddSchedule} disabled={!destination}>
            <Text className="text-white font-semibold">Add Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-4 rounded-xl items-center ${!destination ? "opacity-60" : ""}`}
            style={{ backgroundColor: "#e0e7ff" }}
            onPress={() => navigation.navigate("BookRide", { scheduledTime: date, pickup: pickupLocation, destination })}
            disabled={!destination}
          >
            <Text className="text-indigo-700 font-semibold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DateTime Picker */}
      {showPicker && (
        <DateTimePicker value={date} mode={mode} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChange} minimumDate={new Date()} />
      )}

      {/* Location Modal */}
      <Modal visible={showLocationModal} animationType="slide" onRequestClose={() => setShowLocationModal(false)}>
        <View className="flex-1 bg-white">
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.modalHeaderGradient}>
            <View className="flex-row items-center justify-between px-4">
              <TouchableOpacity onPress={() => setShowLocationModal(false)} className="p-2">
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white font-semibold text-base">Select {locationType === "pickup" ? "Pickup" : "Destination"} Location</Text>
              <View style={{ width: 32 }} />
            </View>
          </LinearGradient>

          <View className="p-4 border-b border-gray-200">
            <BlurView intensity={80} className="rounded-xl overflow-hidden border border-gray-200">
              <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-3">
                <View className="flex-row items-center">
                  <MaterialIcons name="search" size={20} color="#4f46e5" />
                  <TextInput
                    ref={searchInputRef}
                    style={{ flex: 1, marginLeft: 12, fontSize: 16, color: "#111827", paddingVertical: 0 }}
                    placeholder={`Search for ${locationType === "pickup" ? "pickup" : "destination"} location`}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor="#9ca3af"
                    autoFocus={true}
                  />
                  {isSearching && <ActivityIndicator size="small" color="#6b7280" />}
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Map or Results */}
          {mapRegion && searchResults.length === 0 ? (
            <View style={styles.mapContainer}>
              <MapView ref={mapRef} style={styles.map} provider={PROVIDER_GOOGLE} region={mapRegion} onPress={handleMapPress} showsUserLocation={true}>
                {currentLocation && (
                  <Marker coordinate={currentLocation}>
                    <View style={styles.currentLocationMarker}>
                      <View style={styles.currentLocationInnerMarker} />
                    </View>
                  </Marker>
                )}
                {selectedLocation && (
                  <Marker coordinate={selectedLocation}>
                    <View style={styles.selectedLocationMarker}>
                      <MaterialIcons name="place" size={20} color="white" />
                    </View>
                  </Marker>
                )}
                {routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeColor="#4f46e5" strokeWidth={4} lineDashPattern={[10, 5]} />}
              </MapView>

              {/* My location button */}
              {currentLocation && (
                <TouchableOpacity
                  style={styles.myLocationButton}
                  onPress={() =>
                    mapRef.current?.animateToRegion(
                      {
                        ...currentLocation,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                      },
                      1000
                    )
                  }
                >
                  <MaterialIcons name="my-location" size={24} color="#4f46e5" />
                </TouchableOpacity>
              )}
            </View>
          ) : null}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View className="flex-1 bg-white">
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100" onPress={() => handleSelectSearchResult(item)}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        marginRight: 12,
                        backgroundColor: `${getLocationIconColor(item.type)}15`,
                        borderColor: `${getLocationIconColor(item.type)}30`,
                      }}
                    >
                      <Feather name={getLocationIcon(item.type)} size={20} color={getLocationIconColor(item.type)} />
                    </View>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 }}>{item.name}</Text>
                      <Text style={{ fontSize: 14, color: "#6b7280" }} numberOfLines={1}>
                        {item.address || item.description}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* Confirm bottom sheet when selected */}
          {selectedLocation && (
            <View style={styles.confirmButtonContainer}>
              <BlurView intensity={80} style={{ borderRadius: 16 }} className="overflow-hidden border border-gray-200">
                <LinearGradient colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]} className="p-4">
                  <View style={{ marginBottom: 12 }}>
                    {/* If using place details you'd set selectedLocation.name; here we show coordinates */}
                    <Text style={styles.locationName}>Selected Location</Text>
                    {distance > 0 && (
                      <View style={styles.distanceInfo}>
                        <View style={styles.distanceItem}>
                          <Feather name="map-pin" size={16} color="#6b7280" />
                          <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
                        </View>
                        <View style={styles.distanceItem}>
                          <MaterialIcons name="access-time" size={16} color="#6b7280" />
                          <Text style={styles.distanceText}>~{estimatedTime} min</Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      // Save the selected location permanently for the field (already set earlier in many flows)
                      setShowLocationModal(false);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Confirm Location</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </BlurView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

/** ---------- Styles (map & a few things nativewind not ideal for) ---------- **/
const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 44 : 16,
    paddingBottom: 16,
    // paddingHorizontal done in child
  },
  modalHeaderGradient: {
    paddingTop: Platform.OS === "ios" ? 44 : 16,
    paddingBottom: 16,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4f46e5",
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  currentLocationInnerMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  selectedLocationMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  myLocationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  distanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  distanceItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});