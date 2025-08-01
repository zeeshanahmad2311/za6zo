"use client"

import * as Location from "expo-location"
import { useEffect, useState } from "react"

export const useLocationPermission = () => {
  const [hasPermission, setHasPermission] = useState(false)
  const [currentLocation, setCurrentLocation] = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        setHasPermission(status === "granted")

        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({})
          setCurrentLocation(location)
        }
      } catch (error) {
        console.error("Location permission error:", error)
      }
    })()
  }, [])

  return { hasPermission, currentLocation }
}
