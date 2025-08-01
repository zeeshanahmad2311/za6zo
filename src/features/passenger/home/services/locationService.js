"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"

// Configuration
let GOOGLE_PLACES_API_KEY = null
let MAPBOX_ACCESS_TOKEN = null

// Initialize API keys from storage
const initializeApiKeys = async () => {
  try {
    const googleKey = await AsyncStorage.getItem("GOOGLE_PLACES_API_KEY")
    const mapboxToken = await AsyncStorage.getItem("MAPBOX_ACCESS_TOKEN")

    if (googleKey) GOOGLE_PLACES_API_KEY = googleKey
    if (mapboxToken) MAPBOX_ACCESS_TOKEN = mapboxToken
  } catch (error) {
    console.error("Error loading API keys:", error)
  }
}

// Initialize on module load
initializeApiKeys()

// API Base URLs
const GOOGLE_PLACES_BASE_URL = "https://maps.googleapis.com/maps/api/place"
const MAPBOX_BASE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/search"

/**
 * Search locations using Google Places API (Worldwide)
 */
export const searchLocationsGoogle = async (query, userLocation = null) => {
  try {
    if (!query || query.trim().length < 2) return []
    if (!GOOGLE_PLACES_API_KEY) return []

    // Use text search for worldwide results
    const location = userLocation ? `&location=${userLocation.latitude},${userLocation.longitude}` : ""
    const radius = userLocation ? "&radius=50000" : "" // 50km radius

    const url = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=${encodeURIComponent(query)}${location}${radius}&key=${GOOGLE_PLACES_API_KEY}`

    console.log("Google Places URL:", url.replace(GOOGLE_PLACES_API_KEY, "***"))

    const response = await fetch(url)
    const data = await response.json()

    console.log("Google Places Response:", data.status, data.results?.length || 0)

    if (data.status === "OK" && data.results) {
      return data.results.slice(0, 20).map((place) => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinate: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        type: getPlaceType(place.types),
        rating: place.rating || null,
        photos: place.photos ? place.photos.slice(0, 1) : [],
        businessStatus: place.business_status,
        priceLevel: place.price_level,
        source: "google",
      }))
    }

    if (data.status === "ZERO_RESULTS") {
      console.log("Google Places: No results found")
    } else if (data.status !== "OK") {
      console.error("Google Places API Error:", data.status, data.error_message)
    }

    return []
  } catch (error) {
    console.error("Google Places API error:", error)
    return []
  }
}

/**
 * Search locations using Mapbox Geocoding API (Worldwide)
 */
export const searchLocationsMapbox = async (query, userLocation = null) => {
  try {
    if (!query || query.trim().length < 2) return []
    if (!MAPBOX_ACCESS_TOKEN) return []

    const proximity = userLocation ? `&proximity=${userLocation.longitude},${userLocation.latitude}` : ""
    // Remove country restriction for worldwide search
    const url = `${MAPBOX_BASE_URL}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=20&types=poi,address,place${proximity}`

    console.log("Mapbox URL:", url.replace(MAPBOX_ACCESS_TOKEN, "***"))

    const response = await fetch(url)
    const data = await response.json()

    console.log("Mapbox Response:", data.features?.length || 0, "results")

    if (data.features) {
      return data.features.map((feature) => ({
        id: feature.id,
        name: feature.text,
        address: feature.place_name,
        coordinate: {
          latitude: feature.center[1],
          longitude: feature.center[0],
        },
        type: getMapboxPlaceType(feature.place_type),
        category: feature.properties?.category,
        source: "mapbox",
      }))
    }

    return []
  } catch (error) {
    console.error("Mapbox API error:", error)
    return []
  }
}

/**
 * Search locations using OpenStreetMap Nominatim API (Worldwide)
 */
export const searchLocationsNominatim = async (query, userLocation = null) => {
  try {
    if (!query || query.trim().length < 2) return []

    // Remove country restriction for worldwide search
    const viewbox = userLocation
      ? `&viewbox=${userLocation.longitude - 2},${userLocation.latitude + 2},${userLocation.longitude + 2},${userLocation.latitude - 2}&bounded=0`
      : ""

    const url = `${NOMINATIM_BASE_URL}?q=${encodeURIComponent(query)}&format=json&limit=20&addressdetails=1&extratags=1${viewbox}`

    console.log("Nominatim URL:", url)

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Za6zo-RideApp/1.0 (contact@za6zo.com)",
      },
    })
    const data = await response.json()

    console.log("Nominatim Response:", data.length, "results")

    return data.map((place) => ({
      id: place.place_id.toString(),
      name: place.display_name.split(",")[0],
      address: place.display_name,
      coordinate: {
        latitude: Number.parseFloat(place.lat),
        longitude: Number.parseFloat(place.lon),
      },
      type: getNominatimPlaceType(place.type, place.class),
      importance: place.importance,
      category: place.category,
      source: "nominatim",
    }))
  } catch (error) {
    console.error("Nominatim API error:", error)
    return []
  }
}

/**
 * Enhanced search with worldwide locations
 */
export const searchWorldwideLocations = async (query, userLocation = null) => {
  try {
    if (!query || query.trim().length < 2) return []

    // Worldwide major cities and landmarks
    const worldwidePlaces = [
      // Pakistan
      { name: "Karachi", address: "Karachi, Sindh, Pakistan", lat: 24.8607, lng: 67.0011, country: "🇵🇰", type: "city" },
      { name: "Lahore", address: "Lahore, Punjab, Pakistan", lat: 31.5204, lng: 74.3587, country: "🇵🇰", type: "city" },
      { name: "Islamabad", address: "Islamabad, Pakistan", lat: 33.6844, lng: 73.0479, country: "🇵🇰", type: "city" },
      {
        name: "Karachi Airport",
        address: "Jinnah International Airport, Karachi",
        lat: 24.9056,
        lng: 67.1608,
        country: "🇵🇰",
        type: "airport",
      },
      {
        name: "Lahore Airport",
        address: "Allama Iqbal International Airport, Lahore",
        lat: 31.5217,
        lng: 74.4036,
        country: "🇵🇰",
        type: "airport",
      },
      {
        name: "Badshahi Mosque",
        address: "Walled City, Lahore, Pakistan",
        lat: 31.5881,
        lng: 74.3142,
        country: "🇵🇰",
        type: "landmark",
      },
      {
        name: "Faisal Mosque",
        address: "Islamabad, Pakistan",
        lat: 33.7294,
        lng: 73.0367,
        country: "🇵🇰",
        type: "landmark",
      },

      // India
      { name: "Mumbai", address: "Mumbai, Maharashtra, India", lat: 19.076, lng: 72.8777, country: "🇮🇳", type: "city" },
      { name: "Delhi", address: "New Delhi, India", lat: 28.6139, lng: 77.209, country: "🇮🇳", type: "city" },
      {
        name: "Bangalore",
        address: "Bengaluru, Karnataka, India",
        lat: 12.9716,
        lng: 77.5946,
        country: "🇮🇳",
        type: "city",
      },
      {
        name: "Taj Mahal",
        address: "Agra, Uttar Pradesh, India",
        lat: 27.1751,
        lng: 78.0421,
        country: "🇮🇳",
        type: "landmark",
      },

      // UAE
      {
        name: "Dubai",
        address: "Dubai, United Arab Emirates",
        lat: 25.2048,
        lng: 55.2708,
        country: "🇦🇪",
        type: "city",
      },
      {
        name: "Abu Dhabi",
        address: "Abu Dhabi, United Arab Emirates",
        lat: 24.4539,
        lng: 54.3773,
        country: "🇦🇪",
        type: "city",
      },
      { name: "Burj Khalifa", address: "Dubai, UAE", lat: 25.1972, lng: 55.2744, country: "🇦🇪", type: "landmark" },

      // Saudi Arabia
      { name: "Riyadh", address: "Riyadh, Saudi Arabia", lat: 24.7136, lng: 46.6753, country: "🇸🇦", type: "city" },
      { name: "Jeddah", address: "Jeddah, Saudi Arabia", lat: 21.4858, lng: 39.1925, country: "🇸🇦", type: "city" },
      { name: "Mecca", address: "Makkah, Saudi Arabia", lat: 21.3891, lng: 39.8579, country: "🇸🇦", type: "landmark" },

      // USA
      { name: "New York", address: "New York, NY, USA", lat: 40.7128, lng: -74.006, country: "🇺🇸", type: "city" },
      {
        name: "Los Angeles",
        address: "Los Angeles, CA, USA",
        lat: 34.0522,
        lng: -118.2437,
        country: "🇺🇸",
        type: "city",
      },
      {
        name: "Times Square",
        address: "Times Square, New York, NY",
        lat: 40.758,
        lng: -73.9855,
        country: "🇺🇸",
        type: "landmark",
      },

      // UK
      { name: "London", address: "London, United Kingdom", lat: 51.5074, lng: -0.1278, country: "🇬🇧", type: "city" },
      {
        name: "Manchester",
        address: "Manchester, United Kingdom",
        lat: 53.4808,
        lng: -2.2426,
        country: "🇬🇧",
        type: "city",
      },
      {
        name: "Big Ben",
        address: "Westminster, London, UK",
        lat: 51.4994,
        lng: -0.1245,
        country: "🇬🇧",
        type: "landmark",
      },

      // Other major cities
      { name: "Tokyo", address: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "🇯🇵", type: "city" },
      { name: "Paris", address: "Paris, France", lat: 48.8566, lng: 2.3522, country: "🇫🇷", type: "city" },
      { name: "Sydney", address: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "🇦🇺", type: "city" },
      { name: "Singapore", address: "Singapore", lat: 1.3521, lng: 103.8198, country: "🇸🇬", type: "city" },
      { name: "Hong Kong", address: "Hong Kong", lat: 22.3193, lng: 114.1694, country: "🇭🇰", type: "city" },
    ]

    // Filter worldwide places based on query
    const filteredWorldwidePlaces = worldwidePlaces
      .filter(
        (place) =>
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          place.address.toLowerCase().includes(query.toLowerCase()),
      )
      .map((place) => ({
        id: `worldwide_${place.name.replace(/\s+/g, "_").toLowerCase()}`,
        name: place.name,
        address: place.address,
        coordinate: {
          latitude: place.lat,
          longitude: place.lng,
        },
        type: place.type,
        country: place.country,
        isWorldwidePlace: true,
        source: "builtin",
      }))

    return filteredWorldwidePlaces
  } catch (error) {
    console.error("Worldwide locations search error:", error)
    return []
  }
}

/**
 * Main search function that tries multiple sources (Worldwide)
 */
export const searchLocations = async (query, userLocation = null) => {
  try {
    console.log("Searching for:", query, "with user location:", userLocation ? "Yes" : "No")

    let allResults = []

    // First, search built-in worldwide places
    const worldwideResults = await searchWorldwideLocations(query, userLocation)
    allResults = [...worldwideResults]

    // Try Google Places API (worldwide)
    if (GOOGLE_PLACES_API_KEY) {
      const googleResults = await searchLocationsGoogle(query, userLocation)
      allResults = [...allResults, ...googleResults]
    }

    // Try Mapbox API (worldwide)
    if (MAPBOX_ACCESS_TOKEN) {
      const mapboxResults = await searchLocationsMapbox(query, userLocation)
      allResults = [...allResults, ...mapboxResults]
    }

    // Always try Nominatim as fallback (worldwide)
    const nominatimResults = await searchLocationsNominatim(query, userLocation)
    allResults = [...allResults, ...nominatimResults]

    // Remove duplicates and limit results
    const uniqueResults = allResults.filter(
      (result, index, self) => index === self.findIndex((r) => r.name === result.name && r.address === result.address),
    )

    // Sort results: Pakistan first, then by relevance
    const sortedResults = uniqueResults.sort((a, b) => {
      // Pakistan locations first
      if (a.country === "🇵🇰" && b.country !== "🇵🇰") return -1
      if (b.country === "🇵🇰" && a.country !== "🇵🇰") return 1

      // Then by source priority (builtin > google > mapbox > nominatim)
      const sourcePriority = { builtin: 0, google: 1, mapbox: 2, nominatim: 3 }
      return (sourcePriority[a.source] || 4) - (sourcePriority[b.source] || 4)
    })

    console.log("Total unique results:", sortedResults.length)
    return sortedResults.slice(0, 25) // Increased limit for more results
  } catch (error) {
    console.error("Location search error:", error)
    return []
  }
}

/**
 * Get nearby places based on user location (Worldwide)
 */
export const getNearbyPlaces = async (userLocation, type = "restaurant|gas_station|hospital|atm") => {
  try {
    let nearbyResults = []

    // Try Google Places first
    if (GOOGLE_PLACES_API_KEY) {
      const url = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${userLocation.latitude},${userLocation.longitude}&radius=10000&type=${type}&key=${GOOGLE_PLACES_API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results) {
        nearbyResults = data.results.slice(0, 10).map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          coordinate: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          type: getPlaceType(place.types),
          rating: place.rating || null,
          priceLevel: place.price_level,
          isOpen: place.opening_hours?.open_now,
          source: "google",
        }))
      }
    }

    // If no results from Google, use generic nearby places
    if (nearbyResults.length === 0) {
      const genericNearbyPlaces = [
        { name: "Hospital", type: "medical", distance: "2.5 km" },
        { name: "Gas Station", type: "gas_station", distance: "1.8 km" },
        { name: "ATM", type: "bank", distance: "0.5 km" },
        { name: "Restaurant", type: "restaurant", distance: "1.2 km" },
        { name: "Pharmacy", type: "medical", distance: "0.8 km" },
        { name: "Shopping Center", type: "shopping", distance: "1.5 km" },
        { name: "School", type: "education", distance: "2.0 km" },
        { name: "Park", type: "landmark", distance: "1.0 km" },
      ].map((place, index) => ({
        id: `nearby_${index}`,
        name: place.name,
        address: `${place.distance} from your location`,
        coordinate: {
          latitude: userLocation.latitude + (Math.random() - 0.5) * 0.01,
          longitude: userLocation.longitude + (Math.random() - 0.5) * 0.01,
        },
        type: place.type,
        isNearbyPlace: true,
        source: "builtin",
      }))

      nearbyResults = genericNearbyPlaces
    }

    return nearbyResults
  } catch (error) {
    console.error("Nearby places error:", error)
    return []
  }
}

/**
 * Reverse geocoding - get address from coordinates (Worldwide)
 */
export const reverseGeocode = async (coordinate) => {
  try {
    // Try Google Geocoding first
    if (GOOGLE_PLACES_API_KEY) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate.latitude},${coordinate.longitude}&key=${GOOGLE_PLACES_API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status === "OK" && data.results.length > 0) {
        const result = data.results[0]
        return {
          name: result.address_components[0]?.long_name || "Selected Location",
          address: result.formatted_address,
          coordinate: coordinate,
        }
      }
    }

    // Fallback to Nominatim (worldwide)
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${coordinate.latitude}&lon=${coordinate.longitude}&format=json`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Za6zo-RideApp/1.0 (contact@za6zo.com)",
      },
    })
    const data = await response.json()

    return {
      name: data.name || data.display_name?.split(",")[0] || "Selected Location",
      address: data.display_name || `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
      coordinate: coordinate,
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return {
      name: "Selected Location",
      address: `${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
      coordinate: coordinate,
    }
  }
}

