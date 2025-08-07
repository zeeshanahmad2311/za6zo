// src/contexts/ScheduleContext.js
import * as Haptics from 'expo-haptics';
import { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [scheduledRides, setScheduledRides] = useState([
    {
      id: "1",
      date: new Date(Date.now() + 86400000),
      destination: "Central Park",
      pickup: "Home",
    },
    {
      id: "2",
      date: new Date(Date.now() + 172800000),
      destination: "JFK Airport",
      pickup: "Office",
    },
  ]);

  const addScheduledRide = (newRide) => {
    const rideWithId = {
      ...newRide,
      id: Date.now().toString()
    };
    setScheduledRides(prev => [...prev, rideWithId]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return rideWithId;
  };

  const deleteScheduledRide = (id) => {
    setScheduledRides(prev => prev.filter(r => r.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const confirmDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this scheduled ride?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteScheduledRide(id),
      },
    ]);
  };

  return (
    <ScheduleContext.Provider value={{ 
      scheduledRides, 
      addScheduledRide, 
      deleteScheduledRide,
      confirmDelete
    }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);