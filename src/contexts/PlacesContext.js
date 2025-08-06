// src/contexts/PlacesContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

const PlacesContext = createContext();

export const PlacesProvider = ({ children }) => {
  const [savedPlaces, setSavedPlaces] = useState([]);

  // Load saved places on app start
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@saved_places');
        if (jsonValue !== null) {
          setSavedPlaces(JSON.parse(jsonValue));
        }
      } catch (e) {
        console.error('Failed to load places', e);
      }
    };
    loadPlaces();
  }, []);

  // Save to storage whenever places change
  useEffect(() => {
    const savePlaces = async () => {
      try {
        const jsonValue = JSON.stringify(savedPlaces);
        await AsyncStorage.setItem('@saved_places', jsonValue);
      } catch (e) {
        console.error('Failed to save places', e);
      }
    };
    savePlaces();
  }, [savedPlaces]);

  const addPlace = async (newPlace) => {
    const placeWithId = {
      ...newPlace,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setSavedPlaces(prev => [...prev, placeWithId]);
    return placeWithId;
  };

  const deletePlace = (id) => {
    setSavedPlaces(prev => prev.filter(place => place.id !== id));
  };

  return (
    <PlacesContext.Provider value={{ 
      savedPlaces, 
      addPlace, 
      deletePlace 
    }}>
      {children}
    </PlacesContext.Provider>
  );
};

export const usePlaces = () => React.useContext(PlacesContext);