// Helper functions (same as before but with additional types)
const getPlaceType = (types) => {
  if (!types) return "place"

  if (types.includes("airport")) return "airport"
  if (types.includes("transit_station") || types.includes("subway_station") || types.includes("train_station")) {
    return "transit"
  }
  if (types.includes("hospital") || types.includes("pharmacy")) {
    return "medical"
  }
  if (types.includes("restaurant") || types.includes("food")) {
    return "restaurant"
  }
  if (types.includes("gas_station")) {
    return "gas_station"
  }
  if (types.includes("bank") || types.includes("atm")) {
    return "bank"
  }
  if (types.includes("school") || types.includes("university")) {
    return "education"
  }
  if (types.includes("tourist_attraction") || types.includes("museum")) {
    return "landmark"
  }
  if (types.includes("shopping_mall") || types.includes("store")) {
    return "shopping"
  }
  if (types.includes("locality") || types.includes("administrative_area_level_1")) {
    return "city"
  }

  return "place"
}

const getMapboxPlaceType = (placeTypes) => {
  if (!placeTypes) return "place"

  if (placeTypes.includes("poi")) return "landmark"
  if (placeTypes.includes("address")) return "address"
  if (placeTypes.includes("place")) return "city"
  return "place"
}

const getNominatimPlaceType = (type, category) => {
  if (category === "amenity") {
    if (type === "restaurant" || type === "cafe" || type === "fast_food") return "restaurant"
    if (type === "hospital" || type === "pharmacy") return "medical"
    if (type === "fuel") return "gas_station"
    if (type === "bank" || type === "atm") return "bank"
    if (type === "school" || type === "university") return "education"
  }

  if (category === "tourism") return "landmark"
  if (category === "shop") return "shopping"
  if (category === "railway" || category === "public_transport") return "transit"
  if (category === "aeroway") return "airport"
  if (category === "place") return "city"

  return "place"
}

// Export function to refresh API keys
export const refreshApiKeys = async () => {
  await initializeApiKeys()
}
